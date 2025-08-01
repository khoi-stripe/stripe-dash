# Shared Components

This directory contains reusable UI components used across the dashboard prototypes.

## Components

### Navigation Components
- **`navigation.js`** - Main navigation panel with collapsible sections
- **`nav-item.js`** - Individual navigation items with active states  
- **`account-switcher.js`** - Dropdown account/organization selector

### Layout Components
- **`header.js`** - Top header bar component
- **`dashboard-grid.js`** - Grid layout for dashboard modules

### UI Components
- **`popover.js`** - Tooltip and popover functionality

### **Modal Component** 🆕
- **`modal.js`** - Reusable modal dialog component with extensive features
- **`modal.css`** - Global modal styles (included in base.css)
- **`modal-example.html`** - Comprehensive usage examples and documentation

## Modal Component Usage

The Modal component is a flexible, reusable dialog system with the following features:

### Basic Usage
```javascript
const modal = new Modal({
  title: 'Modal Title',
  content: '<p>Modal content goes here</p>',
  footerActions: [
    { text: 'Cancel', type: 'secondary', action: () => modal.hide() },
    { text: 'Save', type: 'primary', action: () => saveData() }
  ]
});
modal.show();
```

### Key Features
- **🎨 Consistent Styling** - Matches dashboard design system
- **📱 Responsive Design** - Works on all screen sizes
- **⌨️ Keyboard Support** - ESC to close, focus management
- **🔧 Flexible Configuration** - Customizable headers, footers, sizing
- **📝 Form Utilities** - Built-in form element helpers
- **📂 Collapsible Modules** - Organize complex content
- **🎯 Event Callbacks** - onShow/onHide lifecycle hooks
- **♻️ Reusable** - Single instance can be updated dynamically

### Button Types
- `primary` - Brand-colored call-to-action
- `secondary` - Neutral bordered button  
- `destructive` - Red warning/delete actions
- `text` - Text-only link style

### Utility Methods
```javascript
// Form elements
Modal.createFormGroup(label, inputHTML)
Modal.createInput({ type, id, placeholder, value })
Modal.createSelect({ id, items, selectedValue })

// Collapsible sections
Modal.createCollapsibleModule(id, title, content, collapsed)
Modal.toggleModule(moduleId)
```

### Example Files
- **`modal-example.html`** - Live examples of all modal features
- Run locally to see interactive demonstrations

## File Structure
```
shared/
├── components/
│   ├── modal.js              # Modal JavaScript component
│   ├── modal-example.html    # Usage examples & docs
│   ├── navigation.js         # Navigation panel
│   ├── account-switcher.js   # Account selector
│   └── ...
├── styles/
│   ├── modal.css            # Modal styles (auto-included)
│   ├── base.css             # Imports modal.css
│   └── ...
```

## Integration

The modal styles are automatically included via `base.css`. To use:

1. **Include the JavaScript:**
```html
   <script src="shared/components/modal.js"></script>
```

2. **Create and show a modal:**
   ```javascript
   const modal = new Modal({ /* options */ });
   modal.show();
   ```

The modal component is designed to replace custom modal implementations (like the prototype control panel) with a consistent, feature-rich solution.

## Future Components

Consider adding these components as the prototype system grows:
- Data tables with sorting/filtering
- Toast notifications
- Date/time pickers
- File upload components
- Progress indicators 