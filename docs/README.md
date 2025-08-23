# Prototype Dashboard System

A flexible, organized system for creating, managing, and iterating on UI prototypes with shared components and styles.

## 🏗️ Architecture Overview

```
/
├── shared/                 # Shared components and styles
│   ├── components/         # Reusable UI components
│   ├── styles/            # Global CSS, themes, variables
│   ├── utils/             # Shared utilities/helpers
│   └── types/             # TypeScript types (if using TS)
├── dashboard/             # Main dashboard application
├── prototypes/            # Individual experiments
│   ├── prototype-1/       # Example: ecommerce-checkout
│   ├── prototype-2/       # Example: dashboard-analytics
│   └── ...
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Creating a New Prototype

1. **Create a new folder** in `/prototypes/`:
   ```bash
   mkdir prototypes/my-new-prototype
   cd prototypes/my-new-prototype
   ```

2. **Copy the base template** or start from an existing prototype:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>My New Prototype</title>
     
     <!-- Import shared styles -->
     <link rel="stylesheet" href="../../shared/styles/variables.css">
     <link rel="stylesheet" href="../../shared/styles/base.css">
     <link rel="stylesheet" href="../../shared/styles/components.css">
   </head>
   <body>
     <!-- Your prototype content -->
   </body>
   </html>
   ```

3. **Import shared components** as needed:
   ```javascript
   import { createHeader } from '../../shared/components/header.js';
   import { createDashboardGrid } from '../../shared/components/dashboard-grid.js';
   import { formatDate, storage } from '../../shared/utils/helpers.js';
   ```

### Using the Shared Component System

#### CSS Variables
All prototypes have access to a comprehensive set of CSS custom properties:

```css
/* Colors */
var(--color-primary)
var(--color-background)
var(--color-text)

/* Spacing */
var(--space-sm)
var(--space-md)
var(--space-lg)

/* Typography */
var(--font-size-base)
var(--font-family)

/* And many more... */
```

#### Component Classes
Ready-to-use component classes:

```html
<!-- Buttons -->
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>

<!-- Cards -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-description">Card description</p>
  </div>
  <!-- card content -->
</div>

<!-- Forms -->
<div class="form-group">
  <label class="form-label">Label</label>
  <input class="form-input" type="text" placeholder="Placeholder">
</div>

<!-- Layout utilities -->
<div class="flex items-center justify-between gap-md">
  <div class="grid-3 gap-lg">
    <!-- content -->
  </div>
</div>
```

#### JavaScript Components

```javascript
// Header with navigation
const header = createHeader({
  title: 'My Prototype',
  navigation: [
    { label: 'Home', href: '/', active: true },
    { label: 'About', href: '/about' }
  ],
  showThemeToggle: true
});

// Dashboard grid
const grid = createDashboardGrid([
  {
    title: 'Card Title',
    content: 'Card content',
    href: '/link',
    actions: [
      { label: 'Edit', onClick: 'editItem()' }
    ]
  }
]);
```

## 🎨 Shared Components

### Header Component (`shared/components/header.js`)

Creates a consistent header with navigation and theme toggle.

**Usage:**
```javascript
const header = createHeader({
  title: 'Page Title',
  navigation: [
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'Prototypes', href: '/prototypes' }
  ],
  showThemeToggle: true
});
```

### Dashboard Grid (`shared/components/dashboard-grid.js`)

Responsive grid for displaying cards or dashboard items.

**Usage:**
```javascript
const items = [
  {
    title: 'Item Title',
    subtitle: 'Subtitle',
    content: 'Description text',
    badge: 'Status',
    href: '/link',
    meta: 'Last updated 2 days ago',
    actions: [
      { label: 'View', variant: 'btn-primary', onClick: 'viewItem()' },
      { label: 'Edit', onClick: 'editItem()' }
    ]
  }
];

const grid = createDashboardGrid(items, {
  columns: 'auto', // or 2, 3, 4
  gap: 'md'
});
```

### Utility Functions (`shared/utils/helpers.js`)

Common utilities for DOM manipulation, data processing, and more:

```javascript
// DOM utilities
const element = $('selector');
const elements = $$('selector');

// Data utilities
const grouped = groupBy(array, 'property');
const sorted = sortBy(array, 'date', 'desc');

// String utilities
const slug = slugify('My Title'); // 'my-title'
const truncated = truncate(text, 50);

// Date utilities
const formatted = formatDate(new Date());
const relative = formatRelativeTime(date); // '2 hours ago'

// Storage utilities
storage('key', value); // Set
const value = storage('key'); // Get
storage('key', null); // Remove
```

## 🎯 Workflow Patterns

### Experiment-Driven Development

1. **Start with a question**: "What if we tried a different checkout flow?"
2. **Create a focused prototype**: Fork existing code or start fresh
3. **Implement variations**: Use experiment toggles for A/B testing
4. **Measure and iterate**: Add analytics, gather feedback
5. **Extract lessons**: Move successful patterns back to shared components

### Component Evolution

1. **Prototype-specific components**: Start with inline styles and scripts
2. **Extract patterns**: When you use something in 2+ prototypes, consider extracting
3. **Add to shared**: Move reusable parts to `/shared/components/`
4. **Update dependents**: Refactor prototypes to use shared version
5. **Document and version**: Update docs and consider versioning for breaking changes

### Git Workflow Options

