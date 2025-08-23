# Prototype Data Sharing Feature

## Overview
The Stripe Dashboard UXR prototype now supports **shareable URLs** that allow you to share your configured prototype data (organizations, accounts, and groups) with others.

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
- Uses a key-value store approach for clean, short URLs
- Data is stored temporarily (30-day expiration)
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
- Supports Netlify Functions out of the box
- Can be adapted for Vercel, AWS Lambda, or other serverless platforms
- Requires minimal backend infrastructure

### Files Added
- `shared/utils/share.js` - Core sharing functionality
- `api/share.js` - Backend API (serverless function)
- `netlify.toml` - Deployment configuration

### Integration Points
- Prototype Control Panel: Share button in footer
- All prototype pages: Auto-load shared data from URL
- Notification system: Success/error messages for sharing

## Security & Privacy
- No authentication required
- Data expires automatically (30 days)
- URLs are not discoverable (random 8-character IDs)
- Only prototype configuration data is shared, no real user data