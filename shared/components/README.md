# Shared Component Library

This directory contains reusable components that can be used across all prototypes.

## Available Components

### Navigation Component (`navigation.js`) - **NEW**

**Purpose**: Reusable navigation sidebar with sections, dividers, badges, and icons

**Usage**:
```javascript
import { createNavigation, injectNavigationStyles } from '../../shared/components/navigation.js';

injectNavigationStyles();
const nav = createNavigation({
  title: 'My App',
  items: [
    { label: 'Dashboard', href: '#dashboard', icon: '<svg>...</svg>', active: true },
    { type: 'divider' },
    { type: 'section', label: 'Settings' },
    { label: 'Preferences', href: '#prefs', icon: '<svg>...</svg>' }
  ]
});
document.getElementById('nav-container').appendChild(nav);
```

**Features**: Icons, badges, sections, dividers, hover states, responsive design
**See**: `navigation-README.md` for full documentation

### Account Switcher Component (`account-switcher.js`) - **NEW**

**Purpose**: Account/organization switching dropdown component with account management actions

**Usage**:
```javascript
// Include the component
<script src="/shared/components/account-switcher.js"></script>

// Initialize with 1-line variant
const container = document.getElementById('account-switcher-container');
const accountSwitcher = new AccountSwitcher(container, {
  variant: '1-line', // or '2-line' (default)
  currentAccount: { id: 1, name: 'Acme, Inc.', type: 'organization' },
  accounts: [
    { id: 1, name: 'Acme, Inc.', type: 'organization' },
    { id: 2, name: 'Beta Corp', type: 'organization' },
    { id: 3, name: 'Personal', type: 'personal' }
  ],
  onAccountChange: (account) => {
    console.log('Account changed to:', account);
  }
});
```

**Options**:
- `currentAccount`: The currently selected account object (required)
- `accounts`: Array of available accounts (required)  
- `variant`: Display variant - `'1-line'` or `'2-line'` (optional, defaults to `'2-line'`)
- `onAccountChange`: Callback function when account is changed (optional)

**Variants**:
- **1-Line**: Single line with account name only (label/medium emphasized neutral-800)
- **2-Line**: Two lines with name and type (name: label/small emphasized neutral-800, type: label/small neutral-600)

**Features**: 
- Account switching with visual feedback
- Auto-generated avatar initials with random colors
- Account list with account types
- Account management actions (Settings, Billing)
- Dropdown with smooth animations
- Keyboard navigation support
- Auto-close on outside click
- Customizable accounts and callbacks

---

### Header Component (`header.js`)

**Purpose**: Creates a consistent navigation header with theme toggle

**Usage**:
```javascript
import { createHeader } from '../../shared/components/header.js';

const header = createHeader({
  title: 'My Prototype',
  navigation: [
    { label: 'Home', href: '/', active: true },
    { label: 'About', href: '/about' }
  ],
  showThemeToggle: true
});

document.body.appendChild(header);
```

**Options**:
- `title` (string): Page title displayed in header
- `navigation` (array): Navigation items with `label`, `href`, and optional `active`
- `showThemeToggle` (boolean): Whether to show dark/light mode toggle

**Auto-initialization**: If you add `<div data-header data-config='...'></div>` to your HTML, the header will auto-initialize.

---

### Dashboard Grid (`dashboard-grid.js`)

**Purpose**: Responsive grid layout for cards and dashboard items

**Usage**:
```javascript
import { createDashboardGrid } from '../../shared/components/dashboard-grid.js';

const items = [
  {
    title: 'Card Title',
    subtitle: 'Optional subtitle',
    content: 'Card description',
    badge: 'Status',
    href: '/link',
    meta: 'Additional info',
    actions: [
      { label: 'View', variant: 'btn-primary', onClick: 'viewItem()' },
      { label: 'Edit', onClick: 'editItem()' }
    ]
  }
];

const grid = createDashboardGrid(items, {
  columns: 'auto', // or 1, 2, 3, 4
  gap: 'md'        // xs, sm, md, lg
});

document.getElementById('container').appendChild(grid);
```

**Grid Options**:
- `columns`: 'auto' (responsive) or number (1-4)
- `gap`: Spacing between items ('xs', 'sm', 'md', 'lg')
- `className`: Additional CSS classes

**Card Properties**:
- `title`: Card heading (required)
- `subtitle`: Secondary heading
- `content`: Card body text
- `badge`: Status indicator
- `href`: Makes card clickable
- `onClick`: Custom click handler
- `meta`: Small text (timestamps, etc.)
- `actions`: Array of buttons

---

## CSS Components

These are available through `shared/styles/components.css`:

### Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-ghost">Ghost</button>

<!-- Sizes -->
<button class="btn btn-sm">Small</button>
<button class="btn btn-lg">Large</button>
```

### Cards
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
    <p class="card-description">Description</p>
  </div>
  <div class="card-content">
    <!-- Content -->
  </div>
</div>
```

### Forms
```html
<div class="form-group">
  <label class="form-label">Label</label>
  <input class="form-input" type="text" placeholder="Placeholder">
</div>
```

### Badges
```html
<span class="badge">Default</span>
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
```

### Layout Utilities
```html
<!-- Flexbox -->
<div class="flex items-center justify-between gap-md">
  <div>Left</div>
  <div>Right</div>
</div>

<!-- Grid -->
<div class="grid-3 gap-lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Container -->
<div class="container">
  <!-- Max-width content -->
</div>
```

### Navigation
```html
<nav class="nav">
  <a href="/" class="nav-link active">Home</a>
  <a href="/about" class="nav-link">About</a>
</nav>
```

## Creating New Components

Follow this pattern when creating new components:

1. **Create the JavaScript file**:
```javascript
// my-component.js
export function createMyComponent(options = {}) {
  const { /* destructure options */ } = options;
  
  const element = document.createElement('div');
  element.className = 'my-component';
  
  // Add component-specific styles if needed
  if (!document.querySelector('#my-component-styles')) {
    const style = document.createElement('style');
    style.id = 'my-component-styles';
    style.textContent = `/* styles */`;
    document.head.appendChild(style);
  }
  
  // Component logic here
  
  return element;
}
```

2. **Add CSS classes** to `shared/styles/components.css` if needed

3. **Document** your component in this README

4. **Test** in multiple prototypes before finalizing

## Best Practices

1. **Keep components focused**: Each component should do one thing well
2. **Use CSS custom properties**: Leverage the design token system
3. **Make it configurable**: Accept options objects for flexibility
4. **Handle edge cases**: Provide sensible defaults
5. **Test responsiveness**: Ensure components work on all screen sizes
6. **Document thoroughly**: Include usage examples and options

## Styling Guidelines

- Use CSS custom properties from `variables.css`
- Follow BEM-like naming: `.component-name`, `.component-name__element`
- Prefer composition over inheritance
- Use responsive design patterns
- Support dark mode automatically through CSS variables

## Component Lifecycle

1. **Prototype-specific** → Start with inline styles/scripts
2. **Extract pattern** → When used in 2+ prototypes
3. **Add to shared** → Move to this directory
4. **Update dependents** → Refactor prototypes to use shared version
5. **Document** → Add to this README and main docs 