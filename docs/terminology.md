# Project Terminology

This document defines key terms used throughout the Cursor Prototypes project to ensure consistency across all components and documentation.

## Account Hierarchy

### **Account**
A single account entity. This is the fundamental unit in our system.

**Examples:**
- `"Engineering Team"`
- `"Marketing Department"`  
- `"Acme, Inc."` (when standing alone)

### **Organization** 
An account that contains multiple sub-accounts. Organizations provide hierarchical grouping and management of related accounts.

**Examples:**
- `"Acme, Inc."` (when it contains sub-accounts)
- `"Beta Holdings"`
- `"Global Corp"`

### **Sub-Account**
An account that belongs to an organization. Note: This is still just an account - "sub-account" is a contextual term that describes the hierarchical relationship.

**Examples:**
- `"Engineering Team"` (within Acme, Inc.)
- `"West Coast Division"` (within Global Corp)

### **Parent Account**
Alternative term for "organization" when emphasizing the hierarchical relationship to its sub-accounts.

## Usage in Components

### Navigation Components
```javascript
// 1-line: Shows just the account/organization name
NavItemPresets.accountSingle('Acme, Inc.')

// 2-line: Shows sub-account + parent organization
NavItemPresets.account('Engineering Team', 'Acme, Inc.')

// Account with caret: For opening popover with sub-accounts
NavItemPresets.accountWithCaret('Acme Holdings', 'Organization')

// 1-line account with caret: For compact nav panels
NavItemPresets.accountSingleWithCaret('Acme, Inc.')

// Special case: All accounts within an organization
NavItemPresets.allAccounts('Acme Holdings')
```

### API Parameters
```javascript
{
  accountName: 'Engineering Team',    // The account name (line 1)
  parentAccount: 'Acme, Inc.',       // The organization/parent (line 2)
  // OR
  organizationName: 'Acme, Inc.'     // Alternative naming for clarity
}
```

## Hierarchy Examples

```
Acme Holdings                    ← Organization (parent account)
├── Acme, Inc.                  ← Organization (can be parent to others)
│   ├── Engineering Team        ← Account (sub-account of Acme, Inc.)
│   ├── Marketing Department    ← Account (sub-account of Acme, Inc.)
│   └── Sales Division          ← Account (sub-account of Acme, Inc.)
├── Acme Europe                 ← Organization 
│   ├── London Office           ← Account (sub-account of Acme Europe)
│   └── Berlin Office           ← Account (sub-account of Acme Europe)
└── Acme Asia                   ← Organization
    └── Tokyo Division          ← Account (sub-account of Acme Asia)
```

## UI Display Patterns

### Account Switcher
- **1-line items**: Show individual organizations or top-level accounts
- **2-line items**: Show sub-account → parent organization hierarchy
- **"All accounts" item**: Special case showing access to all accounts within an organization

### Account Panels
- **Current account**: Display using appropriate 1-line or 2-line format based on hierarchy
- **Account list**: Group by organization with clear visual hierarchy
- **Active account avatars**: Show stroke border around avatar (50% opacity of avatar color)

### Navigation Panels
- **Account items with caret**: For opening popovers with sub-accounts
- **Active states**: Include check marks and avatar strokes for current selections

## Code Comments
When implementing account-related features, use comments that reflect this terminology:

```javascript
// Display the current account (may be organization or sub-account)
const currentAccount = getCurrentAccount();

// Get the parent organization for this account
const parentOrg = getParentOrganization(accountId);

// List all sub-accounts within this organization
const subAccounts = getSubAccounts(organizationId);
```

---

**Last Updated:** January 2025  
**Applies To:** All Cursor Prototypes components and documentation 