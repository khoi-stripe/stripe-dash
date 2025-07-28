/**
 * Account Switcher Component
 * Global reusable component for switching between accounts/organizations
 */

class AccountSwitcher {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      currentAccount: options.currentAccount || { name: 'Acme, Inc.', type: 'organization' },
      accounts: options.accounts || [
        { id: 1, name: 'Acme, Inc.', type: 'organization' },
        { id: 2, name: 'Beta Corp', type: 'organization' },
        { id: 3, name: 'Charlie Ltd', type: 'organization' },
        { id: 4, name: 'Personal', type: 'personal' }
      ],
      variant: options.variant || '2-line', // '1-line' or '2-line'
      onAccountChange: options.onAccountChange || (() => {})
    };
    
    this.isOpen = false;
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
  }
  
  generateInitials(name) {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  
  generateAvatarColor(name, accountId = null) {
    // First check if we have a predefined color in the global accounts object
    if (accountId && window.accounts && window.accounts[accountId] && window.accounts[accountId].color) {
      return window.accounts[accountId].color;
    }
    
    // Random color palette for avatars
    const colors = [
      '#3B82F6', // blue-500
      '#8B5CF6', // violet-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#EC4899', // pink-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
      '#6366F1', // indigo-500
    ];
    
    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
  
  generateUniqueColors(accounts) {
    // Generate unique colors for a set of accounts
    const colors = [
      '#3B82F6', // blue-500
      '#8B5CF6', // violet-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#EC4899', // pink-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
      '#6366F1', // indigo-500
      '#14B8A6', // teal-500
      '#F87171', // red-400
      '#A78BFA', // violet-400
      '#34D399', // emerald-400
      '#FBBF24', // amber-400
    ];
    
    const accountColors = {};
    accounts.forEach((account, index) => {
      // First check if account object has color property
      if (account.color) {
        accountColors[account.id] = account.color;
      // Then check if we have a predefined color in the global accounts object
      } else if (window.accounts && window.accounts[account.id] && window.accounts[account.id].color) {
        accountColors[account.id] = window.accounts[account.id].color;
      } else {
        // Fall back to generated colors by index
        accountColors[account.id] = colors[index % colors.length];
      }
    });
    
    return accountColors;
  }

  render() {
    // Reset event binding flag since we're re-rendering
    this.eventsBound = false;
    
    const currentAccount = this.options.currentAccount;
    const variant = this.options.variant;
    const isAllAccounts = currentAccount.id === 'all-accounts' || currentAccount.isAllAccounts;
    
    // Handle avatar for "All accounts" vs regular accounts
    const renderAvatar = () => {
      if (isAllAccounts) {
        return `
          <div class="account-avatar all-accounts-avatar" style="background: #F5F6F8 !important; background-color: #F5F6F8 !important; color: #6D7C8C !important;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 21h18"/>
              <path d="M5 21V7l8-4v18"/>
              <path d="M19 21V11l-6-4"/>
              <path d="M9 9v.01"/>
              <path d="M9 12v.01"/>
              <path d="M9 15v.01"/>
              <path d="M9 18v.01"/>
            </svg>
          </div>
        `;
      } else {
        const initials = this.generateInitials(currentAccount.name);
        // Use color from options first, then color system, then fallback
        const avatarColor = currentAccount.color || 
                           this.generateUniqueColors(this.options.accounts)[currentAccount.id] || 
                           this.generateAvatarColor(currentAccount.name, currentAccount.id);
        
        return `
          <div class="account-avatar" data-color="${avatarColor}" style="background-color: ${avatarColor} !important;">
            <span class="avatar-initials">${initials}</span>
          </div>
        `;
      }
    };
    
    const renderAccountDetails = () => {
      if (variant === '1-line') {
        return `
          <div class="account-details account-details-1-line">
            <span class="account-name">${currentAccount.name}</span>
          </div>
        `;
      } else {
        return `
          <div class="account-details account-details-2-line">
            <span class="account-name">${currentAccount.name}</span>
            <span class="account-type">${currentAccount.type}</span>
          </div>
        `;
      }
    };
    
    const hasMultipleAccounts = this.options.accounts.length > 1;
    
    this.container.innerHTML = `
      <div class="account-switcher account-switcher-${variant} ${!hasMultipleAccounts ? 'account-switcher-disabled' : ''}">
        <button class="account-switcher-trigger" type="button" ${!hasMultipleAccounts ? 'disabled' : ''}>
          <div class="account-info">
            ${renderAvatar()}
            ${renderAccountDetails()}
          </div>
          ${hasMultipleAccounts ? `
            <div class="account-switcher-caret">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </div>
          ` : ''}
        </button>
        
        ${hasMultipleAccounts ? `
          <div class="account-switcher-dropdown">
            <div class="account-list">
              ${this.options.accounts.length > 1 ? `
                <button class="account-item all-accounts ${currentAccount.id === 'all-accounts' ? 'active' : ''}" data-account-id="all-accounts" type="button">
                  <div class="account-avatar all-accounts-avatar" style="background: #F5F6F8 !important; background-color: #F5F6F8 !important; color: #6D7C8C !important;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M3 21h18"/>
                      <path d="M5 21V7l8-4v18"/>
                      <path d="M19 21V11l-6-4"/>
                      <path d="M9 9v.01"/>
                      <path d="M9 12v.01"/>
                      <path d="M9 15v.01"/>
                      <path d="M9 18v.01"/>
                    </svg>
                  </div>
                  <div class="account-details">
                    <span class="account-name">All accounts</span>
                  </div>
                  ${currentAccount.id === 'all-accounts' ? `
                    <div class="account-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="9,12 11,14 15,10"/>
                      </svg>
                    </div>
                  ` : ''}
                </button>
                <div class="account-divider"></div>
              ` : ''}
              ${(() => {
                const uniqueColors = this.generateUniqueColors(this.options.accounts);
                return this.options.accounts.map(account => {
                  const accountInitials = this.generateInitials(account.name);
                  const accountAvatarColor = account.color || uniqueColors[account.id];
                  return `
                    <button class="account-item ${account.id === currentAccount.id ? 'active' : ''}" 
                            data-account-id="${account.id}" type="button">
                      <div class="account-avatar" data-color="${accountAvatarColor}" style="background-color: ${accountAvatarColor} !important;">
                        <span class="avatar-initials">${accountInitials}</span>
                      </div>
                      <div class="account-details">
                        <span class="account-name">${account.name}</span>
                      </div>
                      ${account.id === currentAccount.id ? `
                        <div class="account-check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="9,12 11,14 15,10"/>
                          </svg>
                        </div>
                      ` : ''}
                    </button>
                  `;
                }).join('');
              })()}
            </div>
            
            <!-- Account Actions Section -->
            <div class="account-actions">
              <button class="nav-item" type="button">
                <div class="nav-item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <span class="nav-item-label">Settings</span>
              </button>
              
              <button class="nav-item" type="button" id="switchSandboxAction">
                <div class="nav-item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="7.5,4.21 12,6.81 16.5,4.21"/>
                    <polyline points="7.5,19.79 7.5,14.6 3,12"/>
                    <polyline points="21,12 16.5,14.6 16.5,19.79"/>
                  </svg>
                </div>
                <span class="nav-item-label">Switch to sandbox</span>
              </button>
              
              <button class="nav-item" type="button" id="createAccountAction">
                <div class="nav-item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 5v14"/>
                    <path d="M5 12h14"/>
                  </svg>
                </div>
                <span class="nav-item-label">Create account</span>
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
    
    // Ensure all account avatars have correct styling
    setTimeout(() => {
      // Fix trigger button avatar to match dropdown
      const triggerAvatar = this.container.querySelector('.account-switcher-trigger .account-avatar:not(.all-accounts-avatar)');
      if (triggerAvatar && this.options.currentAccount.id !== 'all-accounts' && !this.options.currentAccount.isAllAccounts) {
        const uniqueColors = this.generateUniqueColors(this.options.accounts);
        const correctColor = this.options.currentAccount.color || uniqueColors[this.options.currentAccount.id];
        if (correctColor) {
          triggerAvatar.style.setProperty('background-color', correctColor, 'important');
        }
      }
      
      // Fix dropdown account avatars
      const accountAvatars = this.container.querySelectorAll('.account-item .account-avatar:not(.all-accounts-avatar)');
      accountAvatars.forEach((avatar, index) => {
        const accountId = avatar.closest('[data-account-id]')?.dataset.accountId;
        if (accountId) {
          const account = this.options.accounts.find(acc => acc.id === accountId);
          const uniqueColors = this.generateUniqueColors(this.options.accounts);
          const correctColor = account?.color || uniqueColors[accountId];
          if (correctColor) {
            avatar.style.setProperty('background-color', correctColor, 'important');
          }
        }
      });
      
      // Fix all-accounts avatars
      const allAccountsAvatars = this.container.querySelectorAll('.all-accounts-avatar');
      allAccountsAvatars.forEach(avatar => {
        avatar.removeAttribute('style');
        avatar.style.setProperty('background-color', 'var(--neutral-50)', 'important');
        avatar.style.setProperty('background', 'var(--neutral-50)', 'important');
        avatar.style.setProperty('color', 'var(--neutral-600)', 'important');
      });
    }, 10);
    
    // Immediate fix for all-accounts avatars to prevent red flash
    const immediateAllAccountsAvatars = this.container.querySelectorAll('.all-accounts-avatar');
    immediateAllAccountsAvatars.forEach((avatar) => {
      // Try CSS variable first, then fallback to hardcoded value
      avatar.style.setProperty('background-color', 'var(--neutral-50)', 'important');
      avatar.style.setProperty('background', 'var(--neutral-50)', 'important');
      avatar.style.setProperty('color', 'var(--neutral-600)', 'important');
      
      // If CSS variable didn't work, use hardcoded color
      const currentBg = window.getComputedStyle(avatar).backgroundColor;
      if (currentBg === 'rgb(225, 29, 72)' || currentBg.includes('225')) {
        avatar.style.setProperty('background-color', '#F5F6F8', 'important');
        avatar.style.setProperty('background', '#F5F6F8', 'important');
      }
    });
    
    this.addStyles();
  }
  
  addStyles() {
    if (document.getElementById('account-switcher-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'account-switcher-styles';
    styles.textContent = `
      .account-switcher {
        position: relative;
        display: inline-block;
      }
      
      .account-switcher-trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: white;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 280px;
      }
      
      .account-switcher-trigger:hover {
        border-color: var(--color-border-strong);
        background: var(--color-background);
      }
      
      .account-switcher-trigger:disabled {
        cursor: default !important;
        background: white !important;
        border-color: var(--color-border) !important;
        opacity: 1;
      }
      
      .account-switcher-trigger:disabled:hover {
        border-color: var(--color-border) !important;
        background: white !important;
      }
      
      .account-switcher-disabled .account-switcher-trigger {
        cursor: default;
      }
      
      .account-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }
      
      .account-avatar {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        flex-shrink: 0;
      }
      
      .avatar-initials {
        font-family: var(--font-family-ui);
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-medium);
        color: white;
        line-height: 1;
      }
      
      /* Active Account Avatar Stroke - Match account panel */
      .account-item.active .account-avatar:after {
        content: '';
        position: absolute;
        top: -2.5px;
        left: -2.5px;
        right: -2.5px;
        bottom: -2.5px;
        border: 1.5px solid;
        border-radius: 6px;
        pointer-events: none;
      }
      
      /* Color-specific border colors for active avatars */
      .account-item.active .account-avatar[data-color="#3B82F6"]:after { border-color: rgba(59, 130, 246, 0.5); }
      .account-item.active .account-avatar[data-color="#10B981"]:after { border-color: rgba(16, 185, 129, 0.5); }
      .account-item.active .account-avatar[data-color="#F59E0B"]:after { border-color: rgba(245, 158, 11, 0.5); }
      .account-item.active .account-avatar[data-color="#8B5CF6"]:after { border-color: rgba(139, 92, 246, 0.5); }
      .account-item.active .account-avatar[data-color="#F43F5E"]:after { border-color: rgba(244, 63, 94, 0.5); }
      .account-item.active .account-avatar[data-color="#06B6D4"]:after { border-color: rgba(6, 182, 212, 0.5); }
      .account-item.active .account-avatar[data-color="#84CC16"]:after { border-color: rgba(132, 204, 22, 0.5); }
      .account-item.active .account-avatar[data-color="#EAB308"]:after { border-color: rgba(234, 179, 8, 0.5); }
      
             /* All accounts active avatar outline - lighter grey */
       .account-item.all-accounts.active .account-avatar.all-accounts-avatar:after {
         border-color: var(--neutral-200);
       }
       
       /* Sandbox avatars in popover */
       .sandbox-avatar {
         display: flex;
         align-items: center;
         justify-content: center;
         width: 16px;
         height: 16px;
         border-radius: 3px;
         flex-shrink: 0;
       }
       
       .sandbox-avatar .avatar-initials {
         font-family: var(--font-family-ui);
         font-size: 10px;
         font-weight: var(--font-weight-medium);
         color: white;
         line-height: 1;
       }
       
       /* Sandbox section styling */
       .sandbox-section {
         margin-bottom: 16px;
       }
       
       .sandbox-section:last-of-type {
         margin-bottom: 8px;
         padding-bottom: 8px;
         border-bottom: 1px solid var(--neutral-50);
       }
       
       .sandbox-section-label {
         font-family: var(--font-family-ui);
         font-size: var(--font-size-11);
         font-weight: var(--font-weight-medium);
         color: var(--neutral-500);
         text-transform: uppercase;
         letter-spacing: 0.02em;
         margin-bottom: 8px;
         padding: 0 4px;
       }
       
       /* Sandbox scope indicators */
       .sandbox-scope-indicator {
         font-family: var(--font-family-ui);
         font-size: var(--font-size-11);
         font-weight: var(--font-weight-medium);
         color: var(--neutral-400);
         margin-left: auto;
         padding-left: 8px;
         flex-shrink: 0;
       }
       
       /* Organization sandbox styling */
       .org-sandbox .sandbox-scope-indicator {
         color: var(--blue-500);
       }
       
       /* Account sandbox styling */
       .account-sandbox .sandbox-scope-indicator {
         color: var(--purple-500);
       }
       
       
      
      .account-details {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        min-width: 0;
        flex: 1;
      }
      
      .account-name {
        font-family: var(--font-family-ui);
        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--neutral-900);
        line-height: var(--line-height-20);
        letter-spacing: -0.005em;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      

      
      .account-type {
        font-family: var(--font-family-ui);
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-regular);
        color: var(--color-text-subdued);
        text-transform: capitalize;
        line-height: var(--line-height-16);
        letter-spacing: 0;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      /* Variant-specific styles */
      .account-switcher-1-line .account-name {
        font-family: var(--font-family-ui);
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-semibold);
        color: var(--neutral-900);
        line-height: var(--line-height-16);
        letter-spacing: 0;
      }
      
      .account-switcher-2-line .account-name {
        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--neutral-900);
        line-height: var(--line-height-20);
        letter-spacing: -0.005em;
      }
      
      .account-switcher-2-line .account-type {
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-regular);
        color: var(--color-text-subdued);
        line-height: var(--line-height-16);
        letter-spacing: 0;
      }
      
      /* Trigger button should use label/small typography */
      .account-switcher-trigger .account-name {
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        line-height: var(--line-height-16);
        letter-spacing: 0;
      }
      
      .account-switcher-trigger .account-type {
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-regular);
        color: var(--color-text-subdued);
        line-height: var(--line-height-16);
        letter-spacing: 0;
      }
      
      .account-switcher-caret {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        color: var(--color-text-muted);
        transition: transform 0.2s ease;
      }
      
      .account-switcher.open .account-switcher-caret {
        transform: rotate(180deg);
      }
      
      .account-switcher-dropdown {
        position: fixed;
        width: 280px;
        background: white;
        border: none;
        border-radius: 8px;
        box-shadow: 0px 15px 35px 0px rgba(48, 49, 61, 0.08), 0px 5px 15px 0px rgba(0, 0, 0, 0.12);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px);
        transition: all 0.2s ease;
        z-index: 9999;
        overflow: hidden;
      }
      
      .account-switcher.open .account-switcher-dropdown {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .account-list {
        padding: 16px 8px; /* Additional 8px top and bottom padding (16px total), 8px sides */
        border-bottom: 1px solid var(--color-border-subtle);
      }
      
      .account-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        min-height: 32px;
        padding: 4px 12px;
        background: transparent;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all var(--transition-fast);
        min-width: 0;
      }
      
      .account-item:hover {
        background: var(--color-background);
      }
      
      .account-item:hover .account-name {
        color: var(--neutral-900);
      }
      
      .account-item:hover .account-type {
        color: var(--color-text-subdued);
      }
      
      .account-item.active {
        background: var(--brand-50);
      }
      
      .account-item.active .account-name {
        color: var(--brand-600);
        font-weight: var(--font-weight-semibold);
      }
      
      .account-item.active .account-type {
        color: var(--color-text-subdued);
      }
      
      .account-item.active:hover {
        background: var(--brand-50);
      }
      
      .account-item.active:hover .account-name {
        color: var(--brand-600);
        font-weight: var(--font-weight-semibold);
      }
      
      .account-item.active:hover .account-type {
        color: var(--color-text-subdued);
      }
      
      .account-switcher-disabled .account-name {
        color: var(--color-text-muted);
      }
      
      .account-switcher-disabled .account-type {
        color: var(--color-text-disabled);
      }
      
      .account-check {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: auto;
        color: var(--brand-600);
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
      
      .account-check svg {
        width: 16px;
        height: 16px;
        stroke: var(--brand-600);
      }
      
      .account-divider {
        height: 1px;
        background: var(--neutral-50);
        margin: 8px 12px;
      }
      
      .account-switcher .account-item.all-accounts .account-avatar.all-accounts-avatar {
        background: var(--neutral-50) !important;
        color: var(--neutral-600) !important;
      }
      
      .account-switcher .account-item.all-accounts:hover .account-avatar.all-accounts-avatar {
        background: var(--neutral-100) !important;
        color: var(--neutral-700) !important;
      }
      
      /* All accounts active state */
      .account-switcher .account-item.all-accounts.active .account-avatar.all-accounts-avatar {
        background: var(--neutral-100) !important;
        color: var(--neutral-700) !important;
      }
      
      .account-switcher .account-item.all-accounts.active:hover .account-avatar.all-accounts-avatar {
        background: var(--neutral-100) !important;
        color: var(--neutral-700) !important;
      }
      
      /* Fallback override for stubborn CSS conflicts */
      [class*="all-accounts-avatar"] {
        background: var(--neutral-50) !important;
        background-color: var(--neutral-50) !important;
      }
      
      /* All accounts avatar in trigger button */
      .account-switcher-trigger .all-accounts-avatar {
        background: var(--neutral-50) !important;
        color: var(--neutral-600) !important;
      }
      
      .account-switcher-trigger:hover .all-accounts-avatar {
        background: var(--neutral-100) !important;
        color: var(--neutral-700) !important;
      }
      
      /* Account Actions Section */
      .account-actions {
        padding: 16px 8px; /* Additional 8px top and bottom padding (16px total), 8px sides */
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 8px; /* 8px row gap between buttons */
      }
      
      /* Account actions nav-item buttons */
      .account-actions .nav-item {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        height: 24px; /* Match nav panel button height */
        padding: 4px 12px; /* Match account-item padding for consistent full-width */
        background: transparent;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all var(--transition-fast);
        text-decoration: none;
        color: inherit;
        font-family: inherit;
      }
      
      /* Floating hover effect - match nav panel */
      .account-actions .nav-item::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        background-color: transparent;
        border-radius: 8px;
        transition: background-color var(--transition-fast);
        z-index: 0;
        pointer-events: none;
        display: block;
      }
      
      .account-actions .nav-item:hover::before {
        background-color: var(--neutral-50);
      }
      
      .account-actions .nav-item .nav-item-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        color: var(--color-text-muted);
        flex-shrink: 0;
        margin: 0;
        position: relative;
        z-index: 1;
      }
      
      .account-actions .nav-item .nav-item-icon svg {
        width: 16px;
        height: 16px;
        stroke: var(--icon-default);
      }
      
      .account-actions .nav-item .nav-item-label {
        margin-left: 8px; /* Match nav panel spacing */
        font-family: var(--font-family-ui);
        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--neutral-900);
        line-height: var(--line-height-20);
        letter-spacing: -0.005em;
        flex: 1;
        position: relative;
        z-index: 1;
        text-align: left; /* Ensure left alignment */
      }
      
             /* Popover Styles */
       .popover {
         position: fixed;
         background: white;
         border: 1px solid rgba(0, 39, 77, 0.08);
         border-radius: 8px;
         box-shadow: 0px 15px 35px 0px rgba(48, 49, 61, 0.08), 0px 5px 15px 0px rgba(0, 0, 0, 0.12);
         padding: 8px;
         opacity: 0;
         visibility: hidden;
         transform: translateX(-4px);
         transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
         z-index: 10000;
         min-width: 160px;
         max-width: 280px;
         top: 0;
         left: 0;
       }
      
             .popover.show {
         opacity: 1;
         visibility: visible;
         transform: translateX(0);
       }
      
      .popover-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all var(--transition-fast);
        color: var(--neutral-900);
        text-decoration: none;
        min-height: 32px;
      }
      
      .popover-option:hover {
        background: var(--color-background);
      }
      
      .popover-option .nav-item-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        color: var(--color-text-muted);
        flex-shrink: 0;
      }
      
      .popover-option .nav-item-icon svg {
        width: 16px;
        height: 16px;
      }
      
             .popover-option .nav-item-label {
         font-family: var(--font-family-ui);
         font-size: var(--font-size-14);
         font-weight: var(--font-weight-regular);
         color: var(--neutral-900);
         line-height: var(--line-height-20);
         white-space: nowrap;
         margin-left: 0; /* Remove inherited margin to prevent double spacing with gap */
       }
       
       /* Ensure action items are properly displayed in collapsed state */
       .account-switcher-dropdown .action-item {
         min-width: 0 !important;
         flex-shrink: 0 !important;
       }
       
       .account-switcher-dropdown .action-item .nav-item-label {
         flex: 1 !important;
         min-width: 0 !important;
         white-space: nowrap !important;
         overflow: hidden !important;
         text-overflow: ellipsis !important;
       }
       
       /* Override collapsed nav panel hiding - always show labels in account switcher dropdown */
       .nav-panel.collapsed .account-switcher-dropdown .nav-item-label {
         display: block !important;
       }
       
       /* Sandbox popover group styling */
       .sandbox-group {
         margin-bottom: 8px;
         padding-bottom: 8px;
         border-bottom: 1px solid var(--neutral-50);
       }
       
       .management-group {
         margin-top: 8px;
         padding-top: 0;
       }
       
       /* Sandbox popover buttons should match nav panel styling */
       .sandbox-group .popover-option,
       .management-group .popover-option {
         position: relative;
         display: flex;
         align-items: center;
         height: 24px;
         padding: 4px 12px;
         background: transparent;
         border: none;
         border-radius: 6px;
         cursor: pointer;
         transition: all var(--transition-fast);
         text-decoration: none;
         color: inherit;
         font-family: inherit;
         margin-bottom: 0;
       }
       
       /* Floating hover effect for sandbox buttons */
       .sandbox-group .popover-option::before,
       .management-group .popover-option::before {
         content: '';
         position: absolute;
         top: -4px;
         left: -4px;
         right: -4px;
         bottom: -4px;
         background-color: transparent;
         border-radius: 8px;
         transition: background-color var(--transition-fast);
         z-index: 0;
         pointer-events: none;
         display: block;
       }
       
       .sandbox-group .popover-option:hover::before,
       .management-group .popover-option:hover::before {
         background-color: var(--neutral-50);
       }
       
       .sandbox-group .popover-option .nav-item-icon,
       .sandbox-group .popover-option .nav-item-label,
       .management-group .popover-option .nav-item-icon,
       .management-group .popover-option .nav-item-label {
         position: relative;
         z-index: 1;
       }
    `;
    
    document.head.appendChild(styles);
  }
  
  positionDropdown() {
    const trigger = this.container.querySelector('.account-switcher-trigger');
    const dropdown = this.container.querySelector('.account-switcher-dropdown');
    
    if (!trigger || !dropdown) return;
    
    const triggerRect = trigger.getBoundingClientRect();
    
    // Check if nav panel is collapsed (narrow width indicates collapsed state)
    const navPanel = document.getElementById('navPanel');
        const isNavCollapsed = navPanel && navPanel.classList.contains('collapsed');
    
    if (isNavCollapsed) {
      // When nav is collapsed, position dropdown to the right of trigger
      const newTop = triggerRect.top;
      const newLeft = triggerRect.right + 8;
      
      dropdown.style.top = `${newTop}px`;
      dropdown.style.left = `${newLeft}px`;
      dropdown.style.position = 'fixed';
      dropdown.style.zIndex = '9999';
      
            // Force styles directly to ensure visibility when nav is collapsed  
      setTimeout(() => {
        // Apply styles to all account elements to ensure visibility
        dropdown.querySelectorAll('.account-name, .account-type, .account-details, .account-item').forEach(el => {
          el.style.setProperty('overflow', 'visible', 'important');
          el.style.setProperty('text-overflow', 'initial', 'important');
          el.style.setProperty('max-width', 'none', 'important');
          el.style.setProperty('display', 'block', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
        });
        
        // Ensure dropdown and items have proper width when collapsed
        dropdown.style.setProperty('width', '320px', 'important');
        dropdown.style.setProperty('min-width', '320px', 'important');
        
        // Ensure account items span full width and maintain horizontal layout
        dropdown.querySelectorAll('.account-item').forEach(el => {
          el.style.setProperty('width', '100%', 'important');
          el.style.setProperty('min-width', '100%', 'important');
          el.style.setProperty('display', 'flex', 'important');
          el.style.setProperty('flex-direction', 'row', 'important');
          el.style.setProperty('align-items', 'center', 'important');
          el.style.setProperty('flex-wrap', 'nowrap', 'important');
        });
        
        // Ensure action items are also properly displayed in collapsed state
        dropdown.querySelectorAll('.action-item').forEach(el => {
          el.style.setProperty('width', '100%', 'important');
          el.style.setProperty('min-width', '100%', 'important');
          el.style.setProperty('display', 'flex', 'important');
          el.style.setProperty('flex-direction', 'row', 'important');
          el.style.setProperty('align-items', 'center', 'important');
          el.style.setProperty('flex-wrap', 'nowrap', 'important');
        });
        
        // Ensure action item labels are visible
        dropdown.querySelectorAll('.action-item .nav-item-label').forEach(el => {
          el.style.setProperty('display', 'block', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
          el.style.setProperty('white-space', 'nowrap', 'important');
          el.style.setProperty('overflow', 'hidden', 'important');
          el.style.setProperty('text-overflow', 'ellipsis', 'important');
        });
        
        // Ensure account details don't wrap and take available space
        dropdown.querySelectorAll('.account-details').forEach(el => {
          el.style.setProperty('display', 'flex', 'important');
          el.style.setProperty('flex-direction', 'column', 'important');
          el.style.setProperty('flex', '1', 'important');
          el.style.setProperty('min-width', '0', 'important');
        });
        
        // Ensure account names don't wrap horizontally
        dropdown.querySelectorAll('.account-name').forEach(el => {
          el.style.setProperty('white-space', 'nowrap', 'important');
          el.style.setProperty('overflow', 'hidden', 'important');
          el.style.setProperty('text-overflow', 'ellipsis', 'important');
        });
      }, 50);
      

    } else {
      // Normal positioning: below the trigger with 4px spacing
      const newTop = triggerRect.bottom + 4;
      const newLeft = triggerRect.left;
      
      dropdown.style.top = `${newTop}px`;
      dropdown.style.left = `${newLeft}px`;
      dropdown.style.position = 'fixed';
      dropdown.style.zIndex = '9999';
      
            // Reset any inline styles applied in collapsed mode
      setTimeout(() => {
        // Reset dropdown width
        dropdown.style.removeProperty('width');
        dropdown.style.removeProperty('min-width');
        
        [...dropdown.querySelectorAll('.account-name, .account-type, .account-details, .account-item, .action-item')].forEach(el => {
          el.style.removeProperty('overflow');
          el.style.removeProperty('text-overflow');
          el.style.removeProperty('max-width');
          el.style.removeProperty('display');
          el.style.removeProperty('visibility');
          // Additional properties specific to collapsed mode layout
          el.style.removeProperty('white-space');
          el.style.removeProperty('width');
          el.style.removeProperty('min-width');
          el.style.removeProperty('flex-direction');
          el.style.removeProperty('align-items');
          el.style.removeProperty('flex-wrap');
          el.style.removeProperty('flex');
        });
        
        // Reset action item labels specifically
        [...dropdown.querySelectorAll('.action-item .nav-item-label')].forEach(el => {
          el.style.removeProperty('display');
          el.style.removeProperty('visibility');
          el.style.removeProperty('white-space');
          el.style.removeProperty('overflow');
          el.style.removeProperty('text-overflow');
        });
      }, 50);
    }
  }
  
  bindEvents() {
    // Prevent duplicate event binding
    if (this.eventsBound) {
      return;
    }
    
    const trigger = this.container.querySelector('.account-switcher-trigger');
    const dropdown = this.container.querySelector('.account-switcher-dropdown');
    const accountItems = this.container.querySelectorAll('.account-item');
    
    // Only add interactive behavior if there are multiple accounts
    const hasMultipleAccounts = this.options.accounts.length > 1;
    
    if (!hasMultipleAccounts) {
      // For single accounts, no interaction needed
      this.eventsBound = true;
      return;
    }
    
    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });
    
    // Account selection
    accountItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const accountId = item.dataset.accountId;
        this.selectAccount(accountId);
      });
    });
    
            // Initialize popover for Switch to sandbox action
    const switchSandboxButton = this.container.querySelector('#switchSandboxAction');
    if (switchSandboxButton && window.Popover) {
      const sandboxPopover = new window.Popover(switchSandboxButton, {
        position: 'right',
        offset: 8,
        trigger: 'hover',
        hideDelay: 100,
        showDelay: 0,
        content: this.generateSandboxContent()
      });
    }

    
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });
    
    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Reposition dropdown on window resize and scroll
    window.addEventListener('resize', () => {
      if (this.isOpen) {
        this.positionDropdown();
      }
    });
    
    window.addEventListener('scroll', () => {
      if (this.isOpen) {
        this.positionDropdown();
      }
    });
    
    // Mark events as bound
    this.eventsBound = true;
  }
  
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
  
  open() {
    this.isOpen = true;
    this.container.querySelector('.account-switcher').classList.add('open');
    
    // Use requestAnimationFrame to ensure positioning happens after any CSS transitions
    requestAnimationFrame(() => {
      this.positionDropdown();
    });
  }
  
  close() {
    this.isOpen = false;
    this.container.querySelector('.account-switcher').classList.remove('open');
  }
  
  generateSandboxContent() {
    const currentAccount = this.options.currentAccount;
    const isAllAccounts = currentAccount.id === 'all-accounts' || currentAccount.isAllAccounts;
    
    // Mock sandbox data - in real implementation, this would come from API
    const orgSandboxes = [
      { id: 'org-dev', name: 'Development', color: '#10B981', initial: 'D' },
      { id: 'org-staging', name: 'Staging', color: '#F59E0B', initial: 'S' },
      { id: 'org-prod', name: 'Production', color: '#EF4444', initial: 'P' }
    ];
    
    const accountSandboxes = [
      { id: 'acc-dev', name: 'Development', color: '#06B6D4', initial: 'D' },
      { id: 'acc-test', name: 'Test', color: '#8B5CF6', initial: 'T' }
    ];
    
    let content = '';
    
    if (isAllAccounts) {
      // Show only organization-level sandboxes when viewing "All accounts"
      content += `
        <div class="sandbox-section">
          <div class="sandbox-group">
            ${orgSandboxes.map(sandbox => `
              <div class="popover-option nav-item org-sandbox" onclick="console.log('Switch to ${sandbox.name} (org)'); this.closest('.popover').style.display='none';">
                <div class="nav-item-icon">
                  <div class="sandbox-avatar" style="background-color: ${sandbox.color};">
                    <span class="avatar-initials">${sandbox.initial}</span>
                  </div>
                </div>
                <span class="nav-item-label">${sandbox.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      // Show both org and account sandboxes when viewing specific account
      content += `
        <div class="sandbox-section">
          <div class="sandbox-group">
            ${orgSandboxes.map(sandbox => `
              <div class="popover-option nav-item org-sandbox" onclick="console.log('Switch to ${sandbox.name} (org)'); this.closest('.popover').style.display='none';">
                <div class="nav-item-icon">
                  <div class="sandbox-avatar" style="background-color: ${sandbox.color};">
                    <span class="avatar-initials">${sandbox.initial}</span>
                  </div>
                </div>
                <span class="nav-item-label">${sandbox.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="sandbox-section">
          <div class="sandbox-section-label">${currentAccount.name} Sandboxes</div>
          <div class="sandbox-group">
            ${accountSandboxes.map(sandbox => `
              <div class="popover-option nav-item account-sandbox" onclick="console.log('Switch to ${sandbox.name} (account)'); this.closest('.popover').style.display='none';">
                <div class="nav-item-icon">
                  <div class="sandbox-avatar" style="background-color: ${sandbox.color};">
                    <span class="avatar-initials">${sandbox.initial}</span>
                  </div>
                </div>
                <span class="nav-item-label">${sandbox.name}</span>
                <span class="sandbox-scope-indicator">Account</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // Add management actions
    content += `
      <div class="management-group">
        <div class="popover-option nav-item" onclick="console.log('Create new sandbox'); this.closest('.popover').style.display='none';">
          <div class="nav-item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
          </div>
          <span class="nav-item-label">Create</span>
        </div>
        <div class="popover-option nav-item" onclick="console.log('Manage sandboxes'); this.closest('.popover').style.display='none';">
          <div class="nav-item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <span class="nav-item-label">Manage sandboxes</span>
        </div>
      </div>
    `;
    
    return content;
  }
  
  refreshSandboxPopover() {
    const switchSandboxButton = this.container.querySelector('#switchSandboxAction');
    if (switchSandboxButton && window.Popover) {
      // Find and remove existing popover
      const existingPopover = document.querySelector('.popover');
      if (existingPopover) {
        existingPopover.remove();
      }
      
      // Recreate popover with updated content
      const sandboxPopover = new window.Popover(switchSandboxButton, {
        position: 'right',
        offset: 8,
        trigger: 'hover',
        hideDelay: 100,
        showDelay: 0,
        content: this.generateSandboxContent()
      });
    }
  }
  
      selectAccount(accountId) {
    if (accountId === 'all-accounts') {
      // Get parent organization name for "All accounts"
      const parentOrgName = this.getParentOrganizationName();
      
      // Handle "All accounts" selection for organization aggregate view
      const allAccountsOption = {
        id: 'all-accounts',
        name: 'All accounts',
        type: parentOrgName,
        isAllAccounts: true
      };
      
      this.options.currentAccount = allAccountsOption;
      this.options.onAccountChange(allAccountsOption);
      this.render();
      this.bindEvents();
      this.refreshSandboxPopover();
      this.close();
      return;
    }
    
    const selectedAccount = this.options.accounts.find(acc => acc.id === accountId);
    
    if (selectedAccount) {
      // Create a copy of the selected account and modify the type to show parent organization
      const accountWithParent = { ...selectedAccount };
      accountWithParent.type = this.getParentOrganizationName();
      
      this.options.currentAccount = accountWithParent;
      this.options.onAccountChange(accountWithParent);
      this.render();
      this.bindEvents();
      this.refreshSandboxPopover();
      this.close();
    }
  }
  
  getParentOrganizationName() {
    // Look up parent organization name from window.accounts
    if (window.accounts && window.currentAccount) {
      const parentAccount = window.accounts[window.currentAccount];
      if (parentAccount && parentAccount.name) {
        return parentAccount.name;
      }
    }
    
    // Fallback - try to determine from current context
    return 'Organization';
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccountSwitcher;
}

// Global registration
window.AccountSwitcher = AccountSwitcher; 