#### Option A: Folder-based (Recommended for small experiments)
- Create new folders in `/prototypes/`
- Work in main branch
- Cherry-pick useful changes back to `/shared/`

#### Option B: Branch-based (For major experiments)
- Create feature branches for significant changes
- Work across multiple directories
- Merge back to main when ready

## 📋 Best Practices

### File Organization
```
prototypes/my-prototype/
├── index.html          # Main entry point
├── style.css          # Prototype-specific styles
├── script.js          # Prototype-specific logic
├── assets/            # Images, icons, etc.
└── README.md          # Experiment documentation
```

### CSS Architecture
- Always import shared styles first
- Use CSS custom properties for consistency
- Add prototype-specific styles in separate files
- Prefer composition over overriding shared styles

### JavaScript Patterns
- Import shared utilities and components
- Keep prototype logic separate from shared code
- Use consistent naming conventions
- Add experiment toggles for A/B testing

### Documentation
- Document your experiments in prototype README files
- Include screenshots or GIFs of key interactions
- Note what worked, what didn't, and lessons learned
- Link to related prototypes or iterations

## 🔧 Advanced Features

### Dark Mode Support
All components automatically support dark mode via CSS custom properties:

```css
/* Automatically switches based on system preference */
@media (prefers-color-scheme: dark) { ... }

/* Or manually toggle with class */
<body class="dark">
```

### Responsive Design
Shared components include mobile-first responsive breakpoints:

```css
@media (max-width: 768px) {
  .grid-3 { grid-template-columns: 1fr; }
}
```

### Experiment Controls
Add experiment toggles to your prototypes:

```html
<div class="experiment-controls">
  <h4>🧪 Experiments</h4>
  <div class="experiment-toggle">
    <input type="checkbox" id="feature-flag">
    <label for="feature-flag">Enable new feature</label>
  </div>
</div>
```

### Local Storage Integration
Persist user preferences and experiment states:

```javascript
// Save experiment state
storage('experiment-state', { featureA: true, featureB: false });

// Restore on page load
const state = storage('experiment-state') || {};
```

## 🎨 Customization

### Adding New CSS Variables
Add to `shared/styles/variables.css`:

```css
:root {
  --my-custom-color: #ff6b6b;
  --my-custom-size: 2.5rem;
}
```

### Creating New Components
Follow this pattern in `shared/components/`:

```javascript
// my-component.js
export function createMyComponent(options = {}) {
  const element = document.createElement('div');
  element.className = 'my-component';
  
  // Add styles
  if (!document.querySelector('#my-component-styles')) {
    const style = document.createElement('style');
    style.id = 'my-component-styles';
    style.textContent = `/* component styles */`;
    document.head.appendChild(style);
  }
  
  // Component logic
  return element;
}
```

### Adding Utility Functions
Add to `shared/utils/helpers.js`:

```javascript
export function myUtility(input) {
  // utility logic
  return result;
}
```

## 🚦 Troubleshooting

### Common Issues

**Styles not loading:**
- Check that CSS imports use correct relative paths
- Ensure `variables.css` is imported first

**Components not working:**
- Verify JavaScript imports are correct
- Check browser console for errors
- Ensure DOM is ready before initializing components

**Dark mode not working:**
- Check that CSS custom properties are properly defined
- Verify dark mode class is being applied to `<body>`

### Performance Tips

- Only import components you actually use
- Use CSS containment for isolated components
- Debounce expensive operations (scroll, resize)
- Consider lazy loading for large prototypes

## 🎨 Wireframe System (NEW!)

The system now includes comprehensive wireframing capabilities for progressive fidelity prototyping:

### Quick Start with Wireframes
```html
<script type="module">
  import { WireframeElements, FidelityController } from '../../shared/components/wireframe-elements.js';
  
  // Initialize fidelity controls
  FidelityController.init();
  
  // Create wireframe layout
  document.body.innerHTML = WireframeElements.layout({
    header: WireframeElements.header('My App'),
    sidebar: WireframeElements.sidebar(['Home', 'Settings']),
    main: WireframeElements.card('Main content')
  });
</script>
```

### Fidelity Levels
- **Low-Fi** (`Alt+1`): Gray boxes, dashed borders, focus on structure
- **Mid-Fi** (`Alt+2`): Basic styling with design system colors
- **High-Fi** (`Alt+3`): Full component integration

### Wireframe Components
- `WireframeElements.layout()` - Complete page layouts
- `WireframeElements.header()` - Page headers with navigation
- `WireframeElements.form()` - Forms with fields and validation
- `WireframeElements.table()` - Data tables with sorting
- `WireframeElements.card()` - Content cards and containers

**📖 Complete Documentation:** See `/prototypes/wireframe-templates/README.md`

## 📚 Examples

See the included prototypes for real-world examples:

- **🎨 Wireframe Templates** (`prototypes/wireframe-templates/`): Progressive fidelity wireframing system
- **E-commerce Checkout** (`prototypes/ecommerce-checkout/`): Payment flow with experiment toggles  
- **Dashboard Analytics** (coming soon): Data visualization experiments
- **Mobile Navigation** (coming soon): Touch interaction patterns

## 🤝 Contributing

When you create something useful:

1. **Extract reusable parts** to `/shared/`
2. **Update documentation** with new patterns
3. **Share learnings** with the team
4. **Consider creating templates** for common prototype types

---

Happy prototyping! 🚀 