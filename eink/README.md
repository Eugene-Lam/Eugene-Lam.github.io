# E-ink Admin System

A web-based administration interface for managing E-ink displays in a hospital environment.

## Features

- **Progressive Web App (PWA)**: Installable on desktop and mobile devices
- **Offline Support**: Works without internet connection
- **Multi-language Support**: English and Chinese (Hong Kong) localization
- **Dashboard**: Real-time monitoring of E-ink displays with status indicators
- **Staff Management**: Add, edit, and delete staff members with bilingual names
- **Display Control**: Toggle displays between Active and Standby modes
- **Responsive Design**: Works on desktop and mobile devices
- **App-like Experience**: Full-screen mode without browser UI

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
- **Import Staff**: Bulk import staff members from CSV or Excel files
- **Download Template**: Get a sample CSV template file for importing

## Import Staff from CSV/Excel

The application supports bulk importing staff members from CSV or Excel files, making it easy to add multiple staff members at once.

### Getting the Template

1. Navigate to the **Settings** page
2. Click the **"Download Template"** button
3. A CSV template file (`staff_import_template.csv`) will be downloaded

Alternatively, you can use the template file provided in the project: `staff_import_template.csv`

### CSV File Format

The CSV file must follow this format:

```
Chinese Name,English Name,Category
陳大文醫生,Dr Simon CHAN,Doctor
李小美醫生,Dr Emily LEE,Doctor
黃志強醫生,Dr Alex WONG,Doctor
王小美,Therapist WONG,Staff
李志強,Nurse LEE,Staff
```

### Column Requirements

- **Chinese Name** (Column 1): The staff member's name in Chinese. Can be empty if English name is provided.
- **English Name** (Column 2): The staff member's name in English. Can be empty if Chinese name is provided.
- **Category** (Column 3): Must be either `Doctor` or `Staff`. Defaults to `Doctor` if not specified.

**Note**: At least one name field (Chinese or English) must be filled for each row.

### Editing the CSV File

#### Using Microsoft Excel

1. Open the template file in Microsoft Excel
2. Add your staff data in the rows below the header
3. Ensure each row has:
   - Chinese name (optional, but recommended)
   - English name (optional, but recommended)
   - Category: `Doctor` or `Staff`
4. Save the file as CSV (Comma delimited) format
5. **Important**: When saving, choose "CSV UTF-8 (Comma delimited) (*.csv)" to preserve Chinese characters

#### Using Google Sheets

1. Upload the template file to Google Sheets
2. Edit the data as needed
3. Go to **File → Download → Comma-separated values (.csv, current sheet)**
4. The downloaded file will be ready for import

#### Using a Text Editor

1. Open the template file in any text editor (Notepad, TextEdit, VS Code, etc.)
2. Add new rows following the format:
   ```
   Chinese Name,English Name,Category
   ```
3. Separate each field with a comma
4. If a field contains commas, wrap it in double quotes: `"Name, with comma"`
5. Save the file with `.csv` extension
6. Ensure the file is saved with UTF-8 encoding to preserve Chinese characters

### Importing the File

1. Navigate to the **Settings** page
2. Click **"Select File"** button
3. Choose your CSV or Excel file (`.csv`, `.xlsx`, or `.xls`)
4. The system will automatically:
   - Parse the file
   - Validate the data
   - Import all valid staff members
   - Show a success message with the number of imported staff

### Supported File Formats

- **CSV** (`.csv`): Comma-separated values file
- **Excel** (`.xlsx`, `.xls`): Microsoft Excel files

### Excel File Format

If using Excel files:
- The first row can be a header row (will be automatically detected)
- Column names can be in English or Chinese
- Supported column names:
  - Chinese: `Chinese Name`, `中文姓名`, `中文`, or any column containing "chinese" or "中文"
  - English: `English Name`, `英文姓名`, `英文`, or any column containing "english" or "英文"
  - Category: `Category`, `類別`, or any column containing "category" or "類別"
