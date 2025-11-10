// Simple in-browser state for prototype purpose only
const APP_VERSION = '1.8.2';
const STORAGE_KEYS = {
  version: 'eink.version',
  loggedIn: 'eink.loggedIn',
  doctors: 'eink.doctors',
  displays: 'eink.displays',
  language: 'eink.language',
};

function checkVersion() {
  const storedVersion = localStorage.getItem(STORAGE_KEYS.version);
  if (storedVersion !== APP_VERSION) {
    // Clear all data when version changes
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.version, APP_VERSION);
    return true; // Indicates data was reset
  }
  return false; // No reset needed
}

function getLoggedIn() {
  return localStorage.getItem(STORAGE_KEYS.loggedIn) === 'true';
}

function setLoggedIn(value) {
  localStorage.setItem(STORAGE_KEYS.loggedIn, value ? 'true' : 'false');
}

function seedDoctorsIfNeeded() {
  const existing = localStorage.getItem(STORAGE_KEYS.doctors);
  if (existing) return;
  const seed = [
    { id: crypto.randomUUID(), chinese: '陳大文醫生', english: 'Dr Simon CHAN', category: 'Doctor' },
    { id: crypto.randomUUID(), chinese: '李小美醫生', english: 'Dr Emily LEE', category: 'Doctor' },
    { id: crypto.randomUUID(), chinese: '黃志強醫生', english: 'Dr Alex WONG', category: 'Doctor' },
    { id: crypto.randomUUID(), chinese: '王小美', english: 'Therapist WONG', category: 'Staff' },
    { id: crypto.randomUUID(), chinese: '李志強', english: 'Nurse LEE', category: 'Staff' },
  ];
  localStorage.setItem(STORAGE_KEYS.doctors, JSON.stringify(seed));
}

function getDoctors() {
  seedDoctorsIfNeeded();
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.doctors) || '[]'); }
  catch { return []; }
}

function saveDoctors(doctors) {
  localStorage.setItem(STORAGE_KEYS.doctors, JSON.stringify(doctors));
}

function addDoctor(chinese, english, category) {
  const doctors = getDoctors();
  doctors.push({ id: crypto.randomUUID(), chinese, english, category });
  saveDoctors(doctors);
}

function updateDoctor(id, chinese, english, category) {
  const doctors = getDoctors().map(d => d.id === id ? { ...d, chinese, english, category } : d);
  saveDoctors(doctors);
}

function deleteDoctor(id) {
  const doctors = getDoctors().filter(d => d.id !== id);
  saveDoctors(doctors);
}

function seedDisplaysIfNeeded() {
  const existing = localStorage.getItem(STORAGE_KEYS.displays);
  if (existing) return;
  const now = Date.now();
  const displays = Array.from({ length: 15 }, (_, i) => ({
    id: `room-${i + 1}`,
    label: `Room ${i + 1}`,
    signalStrength: Math.floor(Math.random() * 5) + 1, // 1..5
    online: Math.random() > 0.1,
    battery: Math.floor(Math.random() * 51) + 50, // 50..100
    lastUpdate: now - Math.floor(Math.random() * 1000 * 60 * 60),
    doctorId: null,
    standby: true, // Start in Standby mode
  }));
  localStorage.setItem(STORAGE_KEYS.displays, JSON.stringify(displays));
}

function getDisplays() {
  seedDisplaysIfNeeded();
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.displays) || '[]');
    // Migration: collapse doctorChineseId/doctorEnglishId into doctorId if present
    let migrated = false;
    const normalized = list.map((d) => {
      if (d.doctorId) return d;
      if (typeof d.doctorChineseId !== 'undefined' || typeof d.doctorEnglishId !== 'undefined') {
        migrated = true;
        return {
          ...d,
          doctorId: d.doctorEnglishId || d.doctorChineseId || null,
          doctorChineseId: undefined,
          doctorEnglishId: undefined,
        };
      }
      return d;
    });
    if (migrated) saveDisplays(normalized);
    return normalized;
  }
  catch { return []; }
}

function saveDisplays(displays) {
  localStorage.setItem(STORAGE_KEYS.displays, JSON.stringify(displays));
}

