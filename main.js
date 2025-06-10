// main.js

// Helper: check login and load profile on profile.html/emails.html
document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.endsWith('profile.html')) {
    loadProfile();
    document.getElementById('logout-btn').onclick = logout;
    document.getElementById('regen-api-key').onclick = regenApiKey;
    document.getElementById('regen-base32').onclick = regenBase32;
    document.getElementById('change-pass-form').onsubmit = changePassword;
  }
  if (window.location.pathname.endsWith('emails.html')) {
    loadEmails();
    document.getElementById('logout-btn').onclick = logout;
    document.getElementById('add-email-form').onsubmit = addEmail;
  }
  if (window.location.pathname.endsWith('login.html')) {
    document.getElementById('login-form').onsubmit = login;
  }
  if (window.location.pathname.endsWith('register.html')) {
    document.getElementById('register-form').onsubmit = register;
  }
});

function getApiKey() {
  return localStorage.getItem('api_key');
}
function saveApiKey(key) {
  localStorage.setItem('api_key', key);
}
function logout() {
  localStorage.removeItem('api_key');
  window.location.href = 'login.html';
}

// Đăng nhập
async function login(e) {
  e.preventDefault();
  const email = document.getElementById('typeEmailX').value.trim();
  const pass = document.getElementById('typePasswordX').value;
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, pass })
  });
  const data = await res.json();
  if (data.ok) {
    saveApiKey(data.api_key);
    window.location.href = 'profile.html';
  } else {
    alert(data.error || 'Đăng nhập thất bại!');
  }
}

// Đăng ký
async function register(e) {
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPassword').value;
  const res = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, pass })
  });
  const data = await res.json();
  if (data.ok) {
    saveApiKey(data.api_key);
    window.location.href = 'profile.html';
  } else {
    alert(data.error || 'Đăng ký thất bại!');
  }
}

// Load profile
async function loadProfile() {
  const api_key = getApiKey();
  if (!api_key) return logout();
  const res = await fetch('/profile', {
    headers: { 'Authorization': api_key }
  });
  const data = await res.json();
  if (!data.ok) return logout();
  document.getElementById('profile-email').textContent = data.email;
  document.getElementById('profile-api-key').textContent = data.api_key;
  document.getElementById('profile-base32').textContent = data.base32;
  document.getElementById('profile-time').textContent = data.time;
}

// Đổi mật khẩu
async function changePassword(e) {
  e.preventDefault();
  const api_key = getApiKey();
  const newPassword = document.getElementById('newPassword').value;
  const res = await fetch('/change-pass', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': api_key },
    body: JSON.stringify({ newPassword })
  });
  const data = await res.json();
  document.getElementById('change-pass-status').textContent = data.ok ? 'Đổi mật khẩu thành công!' : 'Lỗi đổi mật khẩu!';
}

// Tạo mới API Key
async function regenApiKey() {
  const api_key = getApiKey();
  const res = await fetch('/regen-key', {
    method: 'POST',
    headers: { 'Authorization': api_key }
  });
  const data = await res.json();
  if (data.ok) {
    saveApiKey(data.api_key);
    loadProfile();
  }
}

// Tạo mới Base32
async function regenBase32() {
  const api_key = getApiKey();
  const res = await fetch('/regen-base32', {
    method: 'POST',
    headers: { 'Authorization': api_key }
  });
  const data = await res.json();
  if (data.ok) loadProfile();
}

// Load danh sách email
async function loadEmails() {
  const api_key = getApiKey();
  if (!api_key) return logout();
  const res = await fetch('/email/list', {
    headers: { 'Authorization': api_key }
  });
  const data = await res.json();
  const tbody = document.querySelector('#emails-table tbody');
  tbody.innerHTML = '';
  if (data.ok && Array.isArray(data.emails)) {
    data.emails.forEach(email => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${email.email}</td>
        <td>${email.status || ''}</td>
        <td>${email.token ? '<span class="text-success">Có</span>' : '<span class="text-danger">Chưa</span>'}</td>
        <td>
          <button class="btn btn-sm btn-primary me-1" onclick="refreshToken('${email.email}')">Làm mới token</button>
          <button class="btn btn-sm btn-secondary me-1" onclick="getCode('${email.email}')">Lấy mã code</button>
          <button class="btn btn-sm btn-danger" onclick="deleteEmail('${email.email}')">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// Thêm email mới
async function addEmail(e) {
  e.preventDefault();
  const api_key = getApiKey();
  const email = document.getElementById('newEmail').value.trim();
  const pass = document.getElementById('newEmailPass').value;
  const res = await fetch('/email/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': api_key },
    body: JSON.stringify({ email, pass })
  });
  const data = await res.json();
  if (data.ok) {
    loadEmails();
    e.target.reset();
  } else {
    alert(data.error || 'Không thêm được email!');
  }
}

// Các thao tác cho từng email (dùng window.* cho HTML inline handler)
window.refreshToken = async function(email) {
  const api_key = getApiKey();
  const res = await fetch('/email/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': api_key },
    body: JSON.stringify({ email })
  });
  loadEmails();
};
window.getCode = async function(email) {
  const api_key = getApiKey();
  const res = await fetch('/email/get-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': api_key },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  alert(data.code ? `Mã code: ${data.code}` : 'Không lấy được mã!');
};
window.deleteEmail = async function(email) {
  if (!confirm('Bạn chắc chắn muốn xóa email này?')) return;
  const api_key = getApiKey();
  const res = await fetch('/email/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': api_key },
    body: JSON.stringify({ email })
  });
  loadEmails();
};
