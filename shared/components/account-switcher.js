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
  
  generateAvatarColor(name) {
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

  render() {
    const currentAccount = this.options.currentAccount;
    const variant = this.options.variant;
    const initials = this.generateInitials(currentAccount.name);
    const avatarColor = this.generateAvatarColor(currentAccount.name);
    
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
    
    this.container.innerHTML = `
      <div class="account-switcher account-switcher-${variant}">
        <button class="account-switcher-trigger" type="button">
          <div class="account-info">
            <div class="account-avatar" style="background-color: ${avatarColor};">
              <span class="avatar-initials">${initials}</span>
            </div>
            ${renderAccountDetails()}
          </div>
          <div class="account-switcher-caret">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </div>
        </button>
        
        <div class="account-switcher-dropdown">
          <div class="account-list">
            ${this.options.accounts.map(account => {
              const accountInitials = this.generateInitials(account.name);
              const accountAvatarColor = this.generateAvatarColor(account.name);
              return `
                <button class="account-item ${account.id === currentAccount.id ? 'active' : ''}" 
                        data-account-id="${account.id}" type="button">
                  <div class="account-avatar" style="background-color: ${accountAvatarColor};">
                    <span class="avatar-initials">${accountInitials}</span>
                  </div>
                  <div class="account-details">
                    <span class="account-name">${account.name}</span>
                    <span class="account-type">${account.type}</span>
                  </div>
                  ${account.id === currentAccount.id ? `
                    <div class="account-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    </div>
                  ` : ''}
                </button>
              `;
            }).join('')}
          </div>
          
          <div class="account-actions">
            <button class="account-action" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span>Account Settings</span>
            </button>
            
            <button class="account-action" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <span>Billing</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
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
        border: 1px solid var(--neutral-200);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 200px;
      }
      
      .account-switcher-trigger:hover {
        border-color: var(--neutral-300);
        background: var(--neutral-25);
      }
      
      .account-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }
      
      .account-avatar {
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
      
      .account-details {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
      }
      
      .account-name {
        font-family: var(--font-family-ui);
        font-size: var(--font-size-14);
        font-weight: var(--font-weight-medium);
        color: var(--neutral-900);
        line-height: 1.2;
      }
      
      .account-type {
        font-family: var(--font-family-ui);
        font-size: var(--font-size-12);
        color: var(--neutral-600);
        text-transform: capitalize;
        line-height: 1.2;
      }
      
      /* Variant-specific styles */
      .account-switcher-1-line .account-name {
        font-size: var(--font-size-14);
        font-weight: var(--font-weight-medium);
        color: var(--neutral-800);
      }
      
      .account-switcher-2-line .account-name {
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-medium);
        color: var(--neutral-800);
      }
      
      .account-switcher-2-line .account-type {
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-normal);
        color: var(--neutral-600);
      }
      
      .account-switcher-caret {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        color: var(--neutral-400);
        transition: transform 0.2s ease;
      }
      
      .account-switcher.open .account-switcher-caret {
        transform: rotate(180deg);
      }
      
      .account-switcher-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        background: white;
        border: 1px solid var(--neutral-200);
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px);
        transition: all 0.2s ease;
        z-index: 50;
        overflow: hidden;
      }
      
      .account-switcher.open .account-switcher-dropdown {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .account-list {
        padding: 8px;
        border-bottom: 1px solid var(--neutral-100);
      }
      
      .account-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 8px 12px;
        background: transparent;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .account-item:hover {
        background: var(--neutral-50);
      }
      
      .account-item.active {
        background: var(--brand-50);
      }
      
      .account-check {
        margin-left: auto;
        color: var(--brand-600);
      }
      
      .account-actions {
        padding: 8px;
      }
      
      .account-action {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 8px 12px;
        background: transparent;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        font-family: var(--font-family-ui);
        font-size: var(--font-size-14);
        color: var(--neutral-700);
        text-align: left;
      }
      
      .account-action:hover {
        background: var(--neutral-50);
        color: var(--neutral-900);
      }
      
      .account-action svg {
        color: var(--neutral-500);
      }
    `;
    
    document.head.appendChild(styles);
  }
  
  bindEvents() {
    const trigger = this.container.querySelector('.account-switcher-trigger');
    const dropdown = this.container.querySelector('.account-switcher-dropdown');
    const accountItems = this.container.querySelectorAll('.account-item');
    
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
        const accountId = parseInt(item.dataset.accountId);
        this.selectAccount(accountId);
      });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
  
  open() {
    this.isOpen = true;
    this.container.querySelector('.account-switcher').classList.add('open');
  }
  
  close() {
    this.isOpen = false;
    this.container.querySelector('.account-switcher').classList.remove('open');
  }
  
  selectAccount(accountId) {
    const selectedAccount = this.options.accounts.find(acc => acc.id === accountId);
    if (selectedAccount) {
      this.options.currentAccount = selectedAccount;
      this.options.onAccountChange(selectedAccount);
      this.render();
      this.bindEvents();
      this.close();
    }
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccountSwitcher;
}

// Global registration
window.AccountSwitcher = AccountSwitcher; 