function setAllStandby(value) {
  const displays = getDisplays().map(d => ({ ...d, standby: value }));
  saveDisplays(displays);
}

// UI helpers
function formatTime(ts) {
  const d = new Date(ts);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function createSignalBars(level) {
  const el = document.createElement('div');
  el.className = 'bars';
  for (let i = 1; i <= 5; i += 1) {
    const bar = document.createElement('div');
    bar.className = 'bar' + (i <= level ? ' on' : '');
    el.appendChild(bar);
  }
  return el;
}

function renderDashboard() {
  const tbody = document.getElementById('displaysBody');
  if (!tbody) return;
  const doctors = getDoctors();
  const displays = getDisplays();
  tbody.innerHTML = '';

  const buildDoctorSelect = (selectedId) => {
    const select = document.createElement('select');
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = '—';
    select.appendChild(empty);
    
    // Group by category
    const grouped = doctors.reduce((acc, d) => {
      const category = d.category || 'Doctor'; // Default to 'Doctor' if category is missing
      if (!acc[category]) acc[category] = [];
      acc[category].push(d);
      return acc;
    }, {});
    
    // Add options grouped by category
    Object.keys(grouped).sort().forEach(category => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = category === 'Doctor' ? I18N.getText('doctor') : I18N.getText('staff');
             grouped[category].forEach(d => {
         const opt = document.createElement('option');
         opt.value = d.id;
         opt.textContent = `${d.chinese} / ${d.english} (${category === 'Doctor' ? I18N.getText('doctor') : I18N.getText('staff')})`;
         if (d.id === selectedId) opt.selected = true;
         optgroup.appendChild(opt);
       });
      select.appendChild(optgroup);
    });
    
    return select;
  };

  displays.forEach((disp, idx) => {
    const tr = document.createElement('tr');

    // Room label
    const tdRoom = document.createElement('td');
    tdRoom.textContent = disp.label;
    tr.appendChild(tdRoom);

    // Signal
    const tdSig = document.createElement('td');
    tdSig.appendChild(createSignalBars(disp.signalStrength));
    tr.appendChild(tdSig);

    // Online
    const tdOnline = document.createElement('td');
    const dot = document.createElement('span');
    dot.className = 'dot ' + (disp.online ? 'online' : 'offline');
    const label = document.createElement('span');
    label.textContent = disp.online ? I18N.getText('onlineStatus') : I18N.getText('offlineStatus');
    label.style.color = disp.online ? 'inherit' : 'var(--danger)';
    const wrap = document.createElement('div');
    wrap.className = 'status';
    wrap.append(dot, label);
    tdOnline.appendChild(wrap);
    tr.appendChild(tdOnline);

    // Battery
    const tdBat = document.createElement('td');
    tdBat.className = 'battery';
    tdBat.textContent = `${disp.battery}%`;
    tr.appendChild(tdBat);

    // Last Update
    const tdTs = document.createElement('td');
    tdTs.textContent = formatTime(disp.lastUpdate);
    tr.appendChild(tdTs);

    // Doctor (single combined)
    const tdDoc = document.createElement('td');
    const selDoc = buildDoctorSelect(disp.doctorId);
    selDoc.addEventListener('change', () => {
      const displaysNow = getDisplays();
      displaysNow[idx].doctorId = selDoc.value || null;
      saveDisplays(displaysNow);
    });
    tdDoc.appendChild(selDoc);
    tr.appendChild(tdDoc);

    // Actions (Active/Standby toggle)
    const tdAct = document.createElement('td');
    const switchWrap = document.createElement('label');
    switchWrap.className = 'switch';
    const switchInput = document.createElement('input');
    switchInput.type = 'checkbox';
    switchInput.checked = !disp.standby; // checked = Active
    switchInput.setAttribute('aria-label', I18N.getText('toggleActiveStandby'));
    const switchSlider = document.createElement('span');
    switchSlider.className = 'slider';
    const switchText = document.createElement('span');
    switchText.className = 'switch-label';
    switchText.textContent = switchInput.checked ? I18N.getText('active') : I18N.getText('standby');
    switchText.style.minWidth = '60px'; // Fixed width to prevent table layout shifts

    switchInput.addEventListener('change', () => {
      const displaysNow = getDisplays();
      displaysNow[idx].standby = !switchInput.checked; // unchecked => Standby
      displaysNow[idx].lastUpdate = Date.now();
      saveDisplays(displaysNow);
      disp.standby = displaysNow[idx].standby;
      switchText.textContent = switchInput.checked ? I18N.getText('active') : I18N.getText('standby');
      tdTs.textContent = formatTime(displaysNow[idx].lastUpdate);
    });

    switchWrap.append(switchInput, switchSlider);
    tdAct.append(switchWrap, document.createTextNode(' '), switchText);
    tr.appendChild(tdAct);

    tbody.appendChild(tr);
  });

  document.getElementById('refreshStatusBtn')?.addEventListener('click', () => {
    // Simulate status refresh
    const updated = getDisplays().map(d => ({
      ...d,
      signalStrength: Math.floor(Math.random() * 5) + 1,
      battery: Math.max(10, Math.min(100, d.battery - Math.floor(Math.random() * 3))),
      lastUpdate: Date.now(),
    }));
    saveDisplays(updated);
    renderDashboard();
  });

  document.getElementById('setAllStandbyBtn')?.addEventListener('click', () => {
    setAllStandby(true);
    renderDashboard();
  });
  
  // Re-render when language changes
  document.addEventListener('languageChanged', () => {
    renderDashboard();
  });
}

