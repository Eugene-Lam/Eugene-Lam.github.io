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

- **v1.7**: Added multi-language support (English & Chinese Hong Kong)
- **v1.6**: Core functionality and UI improvements
- Previous versions: Initial development
