#!/bin/bash

# Script to create standalone Stripe Dashboard UXR prototype
# This creates a clean, participant-ready version without other prototypes

STANDALONE_DIR="stripe-dashboard-uxr-standalone"

echo "🚀 Creating standalone Stripe Dashboard UXR prototype..."

# Create new directory
mkdir -p "$STANDALONE_DIR"

# Copy prototype files
echo "📁 Copying prototype files..."
cp -r prototypes/stripe-dashboard-uxr/* "$STANDALONE_DIR/"

# Copy shared resources and flatten the structure
echo "📁 Copying shared resources..."
mkdir -p "$STANDALONE_DIR/shared"
cp -r shared/* "$STANDALONE_DIR/shared/"

# Copy API functions
echo "📁 Copying API functions..."
cp -r api "$STANDALONE_DIR/"

# Copy configuration
echo "📁 Copying configuration..."
cp netlify.toml "$STANDALONE_DIR/"
cp package.json "$STANDALONE_DIR/" 2>/dev/null || true

# Update file paths (change ../../shared to ./shared)
echo "🔧 Updating file paths..."
find "$STANDALONE_DIR" -name "*.html" -exec sed -i '' 's|../../shared/|./shared/|g' {} \;
find "$STANDALONE_DIR" -name "*.js" -exec sed -i '' 's|../../shared/|./shared/|g' {} \;

# Create a simple README
cat > "$STANDALONE_DIR/README.md" << 'EOF'
# Stripe Dashboard UXR Prototype

This is a standalone version of the Stripe Dashboard prototype for UXR research.

## Features
- Account Groups management
- Financial Reports
- Organization Settings
- Data sharing via shareable URLs

## Deployment
Deploy to Netlify for best experience with sharing functionality.

## Usage
- Navigate between pages using the sidebar
- Upload CSV data via the prototype control panel
- Create shareable URLs for research participants
EOF

echo "✅ Standalone prototype created in: $STANDALONE_DIR"
echo ""
echo "📋 Next steps:"
echo "1. cd $STANDALONE_DIR"
echo "2. Create new GitHub repository"
echo "3. git init && git add . && git commit -m 'Initial standalone prototype'"
echo "4. Deploy to Netlify"
echo ""
echo "🎯 Benefits:"
echo "- Participants only see the Stripe prototype"
echo "- No access to project root or other prototypes"
echo "- Clean URLs like: your-site.netlify.app/account-groups.html"
echo "- Shareable URLs work within the single prototype"