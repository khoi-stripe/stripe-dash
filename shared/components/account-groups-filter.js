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
    this.alignmentMode = 'center'; // 'left', 'center', or 'right' - determines which edge to align to
    this.alignmentLocked = false; // Whether alignment mode has been determined
    
    this.init();
  }
  
  init() {
    // Generate account groups if function provided
    if (this.options.generateAccountGroups) {
      this.accountGroups = this.options.generateAccountGroups();
    } else {
      this.accountGroups = this.options.accountGroups;
    }
    
    this.attachEventListeners();
    this.currentGroup = 'all';
    this.renderAccounts('all');
    this.updateTriggerLabel('all');
    this.addScrollEffect();
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
    
    // Calculate center position
    const triggerCenterX = this.triggerDimensions.width / 2;
    const popoverCenterX = popoverWidth / 2;
    const centeredLeft = triggerCenterX - popoverCenterX;
    
    // Check viewport boundaries for centered position
    const triggerLeftInViewport = triggerRect.left;
    const centeredPopoverLeft = triggerLeftInViewport + centeredLeft;
    const centeredPopoverRight = centeredPopoverLeft + popoverWidth;
    
    // Determine alignment based on viewport constraints
    if (centeredPopoverRight > viewportWidth - margin) {
      // Would go off right edge - align right
      this.alignmentMode = 'right';
    } else if (centeredPopoverLeft < margin) {
      // Would go off left edge - align left
      this.alignmentMode = 'left';
    } else {
      // Fits centered
      this.alignmentMode = 'center';
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
        left = currentTriggerWidth - popoverWidth; // Right-align to current trigger width
        break;
      case 'center':
      default:
        const triggerCenterX = currentTriggerWidth / 2;
        const popoverCenterX = popoverWidth / 2;
        left = triggerCenterX - popoverCenterX; // Center on current trigger
        break;
    }
    
    // Calculate vertical position
    let top = currentTriggerHeight + 8; // 8px below current trigger
    
    // Check if popover would go off the bottom of viewport
    if (triggerRect.bottom + popoverHeight + 8 > viewportHeight - margin) {
      // Position above trigger instead
      top = -popoverHeight - 8;
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
      this.alignmentMode = 'center';
      this.alignmentLocked = false;
    } else {
      // Capture current selection state before opening
      this.captureCommittedSelection();
      popover.style.display = 'flex';
      trigger.classList.add('open');
      // Calculate fresh position when opening
      this.positionPopover(true);
    }
  }
  
  renderAccounts(groupKey) {
    const selectAllContainer = document.getElementById(this.options.selectAllContainerId);
    const accountsList = document.getElementById(this.options.accountsListId);
    const accounts = this.accountGroups[groupKey] || [];
    
    if (!selectAllContainer || !accountsList) {
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
      
      return `
        <div class="account-item">
          <div class="checkbox-container">
            <input type="checkbox" ${account.checked ? 'checked' : ''}>
          </div>
          <div class="account-filter-content">
            <div class="${iconClass}" ${iconStyle}>${account.initials}</div>
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
          this.renderAccounts(group);
          
          // Note: Don't update trigger label here - only update on apply
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
  }
  
  updateSelectionCount() {
    const checked = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]:checked`).length;
    const total = document.querySelectorAll(`#${this.options.accountsListId} .account-item`).length;
    const selectionCount = document.getElementById(`${this.options.namespace}selectionCount`);
    
    if (selectionCount) {
      selectionCount.textContent = `${checked} selected`;
    }
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
    
    // Note: Don't update trigger label here - only update on apply
  }
  
  // Handle select all checkbox changes
  handleSelectAllChange() {
    this.updateSelectionCount();
    
    // Note: Don't update trigger label here - only update on apply
  }
  
  // Update the trigger label text
  updateTriggerLabel(groupKey) {
    const triggerOption = document.getElementById(this.options.triggerOptionId);
    

    
    if (triggerOption) {
      const groupNames = {
        'all': 'All accounts',
        'connected': 'Connected accounts',
        'express': 'Express accounts',
        'standard': 'Standard accounts',
        'custom': 'Custom accounts',
        'Custom': 'Custom'
      };
      
      if (this.isCustomMode) {
        // Calculate selected accounts count
        const selectedCount = document.querySelectorAll(`#${this.options.accountsListId} .account-item input[type="checkbox"]:checked`).length;
        // Use innerHTML to allow styled count
        triggerOption.innerHTML = `Custom <span style="color: var(--neutral-500);">(${selectedCount})</span>`;
      } else {
        const labelText = groupNames[groupKey] || 'All accounts';
        triggerOption.textContent = labelText;
      }
      
      // Recalculate position based on new trigger size but keep same alignment mode
      const popover = document.getElementById(this.options.popoverId);
      if (popover && popover.style.display === 'flex') {
        this.positionPopover(false); // Don't force recalculation of alignment mode
      }
    }
  }
  
  // Public method to apply selection (can be overridden)
  applySelection() {
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
    
    const popover = document.getElementById(this.options.popoverId);
    const trigger = document.getElementById(this.options.triggerId);
    
    if (popover && trigger) {
      popover.style.display = 'none';
      trigger.classList.remove('open');
      
      // Clear stored position data when closing
      this.triggerDimensions = null;
      this.alignmentMode = 'center';
      this.alignmentLocked = false;
    }
  }
} 