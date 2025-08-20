# E-ink Admin System

A web-based administration interface for managing E-ink displays in a hospital environment.

## Features

- **Multi-language Support**: English and Chinese (Hong Kong) localization
- **Dashboard**: Real-time monitoring of E-ink displays with status indicators
- **Staff Management**: Add, edit, and delete staff members with bilingual names
- **Display Control**: Toggle displays between Active and Standby modes
- **Responsive Design**: Works on desktop and mobile devices

## Multi-Language Support

The application supports two languages:

- **English (EN)**: Default language
- **Chinese (Hong Kong) (中文)**: Traditional Chinese for Hong Kong users

### Language Switching

- Use the language switcher in the top-right corner of any page
- Language preference is saved in localStorage
- Automatically detects browser language preference on first visit

### Localized Content

All user interface elements are localized:
- Navigation menus
- Form labels and placeholders
- Table headers
- Status indicators
- Warning messages
- Modal dialogs

## Pages

### Login Page (`index.html`)
- User authentication
- Language switcher available

### Dashboard (`dashboard.html`)
- Real-time display status monitoring
- Signal strength indicators
- Battery level monitoring
- Online/offline status
- Staff assignment
- Active/Standby mode control

### Settings (`settings.html`)
- Staff directory management
- Add new staff members with bilingual names
- Edit existing staff information
- Delete staff members
- Category management (Doctor/Staff)

## Technical Details

### Files Structure
```
eink/
├── app.js          # Main application logic
├── i18n.js         # Internationalization module
├── styles.css      # Styling
├── index.html      # Login page
├── dashboard.html  # Dashboard page
├── settings.html   # Settings page
├── test.html       # Language test page
└── assets/         # Images and logos
```

### Internationalization System

The i18n system uses:
- `data-i18n` attributes for text content
- `data-i18n-placeholder` for input placeholders
- `I18N.getText(key)` for dynamic content
- Event-driven updates when language changes

### Browser Compatibility

- Modern browsers with ES6+ support
- LocalStorage for data persistence
- Responsive CSS Grid and Flexbox layout


## Version History

### v1.7 (Current)
- **Multi-language Support**: Added English and Chinese (Hong Kong) localization
- **Language Switching**: Dynamic language switcher with localStorage persistence
- **Internationalization**: Complete i18n system with data attributes
- **Localized Content**: All UI elements translated and localized

### v1.6
- **Form Validation Improvements**: Added warning messages when both name fields are empty
- **Enhanced User Experience**: Auto-hide warnings when user starts typing
- **Better Feedback**: Clear visual indicators for form validation errors
- **Modal Support**: Warning messages in both main form and edit modal

### v1.5
- **Flexible Name Fields**: Allow submission with either Chinese or English name filled
- **Improved Validation**: Require at least one name field instead of both
- **Better UX**: Removed required attributes, handled validation in JavaScript

### v1.4
- **Staff Categories System**: Added support for Doctor, Therapist, and Staff categories
- **Grouped Dropdown**: Dashboard dropdown shows staff organized by category
- **Web-based Edit Modal**: Replaced browser prompts with professional modal dialog
- **Version Management**: Automatic localStorage reset when app version changes
- **Improved UI**: 3-column form layout and enhanced dropdown styling
- **Cache-busting**: Version management to ensure latest features load properly
- **Updated Seed Data**: New staff members with proper category assignments

### v1.3
- **Demo Credentials**: Pre-filled login form with admin/demo123 for easier testing
- **Login Button Spacing**: Fixed gap between password field and login button
- **Cache-busting**: Version management to prevent UI update issues

### v1.2
- **Initial Standby State**: All displays start in Standby mode by default
- **Table Width Stability**: Fixed layout shifts when toggling Active/Standby
- **Cache-busting**: Version management for consistent updates

### v1.1
- **Active/Standby Toggle**: Replaced Wake button with modern toggle switch
- **Removed HHH Logo**: Cleaner standby state display
- **Cache-busting**: Version management to prevent caching issues

### v1.0
- **Core Functionality**: Initial implementation of E-ink admin system
- **Staff Management**: Add, edit, delete staff members
- **Display Monitoring**: Real-time status tracking
- **Dashboard Interface**: Status indicators and controls
- **Settings Page**: Staff directory management
- **Basic Authentication**: Login system with demo credentials
