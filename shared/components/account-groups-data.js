/**
 * Account Groups Data Provider
 * Provides custom account groups created by users for use in filters
 */

// Function to get saved groups from localStorage
function getSavedGroups() {
  try {
    const saved = localStorage.getItem('accountGroups');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load saved groups:', error);
    return [];
  }
}

// Generate account groups for the filter component
function generateCustomAccountGroups() {
  try {
    console.log('🔍 generateCustomAccountGroups called');
    console.log('🔍 OrgDataManager available:', !!window.OrgDataManager);
    console.log('🔍 Current organization:', window.OrgDataManager?.getCurrentOrganization());
    
    // Get all accounts from the current organization
    const allOrgAccounts = window.OrgDataManager?.getCurrentOrganization()?.accounts || [];
    console.log('🔍 Found org accounts:', allOrgAccounts.length, allOrgAccounts);
    
    // Filter out aggregate views and convert to filter format
    const accountData = allOrgAccounts
      .filter(acc => !acc.isAggregate)
      .map((acc, index) => ({
        name: acc.name,
        initials: generateInitials(acc.name),
        color: convertHexToColorClass(acc.color) || (index % 2 === 0 ? 'blue' : 'green'),
        backgroundColor: acc.color, // Store the original hex color for inline styles
        checked: true,
        id: acc.id,
        type: acc.type || 'Account'
      }));
    
    console.log('🔍 Converted account data:', accountData.length, accountData);

    // Start with just an empty groups object - no default groups
    const groups = {};

    // Add custom account groups created by users
    const managedGroups = window.OrgDataManager?.getAccountGroups() || [];
    const savedGroups = getSavedGroups();
    const customGroups = [...managedGroups, ...savedGroups];
    
    console.log('🔍 Managed groups:', managedGroups.length, managedGroups);
    console.log('🔍 Saved groups:', savedGroups.length, savedGroups);
    console.log('🔍 Total custom groups:', customGroups.length, customGroups);

    customGroups.forEach(group => {
      // Get account IDs for this group
      let accountIds = [];
      if (group.accountIds) {
        // Saved groups have accountIds array
        accountIds = group.accountIds;
      } else if (group.accounts) {
        // Managed groups might have accounts array
        accountIds = group.accounts.map(acc => acc.id);
      }

      // Filter accountData to only include accounts in this group
      const groupAccounts = accountData.filter(acc => accountIds.includes(acc.id));
      
      if (groupAccounts.length > 0) {
        // Create a safe key for the group (remove special characters)
        const groupKey = group.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        groups[groupKey] = groupAccounts;
      }
    });

    console.log('📋 Generated custom account groups for filter:', Object.keys(groups));
    return groups;
    
  } catch (error) {
    console.error('Error generating custom account groups:', error);
    // Return empty object when no groups available
    return {};
  }
}

// Helper function to generate initials
function generateInitials(name) {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
}

// Helper function to convert hex colors to color classes
function convertHexToColorClass(hexColor) {
  if (!hexColor) return 'blue';
  
  // Simple mapping of hex colors to named colors
  const colorMap = {
    '#3b82f6': 'blue',
    '#10b981': 'green', 
    '#f59e0b': 'orange',
    '#ef4444': 'red',
    '#8b5cf6': 'purple',
    '#06b6d4': 'cyan'
  };
  
  return colorMap[hexColor] || 'blue';
}

// Make generateCustomAccountGroups globally accessible
window.generateCustomAccountGroups = generateCustomAccountGroups;

console.log('📋 Account Groups Data Provider loaded');