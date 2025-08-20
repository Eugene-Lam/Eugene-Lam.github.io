// Internationalization (i18n) module
const TRANSLATIONS = {
  en: {
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    settings: 'Settings',
    logout: 'Logout',
    
    // Brand
    brand: '專科門診 SOPD',
    footer: 'HA • HHH — E‑ink Admin Prototype',
    
    // Login page
    login: 'Login',
    account: 'Account',
    password: 'Password',
    enterAccount: 'Enter user account',
    enterPassword: 'Enter password',
    
    // Dashboard page
    einkDisplays: 'E‑ink Displays',
    refreshStatus: 'Refresh Status',
    setAllStandby: 'Set ALL to Standby',
    
    // Table headers
    room: 'Room',
    signal: 'Signal',
    online: 'Online',
    battery: 'Battery',
    lastUpdate: 'Last Update',
    staff: 'Staff',
    actions: 'Actions',
    
    // Status
    onlineStatus: 'Online',
    offlineStatus: 'Offline',
    active: 'Active',
    standby: 'Standby',
    
    // Settings page
    staffDirectory: 'Staff Directory',
    chineseName: 'Chinese Name',
    englishName: 'English Name',
    category: 'Category',
    doctor: 'Doctor',
    staff: 'Staff',
    addStaff: 'Add Staff',
    clear: 'Clear',
    edit: 'Edit',
    delete: 'Delete',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    
    // Form placeholders
    chineseNamePlaceholder: 'e.g. 陳大文醫生',
    englishNamePlaceholder: 'e.g. Dr Simon CHAN',
    
    // Warnings and messages
    fillOneNameField: '⚠️ Please fill in at least one name field (Chinese or English)',
    deleteStaffConfirm: 'Delete this staff member?',
    
    // Table columns
    number: '#',
    chinese: 'Chinese',
    english: 'English',
    
    // Modal
    editStaffMember: 'Edit Staff Member',
    
    // Aria labels
    toggleActiveStandby: 'Toggle Active / Standby'
  },
  
  'zh-HK': {
    // Navigation
    home: '首頁',
    dashboard: '儀表板',
    settings: '設定',
    logout: '登出',
    
    // Brand
    brand: '專科門診 SOPD',
    footer: 'HA • HHH — E‑ink 管理原型',
    
    // Login page
    login: '登入',
    account: '帳戶',
    password: '密碼',
    enterAccount: '輸入用戶帳戶',
    enterPassword: '輸入密碼',
    
    // Dashboard page
    einkDisplays: 'E‑ink 顯示器',
    refreshStatus: '重新整理狀態',
    setAllStandby: '全部設為待機',
    
    // Table headers
    room: '房間',
    signal: '訊號',
    online: '連線',
    battery: '電池',
    lastUpdate: '最後更新',
    staff: '職員',
    actions: '操作',
    
    // Status
    onlineStatus: '連線',
    offlineStatus: '離線',
    active: '啟用',
    standby: '待機',
    
    // Settings page
    staffDirectory: '職員目錄',
    chineseName: '中文姓名',
    englishName: '英文姓名',
    category: '類別',
    doctor: '醫生',
    staff: '職員',
    addStaff: '新增職員',
    clear: '清除',
    edit: '編輯',
    delete: '刪除',
    saveChanges: '儲存變更',
    cancel: '取消',
    
    // Form placeholders
    chineseNamePlaceholder: '例如：陳大文醫生',
    englishNamePlaceholder: '例如：Dr Simon CHAN',
    
    // Warnings and messages
    fillOneNameField: '⚠️ 請填寫至少一個姓名欄位（中文或英文）',
    deleteStaffConfirm: '刪除此職員？',
    
    // Table columns
    number: '#',
    chinese: '中文',
    english: '英文',
    
    // Modal
    editStaffMember: '編輯職員',
    
    // Aria labels
    toggleActiveStandby: '切換啟用/待機'
  }
};

// Language management
let currentLanguage = 'en';

// Main I18N object with all functions
const I18N = {
  // Get current language
  getLanguage() {
    return currentLanguage;
  },

  // Set language
  setLanguage(lang) {
    if (TRANSLATIONS[lang]) {
      currentLanguage = lang;
      localStorage.setItem('eink.language', lang);
      document.documentElement.lang = lang;
      this.updatePageLanguage();
      
      // Update language switcher button states
      const switcher = document.querySelector('.language-switcher');
      if (switcher) {
        switcher.querySelectorAll('button').forEach(btn => {
          btn.disabled = btn.dataset.lang === currentLanguage;
        });
      }
      
      // Dispatch language changed event
      document.dispatchEvent(new CustomEvent('languageChanged'));
    }
  },

  // Get translated text
  getText(key) {
    return TRANSLATIONS[currentLanguage][key] || TRANSLATIONS.en[key] || key;
  },

  // Update page language
  updatePageLanguage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const text = this.getText(key);
      
      if (element.tagName === 'OPTION') {
        element.textContent = text;
      } else {
        element.textContent = text;
      }
    });
    
    // Update placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.getText(key);
    });
    
    // Update title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.getText(key);
    });
    
    // Update aria-label attributes
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
      const key = element.getAttribute('data-i18n-aria-label');
      element.setAttribute('aria-label', this.getText(key));
    });
  },

  // Initialize language from localStorage or browser preference
  initializeLanguage() {
    const savedLanguage = localStorage.getItem('eink.language');
    const browserLanguage = navigator.language || navigator.userLanguage;
    
    if (savedLanguage && TRANSLATIONS[savedLanguage]) {
      this.setLanguage(savedLanguage);
    } else if (browserLanguage.startsWith('zh')) {
      this.setLanguage('zh-HK');
    } else {
      this.setLanguage('en');
    }
  },

  // Create language switcher component
  createLanguageSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.innerHTML = `
      <button class="btn btn-ghost" data-lang="en" ${currentLanguage === 'en' ? 'disabled' : ''}>EN</button>
      <button class="btn btn-ghost" data-lang="zh-HK" ${currentLanguage === 'zh-HK' ? 'disabled' : ''}>中文</button>
    `;
    
    switcher.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' && e.target.dataset.lang) {
        this.setLanguage(e.target.dataset.lang);
        // Update button states
        switcher.querySelectorAll('button').forEach(btn => {
          btn.disabled = btn.dataset.lang === currentLanguage;
        });
      }
    });
    
    return switcher;
  }
};

// Export for use in other modules
window.I18N = I18N;
