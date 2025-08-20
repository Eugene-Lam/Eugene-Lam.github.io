// Simple in-browser state for prototype purpose only
const APP_VERSION = '1.7';
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

