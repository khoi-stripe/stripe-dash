/**
 * Account Groups Filter Component
 * A reusable component that provides intelligent viewport positioning and full functionality
 */

class AccountGroupsFilter {
  constructor(options = {}) {
    this.options = {
      triggerId: 'filterTrigger',
      popoverId: 'filterPopover',
      searchInputId: 'searchInput',
      selectAllContainerId: 'selectAllContainer',
      accountsListId: 'accountsList',
      triggerOptionId: 'filterOption',
      accountGroups: {},
      generateAccountGroups: null,
      namespace: '', // For avoiding conflicts when multiple filters on same page
      ...options
    };
    
    this.currentGroup = 'all';
    this.searchTerm = '';
    this.accountGroups = {};
    this.isCustomMode = false; // Track if user has made manual changes to account selection
    this.isRepositioning = false; // Prevent cascade repositioning
    this.committedSelection = null; // Store committed selection state for cancel functionality
    this.triggerDimensions = null; // Store trigger size for consistent positioning
    this.alignmentMode = 'left'; // 'left' or 'right' - determines which edge to align to
    this.alignmentLocked = false; // Whether alignment mode has been determined
    this.retryCount = 0; // Track initialization retries
    this.maxRetries = 3; // Maximum number of initialization retries
    
    this.init();
  }
  
