/**
 * Prototype Data Sharing Utilities
 * Handles exporting/importing prototype state via key-value store
 */

class PrototypeShare {
  constructor() {
    this.apiEndpoint = this.getApiEndpoint();
    // GitHub configuration
    this.github = {
      owner: 'khoi-stripe', // Your GitHub username
      repo: 'stripe-dash',  // Your repository name
      apiUrl: 'https://api.github.com'
    };
  }

  getApiEndpoint() {
    // Always use GitHub API for storage
    return 'github';
  }

  async sharePrototype() {
    try {
      // Collect current prototype state
      const shareData = await this.exportCurrentState();
      
      // Store via GitHub Issues API
      const response = await this.createGitHubIssue(shareData);
      
      return {
        success: true,
        shareId: response.shareId,
        shareUrl: response.shareUrl,
        issueNumber: response.issueNumber
      };
      
    } catch (error) {
      console.error('Failed to share prototype:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createGitHubIssue(shareData) {
    const shareId = this.generateShareId();
    const issueTitle = `[Prototype Share] ${shareId}`;
    const issueBody = this.formatIssueBody(shareData, shareId);
    
    // Try to create GitHub issue
    const issueUrl = `${this.github.apiUrl}/repos/${this.github.owner}/${this.github.repo}/issues`;
    
    try {
      const response = await fetch(issueUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: ['prototype-share', 'auto-generated']
        })
      });

      if (response.ok) {
        // GitHub issue creation succeeded
        const issue = await response.json();
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
        
        return {
          shareId,
          shareUrl,
          issueNumber: issue.number,
          issueUrl: issue.html_url,
          method: 'github'
        };
      } else {
        // GitHub issue creation failed, fall back to URL encoding
        console.warn('GitHub issue creation failed, using URL fallback');
        return this.createUrlShare(shareData, shareId);
      }
    } catch (error) {
      // Network or other error, fall back to URL encoding
      console.warn('GitHub API unavailable, using URL fallback:', error.message);
      return this.createUrlShare(shareData, shareId);
    }
  }

  createUrlShare(shareData, shareId) {
    // Fallback: store data in localStorage with expiry
    const shareKey = `prototype_share_${shareId}`;
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    const storeData = {
      data: shareData,
      expiresAt: expiryTime,
      createdAt: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem(shareKey, JSON.stringify(storeData));
    
    // Clean up old shares while we're at it
    this.cleanupExpiredShares();
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
    
    return {
      shareId,
      shareUrl,
      method: 'localStorage',
      issueNumber: null,
      issueUrl: null
    };
  }

  formatIssueBody(shareData, shareId) {
    const timestamp = new Date().toISOString();
    return `## Prototype Share: ${shareId}

**Created:** ${timestamp}
**Share URL:** ${window.location.origin}${window.location.pathname}?share=${shareId}

### Prototype Data

\`\`\`json
${JSON.stringify(shareData, null, 2)}
\`\`\`

---
*This issue was automatically created by the UXR prototype sharing system.*
*Share ID: \`${shareId}\`*`;
  }

  generateShareId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async loadSharedPrototype(shareId) {
    try {
      // First try localStorage
      const localResult = await this.loadFromLocalStorage(shareId);
      if (localResult.success) {
        return localResult;
      }
      
      // Fall back to GitHub Issues API
      const issueData = await this.findGitHubIssue(shareId);
      
      if (!issueData) {
        throw new Error('Share not found or expired');
      }
      
      // Extract prototype data from issue body
      const prototypeData = this.extractDataFromIssue(issueData);
      
      // Import the shared data
      await this.importSharedState(prototypeData);
      
      return {
        success: true,
        data: prototypeData,
        createdAt: issueData.created_at,
        issueUrl: issueData.html_url
      };
      
    } catch (error) {
      console.error('Failed to load shared prototype:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async loadFromLocalStorage(shareId) {
    try {
      const shareKey = `prototype_share_${shareId}`;
      const storedData = localStorage.getItem(shareKey);
      
      if (!storedData) {
        return { success: false, error: 'Share not found' };
      }
      
      const storeData = JSON.parse(storedData);
      
      // Check if expired
      if (Date.now() > storeData.expiresAt) {
        localStorage.removeItem(shareKey);
        return { success: false, error: 'Share expired' };
      }
      
      // Import the shared data
      await this.importSharedState(storeData.data);
      
      return {
        success: true,
        data: storeData.data,
        createdAt: storeData.createdAt,
        source: 'localStorage'
      };
      
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return { success: false, error: error.message };
    }
  }

  async findGitHubIssue(shareId) {
    // Search for issues with the specific share ID in the title
    const searchQuery = `repo:${this.github.owner}/${this.github.repo} is:issue "[Prototype Share] ${shareId}" in:title`;
    const searchUrl = `${this.github.apiUrl}/search/issues?q=${encodeURIComponent(searchQuery)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub search error: ${response.status}`);
    }

    const searchResults = await response.json();
    
    if (searchResults.total_count === 0) {
      return null;
    }

    // Return the first (and should be only) matching issue
    return searchResults.items[0];
  }

  extractDataFromIssue(issue) {
    // Extract JSON data from the issue body
    const body = issue.body;
    
    // Find the JSON code block
    const jsonMatch = body.match(/```json\n([\s\S]*?)\n```/);
    
    if (!jsonMatch) {
      throw new Error('Invalid issue format - no JSON data found');
    }

    try {
      return JSON.parse(jsonMatch[1]);
    } catch (error) {
      throw new Error('Invalid JSON data in issue');
    }
  }

  async exportCurrentState() {
    // Wait for OrgDataManager to be ready
    if (window.OrgDataManager && window.OrgDataManager.initPromise) {
      await window.OrgDataManager.initPromise;
    }

    const currentOrg = window.OrgDataManager?.getCurrentOrganization();
    const currentAccount = window.OrgDataManager?.getCurrentSubAccount();
    
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      organizations: window.OrgDataManager?.organizations || [],
      accountGroups: window.OrgDataManager?.getAccountGroups() || [],
      currentState: {
        organizationName: currentOrg?.name,
        subAccountId: currentAccount?.id
      },
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href.split('?')[0], // Base URL without params
        exportedFrom: 'prototype-control-panel'
      }
    };
  }

  async importSharedState(sharedData) {
    try {
      // Validate shared data
      if (!sharedData || !sharedData.organizations) {
        throw new Error('Invalid shared data format');
      }

      // Import organizations
      if (window.OrgDataManager) {
        // Set organizations directly
        window.OrgDataManager.organizations = sharedData.organizations;
        window.OrgDataManager.accountGroups = sharedData.accountGroups || [];

        // Restore current state if provided
        if (sharedData.currentState) {
          const { organizationName, subAccountId } = sharedData.currentState;
          
          if (organizationName) {
            const org = window.OrgDataManager.getOrganizationByName(organizationName);
            if (org) {
              window.OrgDataManager.setCurrentOrganization(org);
              
              if (subAccountId) {
                const account = window.OrgDataManager.getSubAccountById(subAccountId);
                if (account) {
                  window.OrgDataManager.setCurrentSubAccount(account);
                }
              }
            }
          }
        }

        // Save to localStorage for persistence
        localStorage.setItem('uxr_organizations_data', JSON.stringify(sharedData.organizations));
        if (sharedData.accountGroups.length > 0) {
          // Save account groups per organization
          sharedData.organizations.forEach(org => {
            const orgGroups = sharedData.accountGroups.filter(g => 
              g.organizationName === org.name
            );
            if (orgGroups.length > 0) {
              localStorage.setItem(`uxr_account_groups_${org.name}`, JSON.stringify(orgGroups));
            }
          });
        }

        // Trigger data refresh on current page
        if (typeof window.loadAccountGroups === 'function') {
          window.loadAccountGroups();
        }
        if (typeof window.updateAccountSwitcher === 'function') {
          window.updateAccountSwitcher();
        }
        if (typeof window.updateActiveAccountsCard === 'function') {
          window.updateActiveAccountsCard();
        }
      }

      console.log('Successfully imported shared prototype data:', sharedData.metadata);
      return true;
      
    } catch (error) {
      console.error('Failed to import shared state:', error);
      throw error;
    }
  }

  // Check URL for share parameter on page load
  async checkForSharedData() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    const encodedData = urlParams.get('data');
    
    if (shareId) {
      console.log('Loading shared prototype via ID:', shareId);
      const result = await this.loadSharedPrototype(shareId);
      
      if (result.success) {
        // Clean URL to remove share parameter
        const cleanUrl = new URL(window.location);
        cleanUrl.searchParams.delete('share');
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Show success message
        this.showShareLoadMessage(result.createdAt, result.issueUrl, result.source);
      } else {
        // Show error message
        this.showShareErrorMessage(result.error);
      }
      
      return result.success;
    } else if (encodedData) {
      console.log('Loading shared prototype via URL data');
      const result = await this.loadEncodedData(encodedData);
      
      if (result.success) {
        // Clean URL to remove data parameter
        const cleanUrl = new URL(window.location);
        cleanUrl.searchParams.delete('data');
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Show success message
        this.showShareLoadMessage(result.createdAt);
      } else {
        // Show error message
        this.showShareErrorMessage(result.error);
      }
      
      return result.success;
    }
    
    return false;
  }

  async loadEncodedData(encodedData) {
    try {
      // Decode the base64 data
      const jsonData = atob(encodedData);
      const shareData = JSON.parse(jsonData);
      
      // Import the shared data
      await this.importSharedState(shareData);
      
      return {
        success: true,
        data: shareData,
        createdAt: shareData.timestamp || new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Failed to load encoded data:', error);
      return {
        success: false,
        error: 'Invalid share URL format'
      };
    }
  }

  showShareLoadMessage(createdAt, issueUrl, source) {
    const date = new Date(createdAt).toLocaleDateString();
    const sourceText = source === 'localStorage' ? '(stored locally)' : '(via GitHub)';
    const message = `✅ Loaded shared prototype data from ${date} ${sourceText}`;
    this.showNotification(message, 'success');
    
    // Log the GitHub issue URL for reference
    if (issueUrl) {
      console.log('Loaded from GitHub issue:', issueUrl);
    }
  }

  showShareErrorMessage(error) {
    const message = `❌ Failed to load shared prototype: ${error}`;
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 8px;
      color: white;
      font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      opacity: 0;
      transform: translateX(100px);
      transition: all 0.3s ease;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  cleanupExpiredShares() {
    // Clean up expired localStorage shares
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('prototype_share_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.expiresAt && Date.now() > data.expiresAt) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // Invalid data, remove it
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} expired shares`);
    }
  }
}

// Initialize on page load
if (typeof window !== 'undefined') {
  window.PrototypeShare = PrototypeShare;
  
  // Auto-check for shared data when DOM is ready
  document.addEventListener('DOMContentLoaded', async () => {
    const share = new PrototypeShare();
    await share.checkForSharedData();
  });
}