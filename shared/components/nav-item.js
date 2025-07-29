/**
 * Nav Item Factory
 * Creates consistent navigation items with support for variants, tooltips, and interactions
 * Enhanced with account avatar functionality and account variant support
 * 
 * TERMINOLOGY:
 * - Account: A single account entity
 * - Organization: An account that contains multiple sub-accounts
 * - Sub-Account: An account within an organization (contextual term)
 * - Parent Account: Alternative term for organization when showing hierarchy
 */

/**
 * Account Avatar Utility
 * Shared component for creating account avatars with initials and colors
 * Used for both individual accounts and organizations
 * 
 * @param {Object} options - Avatar configuration options
 * @param {string} options.name - Full name for generating initials and color
 * @param {string} [options.initials] - Custom initials (auto-generated if not provided)
 * @param {string} [options.color] - Custom color (auto-generated if not provided)
 * @param {number} [options.size=24] - Avatar size in pixels
 * @param {boolean} [options.isAllAccounts=false] - Whether this is an "All accounts" special avatar
 * @returns {string} HTML string for the avatar element
 */
export function createAccountAvatar(options = {}) {
  const {
    name,
    initials,
    color,
    size = 24,
    isAllAccounts = false
  } = options;

  if (isAllAccounts) {
    return `
      <div class="account-avatar all-accounts-avatar" style="width: ${size}px; height: ${size}px;" role="img" aria-label="All accounts">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
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
  }

  const avatarInitials = initials || generateInitials(name);
  const avatarColor = color || generateAvatarColor(name);

  return `
    <div class="account-avatar" style="width: ${size}px; height: ${size}px; background-color: ${avatarColor} !important;" data-avatar-color="${avatarColor}" role="img" aria-label="Avatar for ${name}">
      <span class="avatar-initials" aria-hidden="true">${avatarInitials}</span>
    </div>
  `;
  // Note: data-avatar-color is used by CSS to create matching stroke colors for active account avatars
}

/**
 * Generate initials from a name
 * Uses first two characters for single words, or first letter of first two words
 * 
 * @param {string} name - Full name to generate initials from
 * @returns {string} Uppercase initials (1-2 characters)
 */
export function generateInitials(name) {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

/**
 * Generate a consistent color for an avatar based on name
 * Uses a hash function to consistently map names to colors from a predefined palette
 * 
 * @param {string} name - Name to hash for color selection
 * @returns {string} Hex color code from predefined palette
 */
export function generateAvatarColor(name) {
  if (!name) return '#3B82F6';
  
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
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Create a navigation item with support for multiple variants and configurations
 * Main factory function for creating consistent nav items across the application
 * 
 * @param {Object} options - Navigation item configuration
 * @param {string} [options.variant='default'] - Item variant: 'default', 'workload', 'compact', 'account'
 * @param {string} [options.icon] - SVG icon HTML string
 * @param {string} [options.label] - Display label text
 * @param {string} [options.tooltip] - Tooltip text for hover
 * @param {boolean} [options.caret=false] - Show dropdown caret
 * @param {boolean} [options.active=false] - Whether item is currently active
 * @param {boolean} [options.disabled=false] - Whether item is disabled
 * @param {Function} [options.onClick] - Click handler function
 * @param {string} [options.href] - Link destination
 * @param {string} [options.className=''] - Additional CSS classes
 * @param {Object} [options.badge] - Badge configuration {text, variant}
 * 
 * // Account-specific options (see docs/terminology.md)
 * @param {string} [options.accountName] - Account or organization name
 * @param {string} [options.accountType] - Legacy: use parentAccount instead
 * @param {string} [options.parentAccount] - Parent organization name (for sub-accounts)
 * @param {string} [options.avatarInitials] - Custom avatar initials
 * @param {string} [options.avatarColor] - Custom avatar color
 * @param {boolean} [options.showCheck=false] - Show check mark for active accounts
 * @param {boolean} [options.showCaret=false] - Show caret for account dropdowns
 * @param {boolean} [options.isAllAccounts=false] - Special "All accounts" variant
 * @param {number} [options.lines=2] - Layout lines: 1 (single) or 2 (double)
 * @param {number} [options.subAccountCount] - Number of sub-accounts (shown when active)
 * 
 * @returns {HTMLElement} Configured navigation item element
 */
export function createNavItem(options = {}) {
  const {
    variant = 'default', // 'default', 'workload', 'compact', 'account'
    icon,
    label,
    tooltip,
    caret = false,
    active = false,
    disabled = false,
    onClick,
    href,
    className = '',
    badge,
    // Account-specific options (see docs/terminology.md for definitions)
    accountName,        // The account name (individual account or organization)
    accountType,        // Legacy: use parentAccount instead
    parentAccount,      // The parent organization name (for sub-accounts)
    avatarInitials,     // Custom initials (auto-generated if not provided)
    avatarColor,        // Custom avatar color (auto-generated if not provided)
    showCheck = false,  // Show check mark (typically for active accounts)
    showCaret = false,  // Show caret arrow (for opening popover with sub-accounts)
    isAllAccounts = false, // Special "All accounts" variant
    lines = 2,          // 1 = single line (account only), 2 = double line (account + organization)
    subAccountCount     // Number of sub-accounts for organizations (shown when active)
  } = options;

  // Create the main nav item element
  const navItem = document.createElement('a');
  
  // Build class names including lines modifier for account variant
  const classNames = [
    'nav-item',
    variant !== 'default' ? `nav-item--${variant}` : '',
    variant === 'account' ? `lines-${lines}` : '',
    active ? 'active' : '',
    disabled ? 'disabled' : '',
    className
  ].filter(Boolean).join(' ');
  
  navItem.className = classNames;
  navItem.href = href || '#';
  
  // Accessibility attributes
  if (disabled) {
    navItem.setAttribute('tabindex', '-1');
    navItem.setAttribute('aria-disabled', 'true');
  }
  
  // Set ARIA label for better screen reader support
  const ariaLabel = variant === 'account' 
    ? `${accountName || label}${lines === 2 && (parentAccount || accountType) ? `, ${parentAccount || accountType}` : ''}${subAccountCount ? `, ${subAccountCount} sub-accounts` : ''}${active ? ', currently selected' : ''}`
    : `${label}${active ? ', currently selected' : ''}${disabled ? ', disabled' : ''}`;
  navItem.setAttribute('aria-label', ariaLabel);
  
  // Set role and state attributes
  if (variant === 'account' || showCaret) {
    navItem.setAttribute('role', 'menuitem');
    if (showCaret) {
      navItem.setAttribute('aria-haspopup', 'menu');
      navItem.setAttribute('aria-expanded', 'false');
    }
  } else {
    navItem.setAttribute('role', 'link');
  }
  
  if (active) {
    navItem.setAttribute('aria-current', 'page');
  }

  // Create icon element (or account avatar for account variant)
  let iconElement = '';
  if (variant === 'account') {
    // Use account avatar instead of regular icon
    iconElement = createAccountAvatar({
      name: accountName,
      initials: avatarInitials,
      color: avatarColor,
      size: 24,
      isAllAccounts
    });
  } else if (icon) {
    iconElement = `
      <div class="nav-item-icon">
        ${icon}
      </div>
    `;
  }

  // Create label element (account variant has different structure)
  let labelElement = '';
  if (variant === 'account') {
    // For 2-line: use parentAccount if provided, else fall back to accountType for backward compatibility
    const secondLine = parentAccount || accountType;
    
    // Create count element for organizations (shown when active)
    let countElement = '';
    if (subAccountCount && subAccountCount > 0) {
      countElement = `<span class="account-count">${subAccountCount}</span>`;
    }
    
    labelElement = `
      <div class="account-details">
        <span class="account-name">${accountName || label}${countElement}</span>
        ${lines === 2 && secondLine ? `<span class="account-type">${secondLine}</span>` : ''}
      </div>
    `;
  } else {
    labelElement = `
      <span class="nav-item-label">${label}</span>
    `;
  }

  // Create caret element (for workload variant, explicit caret, or account variant)
  let caretElement = '';
  if (caret || variant === 'workload' || (variant === 'account' && showCaret)) {
    let caretClass;
    if (variant === 'workload') {
      caretClass = 'nav-item-caret';
    } else if (variant === 'account') {
      caretClass = 'account-caret';
    } else {
      caretClass = 'workload-caret-icon';
    }
    
    caretElement = `
      <div class="${caretClass}" aria-hidden="true">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M0.606072 2.33351C0.307015 2.62011 0.296913 3.09487 0.58351 3.39393L3.45851 6.39393C3.59989 6.54146 3.79535 6.62492 3.99969 6.625C4.20403 6.62509 4.39955 6.54179 4.54106 6.39438L7.41606 3.39938C7.70291 3.10056 7.6932 2.62579 7.39438 2.33894C7.09556 2.0521 6.62079 2.0618 6.33394 2.36062L4.00045 4.79151L1.66649 2.35607C1.3799 2.05701 0.905129 2.04691 0.606072 2.33351Z" fill="currentColor"/>
        </svg>
      </div>
    `;
  }

  // Create check element (for account variant when active)
  let checkElement = '';
  if (variant === 'account' && (showCheck || active)) {
    checkElement = `
      <div class="account-check" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="9,12 11,14 15,10"/>
        </svg>
      </div>
    `;
  }

  // Create badge element
  let badgeElement = '';
  if (badge) {
    badgeElement = `
      <span class="nav-badge ${badge.variant || 'default'}" aria-label="Badge: ${badge.text}">${badge.text}</span>
    `;
  }

  // Create tooltip element
  let tooltipElement = '';
  if (tooltip) {
    tooltipElement = `
      <div class="nav-item-tooltip" role="tooltip" aria-hidden="true">${tooltip}</div>
    `;
  }

  // Assemble the nav item
  navItem.innerHTML = `
    ${iconElement}
    ${labelElement}
    ${badgeElement}
    ${caretElement}
    ${checkElement}
    ${tooltipElement}
  `;

  // Add click handler
  if (onClick && !disabled) {
    navItem.addEventListener('click', (e) => {
      if (href === '#') {
        e.preventDefault();
      }
      onClick(e, options);
    });
  }

  return navItem;
}

/**
 * Create a navigation section divider with title
 * 
 * @param {string} title - Section title text
 * @returns {HTMLElement} Section divider element
 */
export function createNavSection(title) {
  const section = document.createElement('div');
  section.className = 'nav-section';
  section.setAttribute('role', 'separator');
  section.setAttribute('aria-label', `Section: ${title}`);
  section.textContent = title;
  return section;
}

/**
 * Create a simple navigation divider line
 * 
 * @returns {HTMLElement} Divider element
 */
export function createNavDivider() {
  const divider = document.createElement('div');
  divider.className = 'nav-divider';
  divider.setAttribute('role', 'separator');
  divider.setAttribute('aria-hidden', 'true');
  return divider;
}

/**
 * Nav Item Builder - Fluent API for building navigation items
 * Provides a chainable interface for configuring nav items with method chaining
 * 
 * @example
 * const item = navItem()
 *   .label('Settings')
 *   .icon('<svg>...</svg>')
 *   .tooltip('Settings')
 *   .active(true)
 *   .build();
 */
export class NavItemBuilder {
  constructor() {
    this.options = {};
  }

  variant(variant) {
    this.options.variant = variant;
    return this;
  }

  icon(icon) {
    this.options.icon = icon;
    return this;
  }

  label(label) {
    this.options.label = label;
    return this;
  }

  tooltip(tooltip) {
    this.options.tooltip = tooltip;
    return this;
  }

  badge(text, variant = 'default') {
    this.options.badge = { text, variant };
    return this;
  }

  active(active = true) {
    this.options.active = active;
    return this;
  }

  disabled(disabled = true) {
    this.options.disabled = disabled;
    return this;
  }

  href(href) {
    this.options.href = href;
    return this;
  }

  onClick(handler) {
    this.options.onClick = handler;
    return this;
  }

  className(className) {
    this.options.className = className;
    return this;
  }

  caret(caret = true) {
    this.options.caret = caret;
    return this;
  }

  // Account-specific builder methods
  accountName(name) {
    this.options.accountName = name;
    return this;
  }

  accountType(type) {
    this.options.accountType = type;
    return this;
  }

  parentAccount(parent) {
    this.options.parentAccount = parent;
    return this;
  }

  lines(lines) {
    this.options.lines = lines;
    return this;
  }

  avatarInitials(initials) {
    this.options.avatarInitials = initials;
    return this;
  }

  avatarColor(color) {
    this.options.avatarColor = color;
    return this;
  }

  showCheck(show = true) {
    this.options.showCheck = show;
    return this;
  }

  showCaret(show = true) {
    this.options.showCaret = show;
    return this;
  }

  isAllAccounts(isAll = true) {
    this.options.isAllAccounts = isAll;
    return this;
  }

  subAccountCount(count) {
    this.options.subAccountCount = count;
    return this;
  }

  build() {
    return createNavItem(this.options);
  }
}

/**
 * Factory function to create a new navigation item builder
 * Convenience function to start building nav items with fluent API
 * 
 * @returns {NavItemBuilder} New builder instance for chaining
 */
export function navItem() {
  return new NavItemBuilder();
}

/**
 * Preset configurations for common navigation item types
 * Provides quick access to frequently used nav item patterns
 * 
 * @namespace NavItemPresets
 * @example
 * // Create a home nav item
 * const homeItem = NavItemPresets.home(true);
 * container.appendChild(homeItem.build());
 * 
 * // Create an account item
 * const accountItem = NavItemPresets.account('Team Name', 'Organization', false);
 * container.appendChild(accountItem.build());
 */
export const NavItemPresets = {
  home: (active = false) => navItem()
    .icon('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>')
    .label('Home')
    .tooltip('Home')
    .active(active),
    
  settings: (active = false) => navItem()
    .icon('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>')
    .label('Settings')
    .tooltip('Settings')
    .active(active),
    
  workload: (label, active = false) => navItem()
    .variant('workload')
    .icon('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>')
    .label(label)
    .tooltip(label)
    .active(active),

  // 1-line account item (shows single account or organization name)
  accountSingle: (accountName, active = false) => navItem()
    .variant('account')
    .lines(1)
    .accountName(accountName)
    .active(active),

  // 2-line account item (shows sub-account + parent organization)
  account: (accountName, parentOrganization, active = false) => navItem()
    .variant('account')
    .lines(2)
    .accountName(accountName)
    .parentAccount(parentOrganization)
    .active(active),

  // 2-line "All accounts" item (special case for organization-wide access)
  allAccounts: (parentOrganization = 'Organization', active = false) => navItem()
    .variant('account')
    .lines(2)
    .accountName('All accounts')
    .parentAccount(parentOrganization)
    .isAllAccounts(true)
    .active(active),

  // 1-line "All accounts" item (simplified version)
  allAccountsSingle: (active = false) => navItem()
    .variant('account')
    .lines(1)
    .accountName('All accounts')
    .isAllAccounts(true)
    .active(active),

  // Account item with caret (for navigation panels that open popovers)
  accountWithCaret: (accountName, parentOrganization, active = false) => navItem()
    .variant('account')
    .lines(2)
    .accountName(accountName)
    .parentAccount(parentOrganization)
    .showCaret(true)
    .active(active),

  // 1-line account with caret (for compact nav panels)
  accountSingleWithCaret: (accountName, active = false) => navItem()
    .variant('account')
    .lines(1)
    .accountName(accountName)
    .showCaret(true)
    .active(active)
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    createNavItem, 
    createNavSection, 
    createNavDivider, 
    createAccountAvatar,
    generateInitials,
    generateAvatarColor,
    NavItemBuilder, 
    navItem, 
    NavItemPresets 
  };
}

// Global registration
window.createNavItem = createNavItem;
window.createNavSection = createNavSection;
window.createNavDivider = createNavDivider;
window.createAccountAvatar = createAccountAvatar;
window.generateInitials = generateInitials;
window.generateAvatarColor = generateAvatarColor;
window.NavItemBuilder = NavItemBuilder;
window.navItem = navItem;
window.NavItemPresets = NavItemPresets; 