function renderSettings() {
  const body = document.getElementById('doctorsBody');
  if (!body) return;
  const doctors = getDoctors();
  body.innerHTML = '';
  doctors.forEach((d, i) => {
    const tr = document.createElement('tr');
    const categoryText = d.category === 'Doctor' ? I18N.getText('doctor') : I18N.getText('staff');
    tr.innerHTML = `<td>${i + 1}</td><td>${categoryText}</td><td>${d.chinese}</td><td>${d.english}</td>`;
    const tdAct = document.createElement('td');
    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn';
    btnEdit.textContent = I18N.getText('edit');
    btnEdit.addEventListener('click', () => {
      openEditModal(d);
    });
    const btnDel = document.createElement('button');
    btnDel.className = 'btn';
    btnDel.textContent = I18N.getText('delete');
    btnDel.addEventListener('click', () => {
      if (!confirm(I18N.getText('deleteStaffConfirm'))) return;
      deleteDoctor(d.id);
      renderSettings();
    });
    tdAct.append(btnEdit, document.createTextNode(' '), btnDel);
    tr.appendChild(tdAct);
    body.appendChild(tr);
  });

  const form = document.getElementById('doctorForm');
  const chineseInput = document.getElementById('doctorChinese');
  const englishInput = document.getElementById('doctorEnglish');
  const categorySelect = document.getElementById('doctorCategory');
  const clearBtn = document.getElementById('clearFormBtn');
  const formWarning = document.getElementById('formWarning');
  
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const c = chineseInput.value.trim();
    const eName = englishInput.value.trim();
    const category = categorySelect.value;
    
    if (!c && !eName) {
      // Show warning when both fields are empty
      formWarning.style.display = 'block';
      return;
    }
    
    // Hide warning if it was showing
    formWarning.style.display = 'none';
    
    addDoctor(c, eName, category);
    chineseInput.value = '';
    englishInput.value = '';
    categorySelect.value = 'Doctor';
    renderSettings();
  });
  clearBtn?.addEventListener('click', () => {
    chineseInput.value = '';
    englishInput.value = '';
    categorySelect.value = 'Doctor';
    formWarning.style.display = 'none'; // Hide warning when clearing
    chineseInput.focus();
  });
  
  // Hide warning when user starts typing in either field
  chineseInput?.addEventListener('input', () => {
    const c = chineseInput.value.trim();
    const eName = englishInput.value.trim();
    if (c || eName) {
      formWarning.style.display = 'none';
    }
  });
  
  englishInput?.addEventListener('input', () => {
    const c = chineseInput.value.trim();
    const eName = englishInput.value.trim();
    if (c || eName) {
      formWarning.style.display = 'none';
    }
  });

  // Modal functionality
  setupEditModal();
  
  // Import functionality
  setupImport();
  
  // Re-render when language changes
  document.addEventListener('languageChanged', () => {
    renderSettings();
  });
}

