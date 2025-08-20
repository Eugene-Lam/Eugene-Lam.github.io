# E-ink Admin PWA

This application has been converted to a Progressive Web App (PWA) for enhanced user experience and offline functionality.

## PWA Features

- **Installable**: Can be installed on desktop and mobile devices
- **Offline Support**: Works without internet connection
- **App-like Experience**: Full-screen mode without browser UI
- **Automatic Updates**: Notifies users when new versions are available
- **Responsive Design**: Optimized for all screen sizes

## Installation Instructions

### Desktop (Chrome, Edge, Firefox)
1. Open the application in your browser
2. Look for the install button in the address bar or navigation
3. Click "Install" to add to your desktop
4. The app will appear in your applications list

### Mobile (Android)
1. Open the application in Chrome
2. Tap the menu (⋮) and select "Add to Home screen"
3. Follow the prompts to install
4. The app will appear on your home screen

### Mobile (iOS)
1. Open the application in Safari
2. Tap the share button (□↑)
3. Select "Add to Home Screen"
4. Tap "Add" to install
5. The app will appear on your home screen

## Offline Usage

Once installed, the app will work offline:
- All core functionality is cached
- Data is stored locally
- Syncs when connection is restored
- Shows offline indicator when disconnected

## PWA Components

- **manifest.json**: App configuration and metadata
- **sw.js**: Service worker for caching and offline support
- **pwa.js**: PWA registration and management
- **offline.html**: Offline page
- **Icons**: Various sizes for different devices

## Development

To test PWA features:
1. Serve the app over HTTPS (required for service workers)
2. Use Chrome DevTools > Application tab to inspect PWA elements
3. Test offline functionality by disabling network
4. Check install prompts and app behavior

## Browser Support

- Chrome 67+
- Firefox 67+
- Safari 11.1+
- Edge 79+

## Troubleshooting

- **Install button not showing**: Ensure HTTPS and valid manifest
- **Offline not working**: Check service worker registration
- **Icons not displaying**: Verify icon paths in manifest.json
- **Updates not showing**: Clear cache and reload

## Customization

- Edit `manifest.json` to change app metadata
- Modify `sw.js` for custom caching strategies
- Update icons in `assets/` directory
- Customize offline page in `offline.html`