- If column names are not found, the system assumes the order: Column 1 = Chinese, Column 2 = English, Column 3 = Category

### Tips for Editing

1. **Preserve Headers**: Keep the first row as headers (Chinese Name, English Name, Category)
2. **UTF-8 Encoding**: Always save CSV files with UTF-8 encoding to preserve Chinese characters
3. **No Empty Rows**: Remove any completely empty rows before importing
4. **Category Values**: Use exactly `Doctor` or `Staff` (case-insensitive, but must match these words)
5. **Special Characters**: If a name contains commas, wrap the entire field in double quotes
6. **Validation**: At least one name field (Chinese or English) must be filled for each row

### Example CSV Content

```csv
Chinese Name,English Name,Category
陳大文醫生,Dr Simon CHAN,Doctor
李小美醫生,Dr Emily LEE,Doctor
黃志強醫生,Dr Alex WONG,Doctor
王小美,Therapist WONG,Staff
李志強,Nurse LEE,Staff
張三,Dr John ZHANG,Doctor
,"Dr Mary SMITH",Doctor
```

Note: The last row shows that you can leave Chinese name empty if you only have an English name.

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
├── offline.html    # Offline page
├── manifest.json   # PWA manifest
├── sw.js           # Service worker
├── pwa.js          # PWA management
├── test.html                    # Language test page
├── staff_import_template.csv     # CSV template for staff import
└── assets/                      # Images, logos, and icons
```

### Internationalization System

The i18n system uses:
- `data-i18n` attributes for text content
- `data-i18n-placeholder` for input placeholders
- `I18N.getText(key)` for dynamic content
- Event-driven updates when language changes
- **Performance Optimizations**: DOM element caching and debounced updates
- **Flash Prevention**: Immediate language initialization with content loading states
- **Smooth UX**: Opacity transitions and rapid click protection

### Browser Compatibility

- Modern browsers with ES6+ support
- LocalStorage for data persistence
- Responsive CSS Grid and Flexbox layout
- PWA support (Chrome 67+, Firefox 67+, Safari 11.1+, Edge 79+)

## Progressive Web App (PWA)

This application is a Progressive Web App that can be installed on desktop and mobile devices.

### Installation

- **Desktop**: Look for the install button in your browser's address bar
- **Android**: Use "Add to Home screen" in Chrome
- **iOS**: Use "Add to Home Screen" in Safari

### PWA Features

- **Offline Functionality**: Works without internet connection
- **App-like Experience**: Full-screen mode without browser UI
- **Automatic Updates**: Notifies when new versions are available
- **Install Prompts**: Easy installation on supported devices

### Offline Usage

Once installed, the app will:
- Cache essential files for offline use
- Store data locally
- Sync when connection is restored
- Show offline indicators when disconnected

For detailed PWA documentation, see [PWA-README.md](PWA-README.md).


## Version History

### v1.8.2 (Current)
- **Staff Import Feature**: Bulk import staff members from CSV or Excel files
- **Template Download**: Download CSV template for easy data entry
- **Excel Support**: Full support for .xlsx and .xls file formats
- **Flexible Column Detection**: Automatic detection of column names in multiple languages
- **Import Validation**: Comprehensive error handling and validation
- **Bilingual Import Messages**: Import status messages in English and Chinese

### v1.8 (Previous)
- **Progressive Web App (PWA)**: Complete PWA implementation with installability
- **Offline Support**: Service worker for offline functionality and caching
- **App Installation**: Install prompts and app-like experience
- **Offline Page**: Dedicated offline page with reconnection handling
- **PWA Management**: Automatic updates and online/offline status monitoring
- **Enhanced Icons**: Multiple icon sizes for different devices and platforms
- **Performance Optimizations**: Debounced language switching with DOM caching
- **Language Flash Fix**: Immediate i18n initialization prevents content flash
- **Smooth Transitions**: Content fade-in after language initialization
- **Rapid Click Protection**: Prevents excessive language switching

### v1.7
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