let currentEditId = null;

function openEditModal(staff) {
  currentEditId = staff.id;
  document.getElementById('editChinese').value = staff.chinese;
  document.getElementById('editEnglish').value = staff.english;
  document.getElementById('editCategory').value = staff.category || 'Doctor';
  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  currentEditId = null;
}

function setupEditModal() {
  const modal = document.getElementById('editModal');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelEdit');
  const editForm = document.getElementById('editForm');
  const editChineseInput = document.getElementById('editChinese');
  const editEnglishInput = document.getElementById('editEnglish');
  const editFormWarning = document.getElementById('editFormWarning');

  closeBtn?.addEventListener('click', closeEditModal);
  cancelBtn?.addEventListener('click', closeEditModal);
  
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeEditModal();
  });

  editForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentEditId) return;
    
    const chinese = editChineseInput.value.trim();
    const english = editEnglishInput.value.trim();
    const category = document.getElementById('editCategory').value;
    
    if (!chinese && !english) {
      // Show warning when both fields are empty
      editFormWarning.style.display = 'block';
      return;
    }
    
    // Hide warning if it was showing
    editFormWarning.style.display = 'none';
    
    updateDoctor(currentEditId, chinese, english, category);
    closeEditModal();
    renderSettings();
  });
  
  // Hide warning when user starts typing in either field
  editChineseInput?.addEventListener('input', () => {
    const chinese = editChineseInput.value.trim();
    const english = editEnglishInput.value.trim();
    if (chinese || english) {
      editFormWarning.style.display = 'none';
    }
  });
  
  editEnglishInput?.addEventListener('input', () => {
    const chinese = editChineseInput.value.trim();
    const english = editEnglishInput.value.trim();
    if (chinese || english) {
      editFormWarning.style.display = 'none';
    }
  });
}

// Import functionality
function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // Check if first line is header (optional)
  const startIndex = lines[0].toLowerCase().includes('chinese') || 
                     lines[0].toLowerCase().includes('english') ? 1 : 0;
  
  const data = [];
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parsing (handles quoted fields)
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim()); // Last field
    
    if (fields.length >= 2) {
      const chinese = fields[0] || '';
      const english = fields[1] || '';
      const category = (fields[2] || 'Doctor').trim();
      const normalizedCategory = category.toLowerCase() === 'staff' ? 'Staff' : 'Doctor';
      
      if (chinese || english) {
        data.push({ chinese, english, category: normalizedCategory });
      }
    }
  }
  
  return data;
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = new Uint8Array(e.target.result);
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON - first try with headers, then without
        let jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: '',
          raw: false
        });
        
        // Check if first row looks like a header
        const firstRow = jsonData[0];
        const hasHeader = firstRow && (
          Object.keys(firstRow).some(key => 
            key && (key.toLowerCase().includes('chinese') || 
                   key.toLowerCase().includes('english') ||
                   key.toLowerCase().includes('category'))
          ) ||
          Object.values(firstRow).some(val => 
            val && typeof val === 'string' && (
              val.toLowerCase().includes('chinese') || 
              val.toLowerCase().includes('english') ||
              val.toLowerCase().includes('category')
            )
          )
        );
        
        // If header detected, remove first row
        if (hasHeader && jsonData.length > 0) {
          jsonData = jsonData.slice(1);
        }
        
        // Normalize column names - try to find chinese, english, category columns
        const parsedData = jsonData
          .map(row => {
            let chinese = '';
            let english = '';
            let category = 'Doctor';
            
            // Try to find columns by name (case-insensitive)
            const keys = Object.keys(row);
            for (const key of keys) {
              const keyLower = key.toLowerCase();
              const val = (row[key] || '').toString().trim();
              
              if (keyLower.includes('chinese') || keyLower.includes('中文')) {
                chinese = val;
              } else if (keyLower.includes('english') || keyLower.includes('英文')) {
                english = val;
              } else if (keyLower.includes('category') || keyLower.includes('類別')) {
                category = val;
              }
            }
            
            // If no named columns found, assume order: chinese, english, category
            if (!chinese && !english && keys.length >= 2) {
              const values = Object.values(row);
              chinese = (values[0] || '').toString().trim();
              english = (values[1] || '').toString().trim();
              category = (values[2] || 'Doctor').toString().trim();
            }
            
            const normalizedCategory = category.toLowerCase() === 'staff' ? 'Staff' : 'Doctor';
            
            return { chinese, english, category: normalizedCategory };
          })
          .filter(row => row.chinese || row.english);
        
        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

