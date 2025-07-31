/**
 * UXR Organization Data Management - Sub-Account Model
 * Focus on sub-accounts within organizations rather than org switching
 * Supports CSV/spreadsheet data loading for easy UXR data management
 */

// Spreadsheet integration helper
class SpreadsheetDataLoader {
  constructor() {
    this.csvData = null;
    this.processedData = [];
  }

  // Load CSV data from text content
  async loadFromCSV(csvContent) {
    try {
      const rows = csvContent.split('\n').map(row => 
        row.split(',').map(cell => cell.trim().replace(/^["']|["']$/g, '')) // Remove quotes
      );
      
      if (rows.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }
      
      const organizations = new Map();
      
      // Expected format: Organization,Account Name
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 2 || !row[0] || !row[1]) continue;
        
        const orgName = row[0];
        const accountName = row[1];
        const accountId = this.generateAccountId(orgName, accountName);
        
        if (!organizations.has(orgName)) {
          organizations.set(orgName, {
            name: orgName,
            accounts: [
              { id: "all_accounts", name: "All accounts", type: "Aggregate view", isAggregate: true }
            ]
          });
        }
        
        organizations.get(orgName).accounts.push({
          id: accountId,
          name: accountName,
          type: "Account" // Default type for all accounts
        });
      }
      
      this.processedData = Array.from(organizations.values());
      return this.processedData;
    } catch (error) {
      console.error('Error processing CSV:', error);
      throw error;
    }
  }

  generateAccountId(orgName, accountName) {
    // Generate deterministic IDs that remain stable across page loads
    const orgClean = orgName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4);
    const accClean = accountName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
    
    // Use a simple hash of the combined string for consistency
    const combined = `${orgName}_${accountName}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const hashStr = Math.abs(hash).toString(36).slice(0, 3);
    
    return `${orgClean}_${accClean}_${hashStr}`;
  }

  // Generate sample CSV content for users
  getSampleCSV() {
    return `Organization,Account Name
TechSaaS Corp,Mobile App
TechSaaS Corp,Web Platform
TechSaaS Corp,API Services
TechSaaS Corp,Analytics Dashboard
TechSaaS Corp,Development Environment
TechSaaS Corp,Staging Environment
TechSaaS Corp,Production Environment
GlobalCommerce Ltd,North America B2B
GlobalCommerce Ltd,North America B2C
GlobalCommerce Ltd,Europe B2B
GlobalCommerce Ltd,Europe B2C
GlobalCommerce Ltd,Marketplace Platform
GlobalCommerce Ltd,Payment Processing
FinanceFirst Bank,Personal Banking
FinanceFirst Bank,Commercial Banking
FinanceFirst Bank,Investment & Wealth
FinanceFirst Bank,Digital Banking`;
  }

  getDefaultData() {
    // Parse the sample CSV to ensure consistency
    return this.loadFromCSV(this.getSampleCSV());
  }
}

// Enhanced group types for UXR study
const GROUP_TYPES = {
  ACCOUNTS: {
    id: 'accounts',
    name: 'Accounts',
    description: 'Flexible account groupings for filtering and organization',
    allowMultipleMembership: true,
    icon: 'folder',
    useCases: ['Filtering shortcuts', 'Quick access', 'Reporting views']
  },
  RESOURCE_SHARING: {
    id: 'resource_sharing',
    name: 'Resource sharing',
    description: 'Exclusive groups for resource access and permissions',
    allowMultipleMembership: false,
    icon: 'users',
    useCases: ['Access control', 'Resource allocation', 'Team management']
  }
};

// Sub-Account focused data manager
class OrganizationDataManager {
  constructor() {
    this.currentOrganization = null;
    this.currentSubAccount = null;
    this.accountGroups = [];
    this.spreadsheetLoader = new SpreadsheetDataLoader();
    this.organizations = [];
    this.init();
  }

  async init() {
    // Try to load from saved spreadsheet data, fallback to defaults
    const savedCsvData = localStorage.getItem('uxr_csv_data');
    if (savedCsvData) {
      try {
        this.organizations = await this.spreadsheetLoader.loadFromCSV(savedCsvData);
      } catch (error) {
        console.warn('Failed to load saved CSV data, using defaults:', error);
        this.organizations = await this.spreadsheetLoader.getDefaultData();
      }
    } else {
      this.organizations = await this.spreadsheetLoader.getDefaultData();
    }

    // Load saved state - organization and sub-account
    const savedOrgName = localStorage.getItem('uxr_current_organization');
    const savedSubAccountId = localStorage.getItem('uxr_current_sub_account');
    
    // Set current organization (or default to first)
    const org = savedOrgName ? 
      this.getOrganizationByName(savedOrgName) : 
      this.organizations[0];
    
    // Safety check: ensure we have a valid organization
    if (!org) {
      console.error('No organizations found - falling back to default data');
      return;
    }
    
    this.setCurrentOrganization(org);
    
    // Set current sub-account - preserve saved state, otherwise default to "All accounts"
    const subAccount = savedSubAccountId ? 
      this.getSubAccountById(savedSubAccountId) : 
      org.accounts?.find(acc => acc.isAggregate);
    
    // Safety check: ensure we have a valid sub-account
    if (!subAccount) {
      console.error('No sub-accounts found for organization:', org.name);
      return;
    }
    
    this.setCurrentSubAccount(subAccount);
  }

  // Spreadsheet integration methods
  async loadFromSpreadsheet(csvContent) {
    try {
      this.organizations = await this.spreadsheetLoader.loadFromCSV(csvContent);
      
      // Save the CSV data
      localStorage.setItem('uxr_csv_data', csvContent);
      
      // Reset to first organization and "All accounts"
      this.setCurrentOrganization(this.organizations[0]);
      const allAccountsView = this.organizations[0].accounts.find(acc => acc.isAggregate);
      if (allAccountsView) {
        this.setCurrentSubAccount(allAccountsView);
      }
      
      // Clear existing account groups
      this.accountGroups = [];
      this.saveAccountGroups();
      
      return true;
    } catch (error) {
      console.error('Failed to load spreadsheet data:', error);
      throw error;
    }
  }

  getSampleCSV() {
    return this.spreadsheetLoader.getSampleCSV();
  }

  exportCurrentDataAsCSV() {
    let csv = 'Organization,Account Name\n';
    
    this.organizations.forEach(org => {
      org.accounts.forEach(account => {
        if (!account.isAggregate) { // Skip "All accounts" in export
          csv += `${org.name},"${account.name}"\n`;
        }
      });
    });
    
    return csv;
  }

  // Organization management
  getAllOrganizations() {
    return this.organizations;
  }

  getOrganizationByName(name) {
    return this.organizations.find(org => org.name === name);
  }

  getCurrentOrganization() {
    return this.currentOrganization;
  }

  setCurrentOrganization(organization) {
    this.currentOrganization = organization;
    localStorage.setItem('uxr_current_organization', organization.name);
    this.loadAccountGroups();
    
    // Reset to "All accounts" when switching orgs
    const allAccountsView = organization.accounts.find(acc => acc.isAggregate);
    if (allAccountsView) {
      this.setCurrentSubAccount(allAccountsView);
    }
  }

  // Sub-account management
  getCurrentSubAccount() {
    return this.currentSubAccount;
  }

  getAllOrganizationNames() {
    return this.organizations.map(org => org.name);
  }

  setCurrentSubAccount(subAccount) {
    this.currentSubAccount = subAccount;
    localStorage.setItem('uxr_current_sub_account', subAccount.id);
  }

  getSubAccountById(id) {
    return this.currentOrganization ? 
      this.currentOrganization.accounts.find(acc => acc.id === id) : null;
  }

  getAllSubAccounts() {
    return this.currentOrganization ? this.currentOrganization.accounts : [];
  }

  // Account switcher helper functions
  getAccountSwitcherData() {
    if (!this.currentOrganization || !this.currentSubAccount) {
      return { currentAccount: null, accounts: [] };
    }

    const accounts = this.currentOrganization.accounts.slice(); // Copy array
    
    // Move current account to top of list
    const currentIndex = accounts.findIndex(acc => acc.id === this.currentSubAccount.id);
    if (currentIndex > 0) {
      const currentAccount = accounts.splice(currentIndex, 1)[0];
      accounts.unshift(currentAccount);
    }

    return {
      currentAccount: {
        id: this.currentSubAccount.id,
        name: this.currentSubAccount.name, // First line
        type: this.currentOrganization.name, // Second line (org name)
        isAggregate: this.currentSubAccount.isAggregate // Preserve aggregate flag
      },
      accounts: accounts.map(acc => ({
        id: acc.id,
        name: acc.name, // First line
        type: this.currentOrganization.name, // Second line (org name)
        isAggregate: acc.isAggregate // Preserve aggregate flag
      }))
    };
  }

  switchToSubAccount(subAccountId) {
    const subAccount = this.getSubAccountById(subAccountId);
    if (subAccount) {
      this.setCurrentSubAccount(subAccount);
      return true;
    }
    return false;
  }

  // Enhanced account group management
  loadAccountGroups() {
    const storageKey = `uxr_account_groups_${this.currentOrganization.name}`;
    const saved = localStorage.getItem(storageKey);
    this.accountGroups = saved ? JSON.parse(saved) : [];
  }

  saveAccountGroups() {
    const storageKey = `uxr_account_groups_${this.currentOrganization.name}`;
    localStorage.setItem(storageKey, JSON.stringify(this.accountGroups));
  }

  createAccountGroup(groupData) {
    const group = {
      id: `group_${Date.now()}`,
      name: groupData.name,
      type: groupData.type,
      accountIds: groupData.accountIds || [],
      createdAt: new Date().toISOString(),
      description: groupData.description || ''
    };
    
    this.accountGroups.push(group);
    this.saveAccountGroups();
    return group;
  }

  updateAccountGroup(groupId, updates) {
    const index = this.accountGroups.findIndex(g => g.id === groupId);
    if (index !== -1) {
      this.accountGroups[index] = { ...this.accountGroups[index], ...updates };
      this.saveAccountGroups();
      return this.accountGroups[index];
    }
    return null;
  }

  deleteAccountGroup(groupId) {
    this.accountGroups = this.accountGroups.filter(g => g.id !== groupId);
    this.saveAccountGroups();
  }

  getAccountGroups() {
    return this.accountGroups;
  }

  getAccountGroupsByType(type) {
    return this.accountGroups.filter(g => g.type === type);
  }

  // Account eligibility for group types (exclude "All accounts" from grouping)
  getEligibleAccounts(groupType, excludeGroupId = null) {
    const allAccounts = this.getAllSubAccounts().filter(acc => !acc.isAggregate);
    
    if (groupType === GROUP_TYPES.RESOURCE_SHARING.id) {
      // For exclusive groups, exclude accounts already in other exclusive groups
      const exclusiveGroups = this.getAccountGroupsByType(GROUP_TYPES.RESOURCE_SHARING.id)
        .filter(g => g.id !== excludeGroupId);
      const usedAccountIds = new Set();
      
      exclusiveGroups.forEach(group => {
        group.accountIds.forEach(id => usedAccountIds.add(id));
      });
      
      return allAccounts.filter(account => !usedAccountIds.has(account.id));
    }
    
    // For non-exclusive groups, all accounts are eligible
    return allAccounts;
  }

  // Validation
  canAddAccountToGroup(accountId, groupId) {
    const group = this.accountGroups.find(g => g.id === groupId);
    if (!group) return false;

    const eligibleAccounts = this.getEligibleAccounts(group.type, groupId);
    return eligibleAccounts.some(account => account.id === accountId);
  }

  // Utility methods
  getGroupTypesConfig() {
    return GROUP_TYPES;
  }

  getAccountsInGroup(groupId) {
    const group = this.accountGroups.find(g => g.id === groupId);
    if (!group) return [];
    
    return this.getAllSubAccounts().filter(account => 
      group.accountIds.includes(account.id)
    );
  }

  getGroupsForAccount(accountId) {
    return this.accountGroups.filter(group => 
      group.accountIds.includes(accountId)
    );
  }

  // UXR reset functionality
  resetAllData() {
    localStorage.removeItem('uxr_current_organization');
    localStorage.removeItem('uxr_current_sub_account');
    localStorage.removeItem('uxr_csv_data'); // Clear saved CSV data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('uxr_account_groups_')) {
        localStorage.removeItem(key);
      }
    });
    this.accountGroups = [];
    
    // Reload default data
    this.init();
  }

  // UXR Analytics
  getGroupingInsights() {
    return {
      totalGroups: this.accountGroups.length,
      groupsByType: Object.values(GROUP_TYPES).reduce((acc, type) => {
        acc[type.id] = this.getAccountGroupsByType(type.id).length;
        return acc;
      }, {}),
      averageAccountsPerGroup: this.accountGroups.length > 0 ? 
        this.accountGroups.reduce((sum, g) => sum + g.accountIds.length, 0) / this.accountGroups.length : 0,
      ungroupedAccounts: this.getAllSubAccounts().filter(account => 
        !account.isAggregate && !this.accountGroups.some(group => group.accountIds.includes(account.id))
      ).length
    };
  }
}

// Global instance
window.OrgDataManager = new OrganizationDataManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OrganizationDataManager, GROUP_TYPES, SpreadsheetDataLoader };
} 