  init() {
    // Ensure DOM is ready before initializing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponent());
    } else {
      this.initializeComponent();
    }
  }
  
  initializeComponent() {
    // Generate account groups if function provided
    if (this.options.generateAccountGroups) {
      try {
        this.accountGroups = this.options.generateAccountGroups();
      } catch (error) {
        console.error('Error generating account groups:', error);
        this.accountGroups = this.options.accountGroups || {};
      }
    } else {
      this.accountGroups = this.options.accountGroups || {};
    }
    
    // Verify all required DOM elements exist before proceeding
    const requiredElements = [
      this.options.triggerId,
      this.options.popoverId,
      this.options.searchInputId,
      this.options.selectAllContainerId,
      this.options.accountsListId,
      this.options.triggerOptionId
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
      console.warn('AccountGroupsFilter: Missing required DOM elements:', missingElements);
      
      // Retry initialization after a delay if we haven't exceeded max retries
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`AccountGroupsFilter: Retrying initialization (attempt ${this.retryCount}/${this.maxRetries})`);
        setTimeout(() => this.initializeComponent(), 100 * this.retryCount); // Increasing delay
        return;
      } else {
        console.error('AccountGroupsFilter: Failed to initialize after maximum retries');
        return;
      }
    }
    
    this.attachEventListeners();
    this.currentGroup = 'all';
    this.renderAccounts('all');
    // Set default trigger label to All with folder icon (brand-600)
    this.isCustomMode = false;
    this.updateTriggerLabel('all');
    this.addScrollEffect();
    
    // Check for overflow after initial render
    setTimeout(() => {
      this.checkAccountsListOverflow();
    }, 50);
  }
  
  calculateTriggerDimensions() {
    const trigger = document.getElementById(this.options.triggerId);
    if (!trigger) return;
    
    // Get current trigger dimensions
    const rect = trigger.getBoundingClientRect();
    this.triggerDimensions = {
      width: rect.width,
      height: rect.height
    };
  }
  
  updateTriggerSize() {
    // Public method to recalculate position based on current trigger size
    const popover = document.getElementById(this.options.popoverId);
    if (popover && popover.style.display === 'flex') {
      this.positionPopover(false); // Keep same alignment mode, just recalculate position
    }
  }
  
  calculateAlignmentMode() {
    const trigger = document.getElementById(this.options.triggerId);
    if (!trigger || !this.triggerDimensions) return;
    
    const triggerRect = trigger.getBoundingClientRect();
    const popoverWidth = 532;
    const viewportWidth = window.innerWidth;
    const margin = 16;
    
    // Check if right-aligned popover would go off right edge
    const triggerLeftInViewport = triggerRect.left;
    const rightAlignedLeft = triggerLeftInViewport + this.triggerDimensions.width - popoverWidth;
    const rightAlignedRight = rightAlignedLeft + popoverWidth;
    
    // Determine alignment: prefer right, fallback to left
    if (rightAlignedRight > viewportWidth - margin || rightAlignedLeft < margin) {
      // Right alignment would go off edge - use left alignment
      this.alignmentMode = 'left';
    } else {
      // Right alignment fits - use right alignment
      this.alignmentMode = 'right';
    }
  }
  
  positionPopover(forceRecalculate = false) {
    if (this.isRepositioning && !forceRecalculate) {
      return; // Prevent cascade repositioning
    }
    
    const trigger = document.getElementById(this.options.triggerId);
    const popover = document.getElementById(this.options.popoverId);
    
    if (!trigger || !popover) {
      return;
    }
    
    this.isRepositioning = true;
    
    // Determine alignment mode only once (when first opening or forcing recalculation)
    if (!this.alignmentLocked || forceRecalculate) {
      this.calculateTriggerDimensions();
      this.calculateAlignmentMode();
      this.alignmentLocked = true;
    }
    
    // Always get current trigger dimensions and position
    const triggerRect = trigger.getBoundingClientRect();
    const currentTriggerWidth = triggerRect.width;
    const currentTriggerHeight = triggerRect.height;
    
    const popoverWidth = 532;
    const popoverHeight = 360;
    const viewportHeight = window.innerHeight;
    const margin = 16;
    
    // Calculate position based on locked alignment mode but current trigger size
    let left;
    switch (this.alignmentMode) {
      case 'left':
        left = 0; // Left-align to trigger
        break;
      case 'right':
      default:
        left = currentTriggerWidth - popoverWidth; // Right-align to current trigger width
        break;
    }
    
    // Calculate vertical position
    let top = currentTriggerHeight + 4; // 4px below current trigger
    
    // Check if popover would go off the bottom of viewport
    if (triggerRect.bottom + popoverHeight + 4 > viewportHeight - margin) {
      // Position above trigger instead
      top = -popoverHeight - 4;
    }
    
    // Ensure popover doesn't go off the top
    if (triggerRect.top + top < margin) {
      top = margin - triggerRect.top;
    }
    
    // Apply positioning (relative to trigger)
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
    
    // Reset repositioning flag
    this.isRepositioning = false;
  }
  
  togglePopover() {
    const popover = document.getElementById(this.options.popoverId);
    const trigger = document.getElementById(this.options.triggerId);
    
    if (!popover || !trigger) {
      return;
    }
    
    const isOpen = popover.style.display === 'flex';
    
    if (isOpen) {
      popover.style.display = 'none';
      trigger.classList.remove('open');
      // Clear stored position data when closing
      this.triggerDimensions = null;
      this.alignmentMode = 'left';
      this.alignmentLocked = false;
    } else {
      // Capture current selection state before opening
      this.captureCommittedSelection();
      popover.style.display = 'flex';
      trigger.classList.add('open');
      // Calculate fresh position when opening
      this.positionPopover(true);
      // Update Apply button state when opening
      this.updateApplyButtonState();
      // Check for scroll overflow after popover is shown and positioned
      setTimeout(() => {
        this.checkAccountsListOverflow();
      }, 10);
    }
  }
  
  renderAccounts(groupKey) {
    const selectAllContainer = document.getElementById(this.options.selectAllContainerId);
    const accountsList = document.getElementById(this.options.accountsListId);
    const accounts = this.accountGroups[groupKey] || [];
    
    if (!selectAllContainer || !accountsList) {
      console.warn('AccountGroupsFilter: Required containers not found for renderAccounts');
      return;
    }
    
    // Ensure we have account groups data
    if (!this.accountGroups || Object.keys(this.accountGroups).length === 0) {
      console.warn('AccountGroupsFilter: No account groups data available');
      return;
    }
    
    this.currentGroup = groupKey;
    
    // Create select all checkbox (pinned at top) - shows count only
    const selectAllHTML = `
      <div class="select-all-item">
        <div class="checkbox-container">
          <input type="checkbox" id="${this.options.namespace}selectAll" checked>
        </div>
        <div class="account-filter-content">
          <label for="${this.options.namespace}selectAll" id="${this.options.namespace}selectionCount">${accounts.length} selected</label>
        </div>
      </div>
    `;
    
    // Create account items (scrollable)
    const accountsHTML = accounts.map(account => {
      const iconStyle = account.backgroundColor ? 
        `style="background-color: ${account.backgroundColor};"` : 
        '';
      const iconClass = account.backgroundColor ? 'account-icon' : `account-icon ${account.color}`;
      
      // Use avatar image if available, otherwise fall back to initials
      const avatarContent = account.avatar ? 
        `<img src="${account.avatar}" alt="${account.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` :
        account.initials;
      
      return `
        <div class="account-item">
          <div class="checkbox-container">
            <input type="checkbox" ${account.checked ? 'checked' : ''}>
          </div>
          <div class="account-filter-content">
            <div class="${iconClass}" ${iconStyle}>${avatarContent}</div>
            <label>${account.name}</label>
          </div>
        </div>
      `;
    }).join('');
    
    // Set innerHTML separately
    selectAllContainer.innerHTML = selectAllHTML;
    accountsList.innerHTML = accountsHTML;
    
    // Reattach event listeners
    this.attachCheckboxListeners();
    this.attachSelectAllListener();
    
    // Apply search filter if active
    if (this.searchTerm) {
      this.filterAccountsBySearch(this.searchTerm);
    }
    
    this.updateSelectionCount();
    this.updateSelectAllState();
    this.checkAccountsListOverflow();
    
    // Do not update trigger label until user clicks Apply
  }
  
  attachEventListeners() {
    // Trigger button
    const trigger = document.getElementById(this.options.triggerId);
    if (trigger) {
      trigger.addEventListener('click', () => this.togglePopover());
    }
    
    // Search functionality
    const searchInput = document.getElementById(this.options.searchInputId);
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        this.filterAccountsBySearch(this.searchTerm);
      });
    }
    
    // Group selection functionality
    document.querySelectorAll(`#${this.options.popoverId} .group-item`).forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll(`#${this.options.popoverId} .group-item`).forEach(g => g.classList.remove('active'));
        item.classList.add('active');
        
        const group = item.getAttribute('data-group');
        if (group) {
          this.currentGroup = group;
          this.isCustomMode = false; // Reset custom mode when selecting a group
          this.renderAccounts(group);
        }
      });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      const popover = document.getElementById(this.options.popoverId);
      const trigger = document.getElementById(this.options.triggerId);
      
      if (popover && trigger && popover.style.display === 'flex') {
        if (!popover.contains(e.target) && !trigger.contains(e.target)) {
          this.togglePopover();
        }
      }
    });
    
    // Reposition on window resize and scroll (with debounce)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const popover = document.getElementById(this.options.popoverId);
        if (popover && popover.style.display === 'flex') {
          // Force recalculation on significant viewport changes
          this.positionPopover(true);
        }
      }, 100);
    });
    
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const popover = document.getElementById(this.options.popoverId);
        if (popover && popover.style.display === 'flex') {
          // Just reposition based on current alignment mode and trigger size
          this.positionPopover(false);
        }
      }, 50);
    });
  }
  
  attachCheckboxListeners() {
    // Add change listeners to checkboxes (only in scrollable accounts list)
    document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]`).forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.handleAccountCheckboxChange();
      });
    });
    
    // Make entire account row clickable (only in scrollable accounts list)
    document.querySelectorAll(`#${this.options.accountsListId} .account-item`).forEach(accountItem => {
      accountItem.addEventListener('click', (e) => {
        // Don't trigger if clicking directly on the checkbox (to avoid double-toggling)
        if (e.target.type === 'checkbox') {
          return;
        }
        
        const checkbox = accountItem.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      });
    });
  }
  
  attachSelectAllListener() {
    const selectAllCheckbox = document.getElementById(`${this.options.namespace}selectAll`);
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', () => {
        const isChecked = selectAllCheckbox.checked;
        document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]`).forEach(checkbox => {
          checkbox.checked = isChecked;
        });
        this.handleSelectAllChange();
      });
    }
    
    // Make entire select all row clickable
    document.querySelectorAll(`#${this.options.selectAllContainerId} .select-all-item`).forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.type === 'checkbox') {
          return;
        }
        
        const selectAllItem = e.currentTarget;
        const checkbox = selectAllItem.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      });
    });
  }
  
  filterAccountsBySearch(searchTerm) {
    document.querySelectorAll(`#${this.options.accountsListId} .account-item`).forEach(item => {
      const label = item.querySelector('label');
      if (label) {
        const accountName = label.textContent.toLowerCase();
        const shouldShow = accountName.includes(searchTerm.toLowerCase());
        item.style.display = shouldShow ? 'flex' : 'none';
      }
    });
    
    this.updateSelectionCount();
    this.updateSelectAllState();
    this.checkAccountsListOverflow();
  }
  
  updateSelectionCount() {
    const checked = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]:checked`).length;
    const total = document.querySelectorAll(`#${this.options.accountsListId} .account-item`).length;
    const selectionCount = document.getElementById(`${this.options.namespace}selectionCount`);
    
    if (selectionCount) {
      selectionCount.textContent = `${checked} selected`;
    }
    
    // Update Apply button state and hide validation error when selection changes
    this.updateApplyButtonState();
    this.hideValidationError();
  }
  
  updateSelectAllState() {
    const accountCheckboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]`);
    const checkedCount = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]:checked`).length;
    const selectAllCheckbox = document.getElementById(`${this.options.namespace}selectAll`);
    
    if (selectAllCheckbox) {
      if (checkedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
      } else if (checkedCount === accountCheckboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
      } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
      }
    }
  }
  
    addScrollEffect() {
    const accountsList = document.getElementById(this.options.accountsListId);
    let scrollTimeout;

    if (accountsList) {
      accountsList.addEventListener('scroll', function() {
        // Add scrolling class
        this.classList.add('scrolling');
        
        // Clear previous timeout
        clearTimeout(scrollTimeout);
        
        // Set timeout to remove scrolling class when scrolling stops
        scrollTimeout = setTimeout(() => {
          this.classList.remove('scrolling');
        }, 300); // 300ms delay after scrolling stops
      });
    }
  }
  
  // Handle individual account checkbox changes
  handleAccountCheckboxChange() {
    this.updateSelectionCount();
    this.updateSelectAllState();
  }
  
  // Handle select all checkbox changes
  handleSelectAllChange() {
    this.updateSelectionCount();
  }
  
  // Get a human-readable display name for a group key
  getGroupDisplayName(groupKey) {
    if (!groupKey || groupKey === 'all') {
      return 'All';
    }
    return groupKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Update the trigger label text
  updateTriggerLabel(groupKey) {
    const triggerOption = document.getElementById(this.options.triggerOptionId);
    
    if (!triggerOption) {
      console.warn('AccountGroupsFilter: Trigger option element not found');
      return;
    }
    
    // Ensure we have account data
    const accountsList = document.getElementById(this.options.accountsListId);
    if (!accountsList) {
      console.warn('AccountGroupsFilter: Accounts list not found for label calculation');
      return;
    }
    
    // Get selected accounts info
    const selectedCheckboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]:checked`);
    const selectedCount = selectedCheckboxes.length;
    
    // Get total accounts for this group to check if all are selected (full group)
    const totalAccountsInGroup = document.querySelectorAll(`#${this.options.accountsListId} .account-item`).length;
    const isFullGroupSelected = selectedCount === totalAccountsInGroup && selectedCount > 0;
    
    // Get selected account names
    const selectedAccountNames = Array.from(selectedCheckboxes).map(checkbox => {
      const accountItem = checkbox.closest('.account-item');
      const label = accountItem.querySelector('label');
      return label ? label.textContent.trim() : '';
    }).filter(name => name);
    
    const folderIcon = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px; flex-shrink: 0; color: var(--brand-600);">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M16 7.82679C16 7.94141 15.9803 8.05518 15.9417 8.16312L13.974 13.6727C13.6898 14.4687 12.9358 15 12.0906 15H2C0.895431 15 0 14.1046 0 13V3C0 1.89543 0.89543 1 2 1H4.58579C4.851 1 5.10536 1.10536 5.29289 1.29289L6 2H11C12.1046 2 13 2.89543 13 4V5H14C15.1046 5 16 5.89543 16 7V7.82679ZM3.75 6.5C3.33579 6.5 3 6.16421 3 5.75C3 5.33579 3.33579 5 3.75 5H11.5V4C11.5 3.72386 11.2761 3.5 11 3.5H6C5.60218 3.5 5.22064 3.34196 4.93934 3.06066L4.37868 2.5H2C1.72386 2.5 1.5 2.72386 1.5 3V13C1.5 13.2761 1.72386 13.5 2 13.5H12.0906C12.3019 13.5 12.4904 13.3672 12.5614 13.1682L14.5 7.74018V7C14.5 6.72386 14.2761 6.5 14 6.5H3.75Z" fill="currentColor"/>
    </svg>`;
    
    let displayText = '';
    
    if (selectedCount === 0) {
      // No accounts selected - show default group name with folder icon
      const groupName = this.getGroupDisplayName(groupKey);
      displayText = `${folderIcon}<span style="color: var(--brand-600);">${groupName}</span>`;
    } else if (isFullGroupSelected && !this.isCustomMode) {
      // Full group selected - show folder icon + group name (no count)
      const groupName = this.getGroupDisplayName(groupKey);
      displayText = `${folderIcon}<span style="color: var(--brand-600);">${groupName}</span>`;
    } else if (selectedCount === 1) {
      // Single account selected - show account name only (no icon)
      displayText = `<span style="color: var(--brand-600);">${selectedAccountNames[0]}</span>`;
    } else {
      // Multiple accounts selected but not a full group - show first account + more count (no parentheses)
      const firstName = selectedAccountNames[0];
      const othersCount = selectedCount - 1;
      displayText = `<span style=\"color: var(--brand-600);\">${firstName} +${othersCount} more</span>`;
    }
    
    triggerOption.innerHTML = displayText;
    
    // Recalculate position based on new trigger size - use setTimeout to ensure DOM has updated
    const popover = document.getElementById(this.options.popoverId);
    if (popover && popover.style.display === 'flex') {
      setTimeout(() => {
        // Keep alignment mode locked; only recalc position relative to current trigger size
        this.positionPopover(false);
      }, 10);
    }
  }
  
  // Public method to apply selection (can be overridden)
  applySelection() {
    // Check if at least one account is selected
    const checkedCheckboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]:checked`);
    
    if (checkedCheckboxes.length === 0) {
      // Don't apply if no accounts are selected
      this.showValidationError();
      return;
    }
    
    // Hide validation error if it was showing
    this.hideValidationError();
    
    // Update trigger label based on current selection state
    this.updateTriggerBasedOnSelection();
    this.togglePopover();
    // Override this method in implementations for custom behavior
  }
  
  // Update trigger label based on current selection
  updateTriggerBasedOnSelection() {
    const allCheckboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]`);
    const checkedCheckboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]:checked`);
    const checkedCount = checkedCheckboxes.length;
    const totalCount = allCheckboxes.length;
    

    
    // If all visible accounts are selected, keep the current group name
    // Otherwise, show custom selection
    if (checkedCount === totalCount && checkedCount > 0) {
      // All accounts in current view are selected - keep current group label
      this.isCustomMode = false;
      this.updateTriggerLabel(this.currentGroup);
    } else {
      // Partial selection or no selection - switch to custom
      this.isCustomMode = true;
      this.updateTriggerLabel('custom');
    }
  }
  
  // Capture the current selection state (for cancel functionality)
  captureCommittedSelection() {
    const checkboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]`);
    this.committedSelection = [];
    
    checkboxes.forEach((checkbox, index) => {
      this.committedSelection.push({
        index: index,
        checked: checkbox.checked
      });
    });
  }
  
  // Restore the committed selection state (when canceling)
  restoreCommittedSelection() {
    if (!this.committedSelection) return;
    
    const checkboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]`);
    
    this.committedSelection.forEach((item) => {
      if (checkboxes[item.index]) {
        checkboxes[item.index].checked = item.checked;
      }
    });
    
    // Update the visual state
    this.updateSelectionCount();
    this.updateSelectAllState();
  }
  
  // Public method to close the popover
  close() {
    // Restore the original selection when canceling
    this.restoreCommittedSelection();
    
    // Hide validation error when closing
    this.hideValidationError();
    
    const popover = document.getElementById(this.options.popoverId);
    const trigger = document.getElementById(this.options.triggerId);
    
    if (popover && trigger) {
      popover.style.display = 'none';
      trigger.classList.remove('open');
      
      // Clear stored position data when closing
      this.triggerDimensions = null;
      this.alignmentMode = 'left';
      this.alignmentLocked = false;
    }
  }
  
    // Show validation error when no accounts are selected
  showValidationError() {
    // CSS handles the tooltip display via .btn-apply.disabled:hover::after
    // No JavaScript needed for tooltip
  }

  // Hide validation error
  hideValidationError() {
    // CSS handles the tooltip display via .btn-apply.disabled:hover::after
    // No JavaScript needed for tooltip
  }
  
  // Update Apply button state based on selection
  updateApplyButtonState() {
    const applyButton = document.querySelector(`#${this.options.popoverId} .btn-apply`);
    if (!applyButton) return;
    
    const checkedCheckboxes = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]:checked`);
    const hasSelection = checkedCheckboxes.length > 0;
    
    if (hasSelection) {
      applyButton.disabled = false;
      applyButton.classList.remove('disabled');
      this.hideValidationError();
    } else {
      applyButton.disabled = true;
      applyButton.classList.add('disabled');
      this.showValidationError();
      
      // Set CSS custom properties for tooltip positioning
      const rect = applyButton.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const topY = rect.top;
      
      // Update CSS custom properties for the tooltip
      document.documentElement.style.setProperty('--tooltip-x', `${centerX}px`);
      document.documentElement.style.setProperty('--tooltip-y', `${topY}px`);
    }
  }
  
  // Public method to refresh the component data
  refresh() {
    // Re-generate account groups if function provided
    if (this.options.generateAccountGroups) {
      try {
        this.accountGroups = this.options.generateAccountGroups();
        this.rebuildGroupButtons();
        this.renderAccounts(this.currentGroup);
      } catch (error) {
        console.error('Error refreshing account groups:', error);
      }
    }
  }
  
  rebuildGroupButtons() {
    // Find the popover and groups container
    const popover = document.getElementById(this.options.popoverId);
    if (!popover) {
      console.warn('AccountGroupsFilter: Popover not found for rebuilding group buttons');
      return;
    }
    
    const groupsContainer = popover.querySelector('.groups-section');
    const accountsSection = popover.querySelector('.accounts-section');
    
    if (!groupsContainer || !accountsSection) {
      console.warn('AccountGroupsFilter: Required containers not found for rebuilding group buttons');
      return;
    }
    
    // Check if we have any custom groups (excluding 'all')
    const customGroupKeys = Object.keys(this.accountGroups);
    const hasCustomGroups = customGroupKeys.length > 0;
    
    if (!hasCustomGroups) {
      // No custom groups - hide the groups section and show only accounts
      groupsContainer.style.display = 'none';
      accountsSection.style.width = '100%';
      
      // Create an "all" group with all available accounts
      this.createAllAccountsGroup();
      this.currentGroup = 'all';
      this.renderAccounts('all');
      
      console.log('🔄 No custom groups found - showing all accounts only');
      return;
    }
    
    // Has custom groups - show the groups section
    groupsContainer.style.display = '';
    accountsSection.style.width = '';
    
    // Preserve the header and search bar
    const header = groupsContainer.querySelector('.groups-header');
    const searchBar = groupsContainer.querySelector('.search-bar');
    
    // Clear existing buttons but preserve header and search
    groupsContainer.innerHTML = '';
    
    // Re-add header if it existed
    if (header) {
      groupsContainer.appendChild(header);
    } else {
      // Create header if it doesn't exist
      const headerHTML = `
        <div class="groups-header">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px; flex-shrink: 0;">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M16 7.82679C16 7.94141 15.9803 8.05518 15.9417 8.16312L13.974 13.6727C13.6898 14.4687 12.9358 15 12.0906 15H2C0.895431 15 0 14.1046 0 13V3C0 1.89543 0.89543 1 2 1H4.58579C4.851 1 5.10536 1.10536 5.29289 1.29289L6 2H11C12.1046 2 13 2.89543 13 4V5H14C15.1046 5 16 5.89543 16 7V7.82679ZM3.75 6.5C3.33579 6.5 3 6.16421 3 5.75C3 5.33579 3.33579 5 3.75 5H11.5V4C11.5 3.72386 11.2761 3.5 11 3.5H6C5.60218 3.5 5.22064 3.34196 4.93934 3.06066L4.37868 2.5H2C1.72386 2.5 1.5 2.72386 1.5 3V13C1.5 13.2761 1.72386 13.5 2 13.5H12.0906C12.3019 13.5 12.4904 13.3672 12.5614 13.1682L14.5 7.74018V7C14.5 6.72386 14.2761 6.5 14 6.5H3.75Z" fill="currentColor"/>
          </svg>
          Groups
        </div>
      `;
      groupsContainer.insertAdjacentHTML('afterbegin', headerHTML);
    }
    
    // Re-add search bar if it existed
    if (searchBar) {
      groupsContainer.appendChild(searchBar);
    }
    
    // Always create "All" button first
    this.createAllAccountsGroup();
    const allButton = document.createElement('button');
    allButton.className = 'group-item active';
    allButton.setAttribute('data-group', 'all');
    
    // Get count for All group
    const allAccountsCount = this.accountGroups['all'] ? this.accountGroups['all'].length : 0;
    
    allButton.innerHTML = `
      <span class="group-label">All</span>
      <span class="group-count">${allAccountsCount}</span>
    `;
    
    // Add click handler for All button
    allButton.addEventListener('click', (e) => {
      // Remove active class from all buttons
      groupsContainer.querySelectorAll('.group-item').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to clicked button
      allButton.classList.add('active');
      
      // Render accounts for All group
      this.renderAccounts('all');
    });
    
    groupsContainer.appendChild(allButton);
    
    // Set current group to 'all' by default
    this.currentGroup = 'all';
    
    // Create buttons for each custom account group
    customGroupKeys.forEach((groupKey) => {
      const button = document.createElement('button');
      button.className = 'group-item';
      button.setAttribute('data-group', groupKey);
      
      // Capitalize group name for display
      const displayName = groupKey.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      // Get count for this group
      const groupAccountsCount = this.accountGroups[groupKey] ? this.accountGroups[groupKey].length : 0;
      
      button.innerHTML = `
        <span class="group-label">${displayName}</span>
        <span class="group-count">${groupAccountsCount}</span>
      `;
      
      // Add click handler
      button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        groupsContainer.querySelectorAll('.group-item').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Reset custom mode and render accounts for selected group
        this.currentGroup = groupKey;
        this.isCustomMode = false;
        this.renderAccounts(groupKey);
      });
      
      groupsContainer.appendChild(button);
    });
    
    console.log('🔄 Rebuilt group buttons with All + custom groups:', ['all', ...customGroupKeys]);
  }
  
  createAllAccountsGroup() {
    // Create an "all" group containing all available accounts from OrgDataManager
    if (window.OrgDataManager) {
      const currentOrg = window.OrgDataManager.getCurrentOrganization();
      if (currentOrg && currentOrg.accounts) {
        const allAccounts = currentOrg.accounts
          .filter(acc => !acc.isAggregate)
          .map((acc, index) => ({
            name: acc.name,
            initials: this.generateInitials(acc.name),
            color: this.convertHexToColorClass(acc.color) || (index % 2 === 0 ? 'blue' : 'green'),
            backgroundColor: acc.color,
            checked: true,
            id: acc.id,
            type: acc.type || 'Account'
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        this.accountGroups['all'] = allAccounts;
      }
    }
  }
  
  generateInitials(name) {
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');
  }
  
  convertHexToColorClass(hexColor) {
    if (!hexColor) return null;
    
    const colorMap = {
      '#3B82F6': 'blue',
      '#10B981': 'green', 
      '#F59E0B': 'orange',
      '#EF4444': 'red',
      '#8B5CF6': 'purple',
      '#06B6D4': 'cyan',
      '#84CC16': 'lime',
      '#F97316': 'amber'
    };
    
    return colorMap[hexColor.toUpperCase()] || null;
  }
  
  checkAccountsListOverflow() {
    // Check if the accounts list overflows and show/hide shadow accordingly
    const accountsList = document.getElementById(this.options.accountsListId);
    const accountsSection = accountsList?.closest('.accounts-section');
    
    if (!accountsList || !accountsSection) {
      return;
    }
    
    // Use setTimeout to ensure DOM has updated after rendering
    setTimeout(() => {
      const hasOverflow = accountsList.scrollHeight > accountsList.clientHeight;
      
      if (hasOverflow) {
        accountsSection.classList.add('has-overflow');
      } else {
        accountsSection.classList.remove('has-overflow');
      }
    }, 10);
  }
} 