/**
 * UXR Prototype Control Panel
 * Floating panel for managing prototype data and settings
 */

class PrototypeControlPanel {
  constructor() {
    this.isOpen = false;
    this.panel = null;
    this.overlay = null;
    this.init();
  }

  init() {
    this.createFloatingButton();
    this.createPanel();
    this.bindEvents();
  }

  createFloatingButton() {
    const button = document.createElement('button');
    button.id = 'prototype-control-trigger';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17V19H9V17H3ZM3 5V7H13V5H3ZM13 21V19H21V17H13V15H11V21H13ZM7 9V11H3V13H7V15H9V9H7ZM21 13V11H11V13H21ZM15 9H17V7H21V5H17V3H15V9Z" fill="currentColor"/>
      </svg>
    `;
    
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      background: var(--neutral-900);
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      transition: all 0.2s ease;
      font-size: 0;
    `;
    
    button.onmouseover = () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
    };
    
    button.onmouseout = () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
    };
    
    document.body.appendChild(button);
  }

  createPanel() {
    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1001;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    `;
    
    // Panel
    this.panel = document.createElement('div');
    this.panel.id = 'prototype-control-panel';
    this.panel.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--neutral-900);">
          Prototype Controls
        </h3>
        <button id="close-panel" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--neutral-600); padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px;" onmouseover="this.style.background='var(--neutral-100)'" onmouseout="this.style.background='none'">
          ×
        </button>
      </div>
      
      <!-- CSV Upload Section -->
      <div style="margin-bottom: 32px;">
        <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: var(--neutral-900);">Spreadsheet Data</h4>
        
        <div style="background: var(--neutral-50); border: 1px solid var(--neutral-200); border-radius: 8px; padding: 20px;">
          <div style="display: flex; gap: 12px; margin-bottom: 16px;">
            <input type="file" id="panel-csv-input" accept=".csv" style="display: none;">
            <button onclick="document.getElementById('panel-csv-input').click()" style="background: var(--brand-600); color: white; border: none; border-radius: 6px; padding: 12px 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.15s ease;" onmouseover="this.style.background='var(--brand-700)'" onmouseout="this.style.background='var(--brand-600)'">
              Upload CSV File
            </button>
            <button onclick="window.prototypePanel.downloadSample()" style="background: transparent; color: var(--neutral-700); border: 1px solid var(--neutral-300); border-radius: 6px; padding: 12px 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s ease;" onmouseover="this.style.background='var(--neutral-100)'" onmouseout="this.style.background='transparent'">
              Download Sample
            </button>
          </div>
          <p style="margin: 0; font-size: 13px; color: var(--neutral-600); line-height: 1.4;">
            Upload a CSV with format: <strong>Organization, Account Name</strong>
          </p>
        </div>
      </div>
      
      <!-- Organization Selector Section -->
      <div style="margin-bottom: 32px; border-top: 1px solid var(--neutral-200); padding-top: 24px;">
        <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: var(--neutral-900);">Active Organization</h4>
        
        <div style="background: var(--neutral-50); border: 1px solid var(--neutral-200); border-radius: 8px; padding: 20px;">
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px;">
            <select id="panel-org-selector" style="flex: 1; padding: 12px; border: 1px solid var(--neutral-300); border-radius: 6px; font-size: 14px; background: white;">
              <option value="">Select an organization...</option>
            </select>
            <button onclick="window.prototypePanel.applyOrganization()" style="background: var(--brand-600); color: white; border: none; border-radius: 6px; padding: 12px 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s ease;" onmouseover="this.style.background='var(--brand-700)'" onmouseout="this.style.background='var(--brand-600)'">
              Done
            </button>
          </div>
          <p style="margin: 0; font-size: 13px; color: var(--neutral-600); line-height: 1.4;">
            <strong>Current:</strong> <span id="panel-current-org">Loading...</span>
          </p>
        </div>
      </div>
      
      <!-- Reset Section -->
      <div style="border-top: 1px solid var(--neutral-200); padding-top: 24px;">
        <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: var(--neutral-900);">Reset Data</h4>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: var(--neutral-600); line-height: 1.4;">
          Clear all prototype data including account groups and spreadsheet connections.
        </p>
        <button onclick="window.prototypePanel.resetAllData()" style="background: var(--critical-600); color: white; border: none; border-radius: 6px; padding: 12px 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s ease;" onmouseover="this.style.background='var(--critical-700)'" onmouseout="this.style.background='var(--critical-600)'">
          Reset All Data
        </button>
      </div>
      
      <!-- Status Display -->
      <div id="panel-status" style="display: none; margin-top: 16px; padding: 12px; border-radius: 6px; font-size: 14px;"></div>
    `;
    
    this.panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      width: 90%;
      max-width: 480px;
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      z-index: 1002;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      max-height: 90vh;
      overflow-y: auto;
    `;
    
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.panel);
  }

  bindEvents() {
    // Trigger button
    document.getElementById('prototype-control-trigger').addEventListener('click', () => {
      this.toggle();
    });
    
    // Close button
    document.getElementById('close-panel').addEventListener('click', () => {
      this.close();
    });
    
    // Overlay click to close
    this.overlay.addEventListener('click', () => {
      this.close();
    });
    
    // CSV file upload
    document.getElementById('panel-csv-input').addEventListener('change', (event) => {
      this.handleFileUpload(event);
    });
    
    // Update UI when panel opens
    this.panel.addEventListener('transitionend', () => {
      if (this.isOpen) {
        // Panel is now open
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.overlay.style.opacity = '1';
    this.overlay.style.visibility = 'visible';
    this.panel.style.opacity = '1';
    this.panel.style.visibility = 'visible';
    this.panel.style.transform = 'translate(-50%, -50%) scale(1)';
    
    // Update organization selector when opening
    this.updateOrganizationSelector();
  }

  close() {
    this.isOpen = false;
    this.overlay.style.opacity = '0';
    this.overlay.style.visibility = 'hidden';
    this.panel.style.opacity = '0';
    this.panel.style.visibility = 'hidden';
    this.panel.style.transform = 'translate(-50%, -50%) scale(0.9)';
  }

  // CSV file upload functionality
  handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target.result;
        this.loadCSVData(csvContent);
      };
      reader.readAsText(file);
    } else {
      this.showStatus('Please select a valid CSV file.', 'error');
    }
  }

  async loadCSVData(csvContent) {
    try {
      this.showStatus('Loading CSV data...', 'loading');
      
      await window.OrgDataManager.loadFromSpreadsheet(csvContent);
      
      this.showStatus('✅ CSV data loaded successfully! Page will refresh...', 'success');
      
      setTimeout(() => {
        location.reload();
      }, 1500);
      
    } catch (error) {
      this.showStatus(`❌ Error loading CSV: ${error.message}`, 'error');
    }
  }

  downloadSample() {
    const sampleCSV = window.OrgDataManager.getSampleCSV();
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-organization-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    this.showStatus('📝 Sample CSV downloaded!', 'success');
  }

  resetAllData() {
    if (confirm('Reset all prototype data including account groups and spreadsheet connections?\n\nThis cannot be undone.')) {
      this.showStatus('Resetting all data...', 'loading');
      window.OrgDataManager.resetAllData();
      
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  }

  updateOrganizationSelector() {
    const selector = document.getElementById('panel-org-selector');
    const currentOrgSpan = document.getElementById('panel-current-org');
    
    if (!selector || !currentOrgSpan || !window.OrgDataManager) return;
    
    // Clear existing options except the first one
    selector.innerHTML = '<option value="">Select an organization...</option>';
    
    // Get all organization names
    const orgNames = window.OrgDataManager.getAllOrganizationNames();
    
    // Populate selector with organizations
    orgNames.forEach(orgName => {
      const option = document.createElement('option');
      option.value = orgName;
      option.textContent = orgName;
      selector.appendChild(option);
    });
    
    // Show current organization
    const currentOrg = window.OrgDataManager.getCurrentOrganization();
    if (currentOrg) {
      currentOrgSpan.textContent = currentOrg.name;
      selector.value = currentOrg.name;
    } else {
      currentOrgSpan.textContent = 'None selected';
    }
  }

  applyOrganization() {
    const selector = document.getElementById('panel-org-selector');
    const selectedOrgName = selector.value;
    
    if (!selectedOrgName) {
      this.showStatus('Please select an organization.', 'error');
      return;
    }
    
    try {
      this.showStatus('Switching organization...', 'loading');
      
      // Find the organization by name
      const organizations = window.OrgDataManager.organizations;
      const selectedOrg = organizations.find(org => org.name === selectedOrgName);
      
      if (!selectedOrg) {
        throw new Error('Organization not found');
      }
      
      // Switch to the selected organization
      window.OrgDataManager.setCurrentOrganization(selectedOrg);
      
      this.showStatus('✅ Organization switched! Page will refresh...', 'success');
      
      setTimeout(() => {
        location.reload();
      }, 1500);
      
    } catch (error) {
      this.showStatus(`❌ Error: ${error.message}`, 'error');
    }
  }

  showStatus(message, type) {
    const statusDiv = document.getElementById('panel-status');
    if (!statusDiv) return;
    
    statusDiv.style.display = 'block';
    statusDiv.textContent = message;
    
    // Set colors based on type
    if (type === 'success') {
      statusDiv.style.background = 'var(--green-50)';
      statusDiv.style.color = 'var(--green-700)';
      statusDiv.style.border = '1px solid var(--green-200)';
    } else if (type === 'error') {
      statusDiv.style.background = 'var(--red-50)';
      statusDiv.style.color = 'var(--red-700)';
      statusDiv.style.border = '1px solid var(--red-200)';
    } else if (type === 'loading') {
      statusDiv.style.background = 'var(--blue-50)';
      statusDiv.style.color = 'var(--blue-700)';
      statusDiv.style.border = '1px solid var(--blue-200)';
    }
    
    // Auto-hide success/loading messages
    if (type === 'success' || type === 'loading') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 4000);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.prototypePanel = new PrototypeControlPanel();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PrototypeControlPanel };
} 