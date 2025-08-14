# Prototype Data Sharing Feature

## Overview
The Stripe Dashboard UXR prototype now supports **shareable URLs** powered by **GitHub Issues API** that allow you to share your configured prototype data (organizations, accounts, and groups) with others.

## How to Use

### 1. Configure Your Data
- Upload CSV files or generate test data using the prototype control panel
- Create account groups as needed
- Set up your organizations and accounts

### 2. Generate Shareable URL
- Click the **prototype settings** button (gear icon in bottom-right)
- In the modal footer, click **"Share prototype"** (left side)
- The system will generate a short, shareable URL
- The URL is automatically copied to your clipboard

### 3. Share with Others
- Send the generated URL to stakeholders, team members, or research participants
- Anyone who visits the URL will see your exact prototype configuration
- Recipients can interact with the prototype using your data

## Technical Details

### Data Storage
- Uses **GitHub Issues** as a distributed key-value store
- Data is stored as JSON in GitHub issue bodies
- Issues are automatically labeled with `prototype-share` and `auto-generated`
- Data persists indefinitely (or until issues are manually closed)
- No personal information is stored, only prototype configuration

### URL Format
```
https://your-prototype-url.com/prototypes/stripe-dashboard-uxr/?share=abc12345
```

### What Gets Shared
- Organization data (names, accounts)
- Account groups and their configurations
- Current organization/account selection
- All uploaded CSV data

### What Doesn't Get Shared
- Browser-specific settings
- Personal browsing history
- Any real financial data (prototype uses mock data only)

## Development Notes

### Local Development
- For local testing, uses an in-memory mock API
- No external dependencies required for development

### Production Deployment
- **GitHub Pages compatible** - no backend infrastructure required
- Uses GitHub's public API for reading/writing issues
- Works from any static hosting provider (GitHub Pages, Netlify, Vercel, etc.)
- Zero server costs - leverages GitHub's free issue storage

### Files Added
- `shared/utils/share.js` - Core sharing functionality with GitHub Issues API integration
- `package.json` - Project metadata for easy deployment

### Integration Points
- Prototype Control Panel: Share button in footer
- All prototype pages: Auto-load shared data from URL
- Notification system: Success/error messages for sharing

## Security & Privacy
- No authentication required for reading public GitHub issues
- Data persists as GitHub issues (can be manually deleted if needed)
- URLs are not discoverable (random 8-character IDs mapped to issue titles)
- Only prototype configuration data is shared, no real user data
- Issues are clearly labeled as auto-generated prototype shares
- Leverages GitHub's infrastructure security and reliability

## GitHub Integration Benefits
- **Transparency**: All shared data is visible as GitHub issues
- **Auditability**: Track when shares were created and by whom
- **Management**: Easily close/delete shares via GitHub UI
- **Reliability**: Leverages GitHub's 99.9% uptime
- **Free**: No cost for storage or API usage on public repos