async function handleFileImport(file) {
  const importStatus = document.getElementById('importStatus');
  if (!importStatus) return;
  
  importStatus.style.display = 'block';
  importStatus.style.background = 'var(--bg)';
  importStatus.style.color = 'var(--text)';
  importStatus.textContent = I18N.getText('importing') || 'Importing...';
  
  try {
    let data = [];
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      const text = await file.text();
      data = parseCSV(text);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      if (typeof XLSX === 'undefined') {
        throw new Error('Excel library not loaded');
      }
      data = await parseExcel(file);
    } else {
      throw new Error(I18N.getText('importInvalidFormat'));
    }
    
    if (data.length === 0) {
      throw new Error(I18N.getText('importNoData'));
    }
    
    // Import the data
    const doctors = getDoctors();
    let importedCount = 0;
    
    data.forEach(item => {
      if (item.chinese || item.english) {
        doctors.push({
          id: crypto.randomUUID(),
          chinese: item.chinese,
          english: item.english,
          category: item.category || 'Doctor'
        });
        importedCount++;
      }
    });
    
    saveDoctors(doctors);
    
    // Show success message
    importStatus.style.background = 'var(--ok)';
    importStatus.style.color = '#fff';
    const successMsg = I18N.getText('importSuccess').replace('{count}', importedCount);
    importStatus.textContent = successMsg;
    
    // Refresh the table
    renderSettings();
    
    // Clear file input
    const fileInput = document.getElementById('importFile');
    if (fileInput) fileInput.value = '';
    
    // Hide status after 5 seconds
    setTimeout(() => {
      importStatus.style.display = 'none';
    }, 5000);
    
  } catch (error) {
    importStatus.style.background = 'var(--danger)';
    importStatus.style.color = '#fff';
    const errorMsg = I18N.getText('importError').replace('{error}', error.message);
    importStatus.textContent = errorMsg;
    
    // Hide status after 5 seconds
    setTimeout(() => {
      importStatus.style.display = 'none';
    }, 5000);
  }
}

function downloadTemplate() {
  const csvContent = 'Chinese Name,English Name,Category\n陳大文醫生,Dr Simon CHAN,Doctor\n李小美醫生,Dr Emily LEE,Doctor\n黃志強醫生,Dr Alex WONG,Doctor\n王小美,Therapist WONG,Staff\n李志強,Nurse LEE,Staff';
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF-8 support
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', I18N.getText('templateFileName'));
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function setupImport() {
  const importFile = document.getElementById('importFile');
  const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
  
  importFile?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileImport(file);
    }
  });
  
  downloadTemplateBtn?.addEventListener('click', downloadTemplate);
}

function wireCommon() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      setLoggedIn(false);
      window.location.href = 'index.html';
    });
  }
}

function renderHome() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  document.getElementById('logoutBtn')?.setAttribute('hidden', '');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    if (!u || !p) return;
    setLoggedIn(true);
    window.location.href = 'dashboard.html';
  });
}

// Router per page
document.addEventListener('DOMContentLoaded', () => {
  // Add language switcher to all pages
  const languageSwitcherContainer = document.getElementById('languageSwitcher');
  if (languageSwitcherContainer) {
    languageSwitcherContainer.appendChild(I18N.createLanguageSwitcher());
  }
  
  // Check version and reset data if needed
  const wasReset = checkVersion();
  
  wireCommon();
  const page = document.body.getAttribute('data-page');
  if (page === 'home') renderHome();
  if (page === 'dashboard') renderDashboard();
  if (page === 'settings') renderSettings();
});

