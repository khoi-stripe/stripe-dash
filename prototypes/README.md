# Prototypes Directory

This directory contains individual prototype experiments. Each prototype is a self-contained folder that can import shared components and styles.

## Current Prototypes

### E-commerce Checkout (`ecommerce-checkout/`)
**Status**: Active  
**Purpose**: Testing different checkout flow optimizations  
**Features**:
- Multi-step checkout process
- Payment method selection
- Form validation
- A/B testing toggles
- Mobile responsive design

**Experiments**:
- ✅ One-page vs multi-step checkout
- ✅ Guest checkout flow  
- 🔄 Express payment integration
- 📋 Address autocomplete

**Key Learnings**:
- One-page checkout reduced abandonment by 15%
- Guest checkout is preferred by 70% of users
- Apple Pay integration increased conversion

---

## Creating New Prototypes

### Quick Start Template

1. **Create folder**: `mkdir prototypes/my-prototype`
2. **Copy this template**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Prototype</title>
  
  <!-- Import shared styles -->
  <link rel="stylesheet" href="../../shared/styles/variables.css">
  <link rel="stylesheet" href="../../shared/styles/base.css">
  <link rel="stylesheet" href="../../shared/styles/components.css">
  
  <style>
    /* Prototype-specific styles */
  </style>
</head>
<body>
  <!-- Header -->
  <div data-header data-config='{"title": "My Prototype", "navigation": [{"label": "Dashboard", "href": "../../dashboard"}]}'></div>

  <main class="container">
    <h1>My Prototype</h1>
    <!-- Your content here -->
  </main>

  <!-- Import shared components -->
  <script type="module" src="../../shared/components/header.js"></script>
  <script type="module" src="../../shared/utils/helpers.js"></script>
  
  <script>
    // Your prototype logic here
  </script>
</body>
</html>
```

3. **Add README.md**:

```markdown
# My Prototype

Brief description of what this prototype tests.

## Hypothesis
What you're trying to prove or disprove.

## Experiments
- [ ] Experiment 1
- [ ] Experiment 2

## Results
Document your findings here.

## Next Steps
What to do based on the results.
```

### Prototype Structure

```
prototypes/my-prototype/
├── index.html          # Main entry point
├── README.md           # Experiment documentation
├── style.css           # Prototype-specific styles (optional)
├── script.js           # Prototype-specific logic (optional)
└── assets/             # Images, data files, etc.
    ├── images/
    └── data/
```

## Best Practices

### File Organization
- Keep each prototype self-contained
- Use descriptive folder names (kebab-case)
- Include a README for each prototype
- Document your experiments and findings

### CSS Guidelines
- Always import shared styles first
- Add prototype-specific styles in `<style>` tags or separate CSS file
- Use CSS custom properties for consistency
- Avoid overriding shared component styles

### JavaScript Patterns
- Import shared utilities and components
- Keep prototype-specific logic separate
- Use modern ES6+ syntax
- Add experiment controls for A/B testing

### Experiment Design
- Start with a clear hypothesis
- Create measurable variations
- Use experiment toggles for easy switching
- Document results and learnings

## Common Patterns

### Experiment Controls
Add toggles to test different variations:

```html
<div class="experiment-controls">
  <h4>🧪 Experiments</h4>
  <div class="experiment-toggle">
    <input type="checkbox" id="feature-flag">
    <label for="feature-flag">Enable new feature</label>
  </div>
</div>

<style>
.experiment-controls {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-lg);
}
</style>
```

### Using Shared Components
```javascript
import { createDashboardGrid } from '../../shared/components/dashboard-grid.js';
import { formatDate, storage } from '../../shared/utils/helpers.js';

// Create components
const grid = createDashboardGrid(items);
document.getElementById('container').appendChild(grid);

// Use utilities
const saved = storage('prototype-state');
const formatted = formatDate(new Date());
```

### Form Handling
```html
<form class="prototype-form">
  <div class="form-group">
    <label class="form-label">Name</label>
    <input class="form-input" type="text" required>
  </div>
  <button class="btn btn-primary" type="submit">Submit</button>
</form>
```

### Responsive Design
```css
/* Mobile-first approach */
.prototype-layout {
  display: grid;
  gap: var(--space-md);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .prototype-layout {
    grid-template-columns: 2fr 1fr;
  }
}
```

## Prototype Lifecycle

1. **Ideation**: What problem are you solving?
2. **Planning**: Define experiments and success metrics
3. **Building**: Create prototype using shared components
4. **Testing**: Gather data and user feedback
5. **Analysis**: Document findings and learnings
6. **Evolution**: Extract useful patterns to shared components
7. **Archive**: Move completed prototypes to archive folder

## Git Workflow

### Option A: Folder-based (Recommended)
- Create prototype folders on main branch
- Commit iterations as you go
- Cherry-pick useful changes to shared components

### Option B: Branch-based
- Create feature branch for major prototypes
- Work across multiple files/directories
- Merge back when complete

## Experiment Documentation

For each prototype, document:

### Hypothesis
- What you're testing
- Expected outcome
- Success metrics

### Implementation
- Technical approach
- Components used
- Variations tested

### Results
- Data collected
- User feedback
- Performance metrics

### Learnings
- What worked
- What didn't work
- Unexpected discoveries

### Next Steps
- Recommended actions
- Further experiments needed
- Production considerations

## Prototype Ideas

Common prototype categories:

### User Experience
- Navigation patterns
- Form flows
- Onboarding sequences
- Error states

### Visual Design
- Color schemes
- Typography scales
- Component variants
- Animation styles

### Interaction Design
- Gesture controls
- Micro-interactions
- Feedback systems
- Loading states

### Performance
- Rendering optimizations
- Data loading strategies
- Progressive enhancement
- Accessibility improvements

## Archive Process

When a prototype is complete:

1. **Document final results** in README
2. **Extract reusable components** to shared
3. **Create archive folder**: `archive/prototype-name/`
4. **Move files** to archive with date
5. **Update main prototype list**

This keeps the prototypes directory focused on active experiments while preserving historical work. 