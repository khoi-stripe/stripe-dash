# 🎨 Wireframe System

A progressive fidelity wireframing system that extends your existing prototype framework. Create wireframes that can evolve from low-fidelity sketches to high-fidelity prototypes using the same codebase.

## 🚀 Quick Start

### 1. View the Demo
Open `index.html` to see the complete wireframe system in action:
- **Low Fidelity**: Gray boxes and dashed borders
- **Mid Fidelity**: Basic styling with your design system
- **High Fidelity**: Full component integration

### 2. Use in Your Prototypes
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="../../shared/styles/variables.css">
  <link rel="stylesheet" href="../../shared/styles/base.css">
  <link rel="stylesheet" href="../../shared/styles/components.css">
</head>
<body class="wireframe-low">
  <div id="app"></div>
  
  <script type="module">
    import { WireframeElements, FidelityController } from '../../shared/components/wireframe-elements.js';
    
    // Initialize fidelity controls
    FidelityController.init();
    
    // Create wireframe elements
    document.getElementById('app').innerHTML = WireframeElements.layout({
      header: WireframeElements.header('My App'),
      sidebar: WireframeElements.sidebar(['Home', 'Profile', 'Settings']),
      main: WireframeElements.card('Main content area')
    });
  </script>
</body>
</html>
```

## 🎯 Components Available

### Layout Components
- `WireframeElements.layout()` - Complete page layout
- `WireframeElements.header()` - Page header with navigation
- `WireframeElements.sidebar()` - Navigation sidebar

### Content Components
- `WireframeElements.box()` - Generic content box
- `WireframeElements.card()` - Content card
- `WireframeElements.text()` - Text placeholder blocks

### Form Components
- `WireframeElements.form()` - Complete form with fields
- `WireframeElements.input()` - Input fields
- `WireframeElements.button()` - Action buttons

### Data Components
- `WireframeElements.table()` - Data tables

## 🎛️ Fidelity Controls

### Manual Control
```javascript
// Set fidelity programmatically
FidelityController.setFidelity('low');   // Gray boxes
FidelityController.setFidelity('mid');   // Basic styling
FidelityController.setFidelity('high');  // Full design system
```

### Keyboard Shortcuts
- **Alt+1**: Low fidelity
- **Alt+2**: Mid fidelity  
- **Alt+3**: High fidelity

### Auto Controls
```javascript
// Add fidelity switcher to page
FidelityController.init({ 
  defaultFidelity: 'low',
  showControls: true 
});
```

## 🎨 Fidelity Levels

### Low Fidelity (`wireframe-low`)
- Gray boxes with dashed borders
- Placeholder text lines
- No styling or colors
- Focus on layout and structure

### Mid Fidelity (`wireframe-mid`)
- Basic colors from design system
- Simple styling and borders
- Button states and interactions
- Typography hierarchy

### High Fidelity (`wireframe-high`)
- Full design system integration
- Real components from shared library
- Complete interactions
- Production-ready styling

## 🔧 Customization

### Adding Custom Elements
```javascript
// Extend WireframeElements
WireframeElements.myComponent = function(options = {}) {
  return `<div class="my-custom-wireframe">${options.content}</div>`;
};
```

### Fidelity-Specific Styling
```css
/* Low fidelity */
.wireframe-low .my-component {
  border: 2px dashed #ccc;
  background: #f5f5f5;
}

/* Mid fidelity */
.wireframe-mid .my-component {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

/* High fidelity */
.wireframe-high .my-component {
  /* Use your existing component styles */
}
```

## 🔗 Integration with Existing System

### Using Existing Components
In high-fidelity mode, replace wireframe elements with your existing components:

```javascript
document.addEventListener('fidelityChanged', (e) => {
  if (e.detail.level === 'high') {
    // Replace wireframe button with real button
    const wireframeBtn = document.querySelector('.wireframe-btn');
    wireframeBtn.className = 'btn btn-primary';
  }
});
```

### Progressive Enhancement Workflow
1. **Start Low-Fi**: Create layout with basic boxes
2. **Add Mid-Fi**: Apply basic styling and interactions  
3. **Enhance to High-Fi**: Replace with real components
4. **Extract to Shared**: Move successful patterns to shared components

## 📁 File Structure

```
prototypes/wireframe-templates/
├── index.html              # Complete demo
├── dashboard-wireframe.html # Dashboard example
└── README.md               # This file

shared/
├── styles/wireframe.css    # Wireframe-specific styles
└── components/wireframe-elements.js # Component library
```

## 🎪 Examples

### Dashboard Example
See `dashboard-wireframe.html` for a complete dashboard wireframe that demonstrates:
- Statistics cards
- Data visualization placeholders
- Interactive tables
- Multi-column layouts
- Progressive fidelity enhancement

### Form Example
```javascript
const contactForm = WireframeElements.form([
  { label: 'Name', type: 'text', placeholder: 'Your name' },
  { label: 'Email', type: 'email', placeholder: 'you@example.com' },
  { label: 'Message', type: 'textarea', placeholder: 'Your message' }
]);
```

### Complex Layout Example
```javascript
const app = WireframeElements.layout({
  header: WireframeElements.header('My App', { showNav: true }),
  sidebar: WireframeElements.sidebar(['Dashboard', 'Projects', 'Team']),
  main: `
    <div class="grid-2 gap-lg">
      ${WireframeElements.card('Recent Projects')}
      ${WireframeElements.card('Team Activity')}
    </div>
    ${WireframeElements.table(['Project', 'Status', 'Due Date'], 5)}
  `
});
```

## 🤝 Team Workflow

### 1. Wireframe Phase
- Create low-fi wireframes to explore concepts
- Share with team for early feedback
- Iterate on layout and flow

### 2. Design Phase  
- Switch to mid-fi for basic styling
- Add real content and interactions
- Test with users for usability feedback

### 3. Development Phase
- Enhance to high-fi with real components
- Integrate with existing shared components
- Extract new patterns back to shared library

### 4. Git Workflow
```bash
# Create wireframe branch
git checkout -b feature/new-dashboard-wireframe

# Work on wireframe files
# prototypes/my-new-feature/wireframe.html

# Progressively enhance
# prototypes/my-new-feature/prototype.html

# Merge when ready
git checkout main
git merge feature/new-dashboard-wireframe
```

## 🔍 Tips & Best Practices

### Wireframing Tips
- Start with the simplest layout possible
- Focus on user flow before visual design
- Use real content when possible (even in low-fi)
- Test early and often

### Technical Tips
- Always include fidelity controls for team review
- Use semantic HTML even in wireframes
- Comment your wireframe sections clearly
- Consider accessibility from the wireframe stage

### Collaboration Tips
- Use consistent labeling across team members
- Document assumptions and open questions
- Include interaction notes in wireframes
- Version wireframes with git for history

## 🎮 Demo Controls

When viewing the examples:
- **Alt+C**: Auto-cycle through fidelity levels
- **Click buttons**: See interaction logging
- **Resize window**: Test responsive behavior

---

**Ready to start wireframing?** Open `index.html` to explore the system, then create your first wireframe using the templates!