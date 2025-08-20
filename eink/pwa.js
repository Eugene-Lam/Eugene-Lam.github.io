// PWA Registration and Management
class PWA {
  constructor() {
    this.isInstalled = false;
    this.deferredPrompt = null;
    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.checkInstallation();
  }

  // Register service worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/eink/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Setup install prompt
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallButton();
      console.log('PWA was installed');
    });
  }

  // Check if app is already installed
  checkInstallation() {
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      this.isInstalled = true;
      this.hideInstallButton();
    }
  }

  // Show install button
  showInstallButton() {
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
      installBtn.style.display = 'block';
      installBtn.addEventListener('click', () => this.installApp());
    }
  }

  // Hide install button
  hideInstallButton() {
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  }

  // Install app
  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      this.deferredPrompt = null;
    }
  }

  // Show update notification
  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <span>New version available</span>
        <button onclick="location.reload()">Update</button>
        <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
      </div>
    `;
    document.body.appendChild(notification);
  }

  // Check online status
  checkOnlineStatus() {
    if (!navigator.onLine) {
      this.showOfflineIndicator();
    } else {
      this.hideOfflineIndicator();
    }
  }

  // Show offline indicator
  showOfflineIndicator() {
    let indicator = document.getElementById('offlineIndicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'offlineIndicator';
      indicator.className = 'offline-indicator';
      indicator.textContent = 'Offline Mode';
      document.body.appendChild(indicator);
    }
    indicator.style.display = 'block';
  }

  // Hide offline indicator
  hideOfflineIndicator() {
    const indicator = document.getElementById('offlineIndicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }
}

// Initialize PWA when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.pwa = new PWA();
  
  // Listen for online/offline events
  window.addEventListener('online', () => window.pwa.checkOnlineStatus());
  window.addEventListener('offline', () => window.pwa.checkOnlineStatus());
  
  // Initial online status check
  window.pwa.checkOnlineStatus();
});
