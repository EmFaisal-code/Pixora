const SUPA_URL = 'https://movecexnjyeaipkklijv.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdmVjZXhuanllYWlwa2tsaWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTYzMDUsImV4cCI6MjA5MjQ3MjMwNX0.LdytPpEvTDapFfh_OxxOwSf3i8af4XVSe9mdy3QDkhE';
const g = id => document.getElementById(id);
const delay = ms => new Promise(r => setTimeout(r, ms));
const ELST_PAYLOAD = 268435457;
let connectedUsername = '';
let remoteConfig = { feature_boost:true, feature_prepare:true, feature_download:true };
let currentLang = 'en';
let currentTheme = 'theme-purple';
let prepMode = 'normal'; // 'normal' | 'lite'

// ── I18N ──
const i18n = {
  en: {
    tab_signin:'Sign In', tab_register:'Register',
    lbl_username:'TikTok Username', lbl_password:'Password', lbl_set_password:'Set Password',
    lbl_confirm_password:'Confirm Password', lbl_hint:'Password Hint',
    connect_btn:'Connect TikTok Account', pw_warning:"⚠️ Don't use your TikTok password. Create a different one.",
    btn_register:'Create Account', btn_signin:'Sign In', checking:'Checking...',
    boost_title:'Upload Boost', boost_standby:'Open TikTok upload page', boost_active:'Active — boost running',
    tab_prepare:'Prepare Video', tab_download:'Download',
    prep_title:'Prepare Video', prep_subtitle:'Bypass TikTok re-encode',
    mode_normal_desc:'Original quality, bypass re-encode',
    mode_lite_desc:'Standard upload, TikTok will compress',
    drop_text:'Drop MP4 video here', drop_sub:'or', drop_span:'click to select file',
    step1:'Reading file', step2:'Finding elst atom', step3:'Modifying metadata', step4:'Saving file',
    waiting:'Waiting...', reading:'Reading...', scanning:'Scanning...', modifying:'Modifying...', saving:'Saving...', done:'Done',
    result_ok:'File ready to upload!', result_ok_sub:'Upload _pixora.mp4 to TikTok',
    result_err_elst:'elst atom not found. Try another MP4.',
    reset_btn:'Process another file',
    dl_placeholder:'Paste TikTok link...',
    dl_loading:'⏳ Fetching data...',
    dl_video:'Video MP4', dl_audio:'Audio MP3',
    banned_title:'ACCOUNT BANNED', banned_sub:'Your account has been disabled by admin.\nContact @em.n.ef for more info.',
    err_fill:'Fill in username and password.', err_wrong:'Wrong username or password.',
    err_banned:'🚫 Your account has been banned.', err_connect:'Login to TikTok on active tab first.',
    err_exists:'Username already registered.', err_register:'Registration failed. Try again.',
    ok_registered:'Account created! Please sign in.',
    err_pass_mismatch:"Passwords don't match.",
    feature_disabled:'Feature disabled by admin',
    update_title:'UPDATE REQUIRED', update_msg:'Your version is outdated. Download the latest version to continue.', update_btn:'Download Update',
  },
  zh: {
    tab_signin:'登录', tab_register:'注册',
    lbl_username:'TikTok 用户名', lbl_password:'密码', lbl_set_password:'设置密码',
    lbl_confirm_password:'确认密码', lbl_hint:'密码提示',
    connect_btn:'连接 TikTok 账户', pw_warning:'⚠️ 请勿使用您的 TikTok 密码，请设置一个不同的密码。',
    btn_register:'创建账户', btn_signin:'登录', checking:'检查中...',
    boost_title:'上传加速', boost_standby:'打开 TikTok 上传页面', boost_active:'已激活 — 加速运行中',
    tab_prepare:'准备视频', tab_download:'下载',
    prep_title:'准备视频', prep_subtitle:'绕过 TikTok 重新编码',
    mode_normal_desc:'原始质量，绕过重新编码',
    mode_lite_desc:'标准上传，TikTok 将自动压缩',
    drop_text:'将 MP4 视频拖放到此处', drop_sub:'或', drop_span:'点击选择文件',
    step1:'读取文件', step2:'查找 elst 原子', step3:'修改元数据', step4:'保存文件',
    waiting:'等待中...', reading:'读取中...', scanning:'扫描中...', modifying:'修改中...', saving:'保存中...', done:'完成',
    result_ok:'文件已准备好上传！', result_ok_sub:'将 _pixora.mp4 上传到 TikTok',
    result_err_elst:'未找到 elst 原子，请尝试其他 MP4。',
    reset_btn:'处理其他文件',
    dl_placeholder:'粘贴 TikTok 链接...',
    dl_loading:'⏳ 获取数据中...',
    dl_video:'视频 MP4', dl_audio:'音频 MP3',
    banned_title:'账户已封禁', banned_sub:'您的账户已被管理员禁用。\n请联系 @em.n.ef 获取更多信息。',
    err_fill:'请填写用户名和密码。', err_wrong:'用户名或密码错误。',
    err_banned:'🚫 您的账户已被封禁。', err_connect:'请先在活动标签页登录 TikTok。',
    err_exists:'用户名已注册。', err_register:'注册失败，请重试。',
    ok_registered:'账户创建成功！请登录。',
    err_pass_mismatch:'两次密码不一致。',
    feature_disabled:'功能已被管理员禁用',
    update_title:'需要更新', update_msg:'您的版本已过期，请下载最新版本以继续使用。', update_btn:'下载更新',
  },
  id: {
    tab_signin:'Masuk', tab_register:'Daftar',
    lbl_username:'Username TikTok', lbl_password:'Kata Sandi', lbl_set_password:'Buat Kata Sandi',
    lbl_confirm_password:'Konfirmasi Kata Sandi', lbl_hint:'Hint Password',
    connect_btn:'Hubungkan Akun TikTok', pw_warning:'⚠️ Jangan gunakan password TikTok kamu. Buat password yang berbeda.',
    btn_register:'Buat Akun', btn_signin:'Masuk', checking:'Memeriksa...',
    boost_title:'Upload Boost', boost_standby:'Buka halaman upload TikTok', boost_active:'Aktif — boost berjalan',
    tab_prepare:'Prepare Video', tab_download:'Unduh',
    prep_title:'Prepare Video', prep_subtitle:'Bypass re-encode TikTok',
    mode_normal_desc:'Kualitas original, bypass re-encode',
    mode_lite_desc:'Upload standar, TikTok akan compress',
    drop_text:'Drop video MP4 di sini', drop_sub:'atau', drop_span:'klik untuk pilih file',
    step1:'Membaca file', step2:'Mencari elst atom', step3:'Memodifikasi metadata', step4:'Menyimpan file',
    waiting:'Menunggu...', reading:'Membaca...', scanning:'Scanning...', modifying:'Memodifikasi...', saving:'Menyimpan...', done:'Selesai',
    result_ok:'File siap diupload!', result_ok_sub:'Upload file _pixora.mp4 ke TikTok',
    result_err_elst:'elst atom tidak ditemukan. Coba video MP4 lain.',
    reset_btn:'Proses file lain',
    dl_placeholder:'Paste link TikTok...',
    dl_loading:'⏳ Mengambil data...',
    dl_video:'Video MP4', dl_audio:'Audio MP3',
    banned_title:'AKUN DIBANNED', banned_sub:'Akun kamu telah dinonaktifkan oleh admin.\nHubungi @em.n.ef untuk info lebih lanjut.',
    err_fill:'Isi username dan password.', err_wrong:'Username atau password salah.',
    err_banned:'🚫 Akun kamu telah dibanned.', err_connect:'Login ke TikTok di tab aktif dulu.',
    err_exists:'Username sudah terdaftar.', err_register:'Gagal mendaftar. Coba lagi.',
    ok_registered:'Akun berhasil dibuat! Silakan masuk.',
    err_pass_mismatch:'Password tidak cocok.',
    feature_disabled:'Fitur dinonaktifkan oleh admin',
    update_title:'PEMBARUAN DIPERLUKAN', update_msg:'Versi kamu sudah usang. Unduh versi terbaru untuk melanjutkan.',
    update_btn:'Unduh Pembaruan',
  },
  ru: {
    tab_signin:'Войти', tab_register:'Регистрация',
    lbl_username:'Имя пользователя TikTok', lbl_password:'Пароль', lbl_set_password:'Установить пароль',
    lbl_confirm_password:'Подтвердить пароль', lbl_hint:'Подсказка пароля',
    connect_btn:'Подключить аккаунт TikTok', pw_warning:'⚠️ Не используйте пароль от TikTok. Придумайте другой пароль.',
    btn_register:'Создать аккаунт', btn_signin:'Войти', checking:'Проверка...',
    boost_title:'Ускорение загрузки', boost_standby:'Откройте страницу загрузки TikTok', boost_active:'Активно — ускорение работает',
    tab_prepare:'Подготовить видео', tab_download:'Скачать',
    prep_title:'Подготовить видео', prep_subtitle:'Обход перекодирования TikTok',
    mode_normal_desc:'Оригинальное качество, обход перекодирования',
    mode_lite_desc:'Стандартная загрузка, TikTok сожмёт',
    drop_text:'Перетащите MP4 видео сюда', drop_sub:'или', drop_span:'нажмите для выбора файла',
    step1:'Чтение файла', step2:'Поиск elst атома', step3:'Изменение метаданных', step4:'Сохранение файла',
    waiting:'Ожидание...', reading:'Чтение...', scanning:'Сканирование...', modifying:'Изменение...', saving:'Сохранение...', done:'Готово',
    result_ok:'Файл готов к загрузке!', result_ok_sub:'Загрузите _pixora.mp4 в TikTok',
    result_err_elst:'Атом elst не найден. Попробуйте другой MP4.',
    reset_btn:'Обработать другой файл',
    dl_placeholder:'Вставьте ссылку TikTok...',
    dl_loading:'⏳ Получение данных...',
    dl_video:'Видео MP4', dl_audio:'Аудио MP3',
    banned_title:'АККАУНТ ЗАБЛОКИРОВАН', banned_sub:'Ваш аккаунт отключён администратором.\nСвяжитесь с @em.n.ef.',
    err_fill:'Заполните имя пользователя и пароль.', err_wrong:'Неверное имя пользователя или пароль.',
    err_banned:'🚫 Ваш аккаунт заблокирован.', err_connect:'Сначала войдите в TikTok на активной вкладке.',
    err_exists:'Имя пользователя уже зарегистрировано.', err_register:'Ошибка регистрации. Попробуйте снова.',
    ok_registered:'Аккаунт создан! Войдите в систему.',
    err_pass_mismatch:'Пароли не совпадают.',
    feature_disabled:'Функция отключена администратором',
    update_title:'ТРЕБУЕТСЯ ОБНОВЛЕНИЕ', update_msg:'Ваша версия устарела. Скачайте последнюю версию для продолжения.', update_btn:'Скачать обновление',
  }
};
const langs = ['en','id','zh','ru'];
const langLabels = { en:'EN', id:'ID', zh:'中文', ru:'RU' };
function t(k){ return (i18n[currentLang]||i18n.en)[k] || k; }

function applyLang() {
    // Auth tabs
    g('tabLogin').innerText = t('tab_signin');
    g('tabRegister').innerText = t('tab_register');
    // Login form
    g('lbl_username').innerText = t('lbl_username');
    g('lbl_password').innerText = t('lbl_password');
    g('loginBtn').innerText = t('btn_signin');
    // Register form
    g('connectBtnText').innerText = connectedUsername ? `${connectedUsername} ✔` : t('connect_btn');
    g('lbl_set_password').innerText = t('lbl_set_password');
    if (g('lbl_confirm_password')) g('lbl_confirm_password').innerText = t('lbl_confirm_password');
    if (g('lbl_hint')) g('lbl_hint').innerText = t('lbl_hint');
    g('pwWarning').innerText = t('pw_warning');
    g('registerBtn').innerText = t('btn_register');
    // Boost
    g('boostTitle').innerText = t('boost_title');
    // Nav tabs
    g('navPrepare').innerText = t('tab_prepare');
    g('navDownload').innerText = t('tab_download');
    // Prepare card
    g('prepTitle').innerText = t('prep_title');
    g('prepSubtitle').innerText = t('prep_subtitle');
    if (g('modeNormalDesc')) g('modeNormalDesc').innerText = t('mode_normal_desc');
    if (g('modeLiteDesc')) g('modeLiteDesc').innerText = t('mode_lite_desc');
    g('dropText').innerText = t('drop_text');
    g('dropSub').childNodes[0].textContent = t('drop_sub') + ' ';
    g('dropSpan').innerText = t('drop_span');
    // Steps
    g('step1Label').innerText = t('step1'); g('step1Status').innerText = t('waiting');
    g('step2Label').innerText = t('step2'); g('step2Status').innerText = t('waiting');
    g('step3Label').innerText = t('step3'); g('step3Status').innerText = t('waiting');
    g('step4Label').innerText = t('step4'); g('step4Status').innerText = t('waiting');
    g('resetBtn').innerText = t('reset_btn');
    // Download
    g('dlInput').placeholder = t('dl_placeholder');
    g('dlLoading').innerText = t('dl_loading');
    g('dlVideoBtnText').innerText = t('dl_video');
    g('dlAudioBtnText').innerText = t('dl_audio');
    // Banned
    g('bannedTitle').innerText = t('banned_title');
    g('bannedSub').innerHTML = t('banned_sub').replace('\n','<br>').replace('@em.n.ef','<strong>@em.n.ef</strong>');
    // Lang button
    g('langBtn').innerText = langLabels[currentLang];
    // Feature disabled text
    document.documentElement.style.setProperty('--disabled-text', `"${t('feature_disabled')}"`);
    // Boost sub (update if visible)
    const mc = g('mainCard');
    g('boostSub').innerText = mc && mc.classList.contains('on') ? t('boost_active') : t('boost_standby');
    // Update screen (if visible)
    if (g('updateView').classList.contains('active')) {
        g('updateTitle').innerText = t('update_title');
        g('updateMsg').innerText = t('update_msg');
        g('updateBtn').innerText = t('update_btn');
    }
}

// ── PASSWORD HASHING ──
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── SUPABASE ──
async function sbSelect(table, filter) {
    const res = await fetch(`${SUPA_URL}/rest/v1/${table}?${filter}&select=*`, {
        headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    });
    return res.json();
}
async function sbInsert(data) {
    return fetch(`${SUPA_URL}/rest/v1/pixora_users`, {
        method: 'POST',
        headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify(data)
    });
}

// ── REMOTE CONFIG ──
async function fetchRemoteConfig() {
    try {
        const rows = await sbSelect('pixora_config', 'select=key,enabled');
        if (Array.isArray(rows)) rows.forEach(r => { remoteConfig[r.key] = r.enabled; });
    } catch(e) {}
    applyRemoteConfig();
}
function applyRemoteConfig() {
    ['prepCard','dlCard','mainCard'].forEach((id, i) => {
        const keys = ['feature_prepare','feature_download','feature_boost'];
        const el = g(id); if (!el) return;
        if (!remoteConfig[keys[i]]) el.classList.add('feature-disabled');
        else el.classList.remove('feature-disabled');
    });
}

// ── HELPERS ──
function switchTab(tab) {
    const isLogin = tab === 'login';
    g('tabLogin').classList.toggle('active', isLogin);
    g('tabRegister').classList.toggle('active', !isLogin);
    g('loginForm').classList.toggle('hidden', !isLogin);
    g('registerForm').classList.toggle('hidden', isLogin);
}
function setMsg(id, text, type='') {
    const el = g(id); el.innerText = text;
    el.className = 'auth-msg' + (type ? ' '+type : '');
}
function updateThemeIcon(isLight) {
    document.querySelector('.icon-moon').classList.toggle('hidden', isLight);
    document.querySelector('.icon-sun').classList.toggle('hidden', !isLight);
}
function uUI(active) {
    const mc = g('mainCard');
    if (active) { mc.classList.add('on'); g('boostSub').innerText = t('boost_active'); g('boostBadge').innerText = '● AKTIF'; }
    else { mc.classList.remove('on'); g('boostSub').innerText = t('boost_standby'); g('boostBadge').innerText = 'STANDBY'; }
}
function showBannedScreen() {
    g('authView').classList.remove('active');
    g('mainView').classList.remove('active');
    g('bannedView').classList.add('active');
    applyLang();
}
function showMain(username) {
    if (!username.startsWith('@')) username = '@' + username;
    g('userName').innerText = username;
    g('userAvatar').innerText = username.replace('@','').charAt(0).toUpperCase();
    g('authView').classList.remove('active');
    g('mainView').classList.add('active');
    fetchRemoteConfig();
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab || !tab.url || !tab.url.includes('tiktok.com')) { uUI(false); return; }
        const onUpload = tab.url.includes('/upload') || tab.url.includes('/creator-center');
        if (!onUpload) { uUI(false); return; }
        chrome.scripting.executeScript(
            { target: { tabId: tab.id }, world: 'MAIN', func: () => window._pixora_active || false },
            (r) => { uUI(r && r[0] && r[0].result === true); }
        );
    });
}

// ── PREPARE VIDEO ──
function setStep(n, state) { const el = g('step'+n); el.classList.remove('active','done'); if(state) el.classList.add(state); }
function setStepStatus(n, txt) { g('step'+n+'Status').innerText = txt; }
function setProgress(p) { g('progressBar').style.width = p+'%'; }
function showResult(ok, text, sub) {
    const box = g('resultBox'); box.classList.add('visible');
    if (!ok) box.classList.add('err');
    g('resultIcon').innerText = ok ? '✅' : '❌';
    g('resultText').innerText = text; g('resultSub').innerText = sub;
}
async function processAndDownload(file) {
    if (!remoteConfig.feature_prepare) return;
    g('prepDrop').style.display = 'none';
    g('processPanel').classList.add('visible');
    g('resultBox').classList.remove('visible','err');
    g('fileName').innerText = file.name;
    g('fileSize').innerText = (file.size/(1024*1024)).toFixed(1)+' MB';
    [1,2,3,4].forEach(i => { setStep(i,''); setStepStatus(i, t('waiting')); });
    setProgress(0);

    // LITE MODE — download file as-is, skip elst modification
    if (prepMode === 'lite') {
        // Sembunyikan step 2 & 3 yang tidak relevan
        g('step2').style.display = 'none';
        g('step3').style.display = 'none';

        setStep(1,'active'); setStepStatus(1, t('reading')); setProgress(20);
        const ab = await file.arrayBuffer();
        await delay(400); setProgress(60); setStep(1,'done'); setStepStatus(1, t('done'));

        setStep(4,'active'); setStepStatus(4, t('saving')); setProgress(85);
        await delay(300);
        const blob = new Blob([ab],{type:file.type}), url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href=url; a.download=`${file.name.replace(/\.[^/.]+$/,'')}_lite.mp4`; a.click(); URL.revokeObjectURL(url);
        setProgress(100); setStep(4,'done'); setStepStatus(4, t('done'));
        showResult(true, t('result_ok'), 'Upload file _lite.mp4 ke TikTok');
        return;
    }

    // Tampilkan kembali step 2 & 3 untuk mode Normal
    g('step2').style.display = '';
    g('step3').style.display = '';
    try {
        setStep(1,'active'); setStepStatus(1, t('reading')); setProgress(10);
        const ab = await file.arrayBuffer();
        await delay(400); setProgress(25); setStep(1,'done'); setStepStatus(1, t('done'));
        setStep(2,'active'); setStepStatus(2, t('scanning')); setProgress(40);
        await delay(500);
        const u8=new Uint8Array(ab), dv=new DataView(ab), e=[0x65,0x6C,0x73,0x74];
        let idx=-1;
        for(let i=0;i<u8.length-4;i++){if(u8[i]===e[0]&&u8[i+1]===e[1]&&u8[i+2]===e[2]&&u8[i+3]===e[3]){idx=i;break;}}
        await delay(300);
        if(idx===-1){setStep(2,'done');setStepStatus(2,'—');setProgress(100);showResult(false,t('result_err_elst'),'');return;}
        setProgress(60); setStep(2,'done'); setStepStatus(2,`Offset: ${idx}`);
        setStep(3,'active'); setStepStatus(3, t('modifying')); setProgress(75);
        await delay(500); dv.setUint32(idx+8, ELST_PAYLOAD, false);
        await delay(200); setProgress(88); setStep(3,'done'); setStepStatus(3, t('done'));
        setStep(4,'active'); setStepStatus(4, t('saving')); setProgress(95);
        await delay(400);
        const blob=new Blob([ab],{type:file.type}), url=URL.createObjectURL(blob), a=document.createElement('a');
        a.href=url; a.download=`${file.name.replace(/\.[^/.]+$/,'')}_pixora.mp4`; a.click(); URL.revokeObjectURL(url);
        await delay(200); setProgress(100); setStep(4,'done'); setStepStatus(4, t('done'));
        showResult(true, t('result_ok'), t('result_ok_sub'));
    } catch(err) { showResult(false, 'Error', err.message); }
}

// ── DOWNLOAD ──
let dlData = null;
async function fetchTikTok(url) {
    if (!remoteConfig.feature_download) return;
    g('dlLoading').classList.remove('hidden');
    g('dlResult').classList.remove('visible');
    g('dlGoBtn').disabled = true;
    try {
        const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
        const json = await res.json();
        if (json.code === 0 && json.data) {
            dlData = json.data;
            g('dlCover').src = dlData.cover || '';
            g('dlAuthor').innerText = '@' + (dlData.author?.unique_id || dlData.author?.nickname || 'unknown');
            g('dlDesc').innerText = dlData.title || '';
            g('dlResult').classList.add('visible');
        } else { alert('Video not found.'); }
    } catch(e) { alert('Failed to fetch. Try again.'); }
    g('dlLoading').classList.add('hidden');
    g('dlGoBtn').disabled = false;
}

// ── FORCE UPDATE CHECK ──
const CURRENT_VERSION = '1.2.0';
async function checkForceUpdate() {
    try {
        const rows = await sbSelect('pixora_versions', `version=eq.${CURRENT_VERSION}&select=allowed`);
        // Kalau versi tidak ada di tabel, atau allowed = false → blokir
        if (!rows || rows.length === 0 || rows[0].allowed === false) {
            showUpdateScreen();
            return true;
        }
    } catch(e) {}
    return false;
}
function showUpdateScreen() {
    ['authView','mainView','bannedView'].forEach(id => g(id).classList.remove('active'));
    g('updateView').classList.add('active');
    g('updateTitle').innerText = t('update_title');
    g('updateMsg').innerText = t('update_msg');
    g('updateBtn').innerText = t('update_btn');
    g('updateVersionInfo').innerText = `v${CURRENT_VERSION}`;
}

// ── MAIN ──
document.addEventListener('DOMContentLoaded', () => {

    chrome.storage.local.get(['theme','color_theme','lang','session_user'], async (res) => {
        // Lang
        if (res.lang) currentLang = res.lang;
        // Color theme
        if (res.color_theme) {
            currentTheme = res.color_theme;
            document.body.className = currentTheme + (res.theme === 'light' ? ' light' : '');
        }
        // Light/dark
        if (res.theme === 'light') { document.body.classList.add('light'); updateThemeIcon(true); }
        // Apply lang
        applyLang();
        // Mark active swatch
        document.querySelectorAll('.color-swatch').forEach(s => {
            s.classList.toggle('active', s.dataset.theme === currentTheme);
        });
        // Check force update
        const needsUpdate = await checkForceUpdate();
        if (needsUpdate) return;
        // Session
        if (res.session_user) {
            const rows = await sbSelect('pixora_users', `username=eq.${encodeURIComponent(res.session_user)}&select=is_banned`);
            // User dihapus atau tidak ditemukan → logout otomatis
            if (!rows || rows.length === 0) {
                chrome.storage.local.remove(['session_user']);
                g('authView').classList.add('active');
                return;
            }
            if (rows[0].is_banned) {
                chrome.storage.local.remove(['session_user']); showBannedScreen(); return;
            }
            showMain(res.session_user);
            chrome.runtime.sendMessage({ action: 'ACTIVITY_PING', username: res.session_user });
        }
    });

    // Forgot password
    g('forgotLink').addEventListener('click', () => {
        g('authView').classList.remove('active');
        g('forgotView').classList.add('active');
        g('forgotUser').value = g('loginUser').value;
        g('hintResult').classList.add('hidden');
        g('forgotStep2').classList.add('hidden');
        setMsg('hintMsg', ''); setMsg('resetRequestMsg', '');
    });
    g('backToLoginLink').addEventListener('click', () => {
        g('forgotView').classList.remove('active');
        g('authView').classList.add('active');
    });
    g('checkHintBtn').addEventListener('click', async () => {
        let username = g('forgotUser').value.trim();
        if (!username.startsWith('@')) username = '@' + username;
        if (username.length < 2) { setMsg('hintMsg', t('err_fill'), 'err'); return; }
        g('checkHintBtn').disabled = true; g('checkHintBtn').innerText = '...';
        const rows = await sbSelect('pixora_users', `username=eq.${encodeURIComponent(username)}&select=password_hint`);
        g('checkHintBtn').disabled = false; g('checkHintBtn').innerText = 'Lihat Hint';
        if (!rows || rows.length === 0) { setMsg('hintMsg', t('err_wrong'), 'err'); return; }
        const hint = rows[0].password_hint;
        if (hint) {
            g('hintText').innerText = hint;
            g('hintResult').classList.remove('hidden');
            setMsg('hintMsg', '');
        } else {
            setMsg('hintMsg', 'Tidak ada hint tersedia.', 'err');
        }
        g('forgotStep2').classList.remove('hidden');
    });
    g('requestResetBtn').addEventListener('click', async () => {
        let username = g('forgotUser').value.trim();
        if (!username.startsWith('@')) username = '@' + username;
        g('requestResetBtn').disabled = true; g('requestResetBtn').innerText = '...';
        try {
            await fetch(`${SUPA_URL}/rest/v1/pixora_users?username=eq.${encodeURIComponent(username)}`, {
                method: 'PATCH',
                headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ reset_requested: true })
            });
            setMsg('resetRequestMsg', 'Request terkirim. Admin akan menghubungi kamu.', 'ok');
        } catch(e) {
            setMsg('resetRequestMsg', 'Gagal mengirim request.', 'err');
            g('requestResetBtn').disabled = false;
        }
        g('requestResetBtn').innerText = 'Minta Reset Password';
    });

    // Auth tabs
    g('tabLogin').addEventListener('click', () => switchTab('login'));
    g('tabRegister').addEventListener('click', () => switchTab('register'));

    // Connect TikTok
    g('connectTikTokBtn').addEventListener('click', () => {
        g('connectBtnText').innerText = '...';
        g('connectTikTokBtn').disabled = true;
        chrome.runtime.sendMessage({ action: 'GET_ACTIVE_TIKTOK_USER' }, (res) => {
            g('connectTikTokBtn').disabled = false;
            if (res && res.success && res.username) {
                connectedUsername = res.username;
                g('connectBtnText').innerText = `${connectedUsername} ✔`;
                g('connectTikTokBtn').classList.add('connected');
            } else {
                g('connectBtnText').innerText = t('connect_btn');
                setMsg('registerMsg', t('err_connect'), 'err');
            }
        });
    });

    // Register
    g('registerBtn').addEventListener('click', async () => {
        const username = connectedUsername, password = g('regPass').value.trim();
        if (!username) { setMsg('registerMsg', t('err_connect'), 'err'); return; }
        if (password.length < 4) { setMsg('registerMsg', 'Min. 4', 'err'); return; }
        const passConfirm = g('regPassConfirm') ? g('regPassConfirm').value.trim() : '';
        if (password !== passConfirm) {
            [g('regPass'), g('regPassConfirm')].forEach(el => { el.classList.add('err'); setTimeout(() => el.classList.remove('err'), 1000); });
            setMsg('registerMsg', t('err_pass_mismatch'), 'err'); return;
        }
        g('registerBtn').disabled = true; g('registerBtn').innerText = '...';
        const existing = await sbSelect('pixora_users', `username=eq.${encodeURIComponent(username)}`);
        if (existing && existing.length > 0) {
            setMsg('registerMsg', t('err_exists'), 'err');
            g('registerBtn').disabled = false; g('registerBtn').innerText = t('btn_register'); return;
        }
        const hint = g('regHint') ? g('regHint').value.trim() : '';
        const res = await sbInsert({ username, password: await hashPassword(password), password_hint: hint || null });
        g('registerBtn').disabled = false; g('registerBtn').innerText = t('btn_register');
        if (res.ok || res.status === 201) { setMsg('registerMsg', t('ok_registered'), 'ok'); setTimeout(() => switchTab('login'), 1500); }
        else { setMsg('registerMsg', t('err_register'), 'err'); }
    });

    // Login
    g('loginBtn').addEventListener('click', async () => {
        let username = g('loginUser').value.trim(), password = g('loginPass').value.trim();
        if (!username.startsWith('@')) username = '@' + username;
        if (username.length < 2 || !password) { setMsg('loginMsg', t('err_fill'), 'err'); return; }
        g('loginBtn').disabled = true; g('loginBtn').innerText = t('checking');
        const hashedPass = await hashPassword(password);
        const rows = await sbSelect('pixora_users', `username=eq.${encodeURIComponent(username)}&password=eq.${encodeURIComponent(hashedPass)}`);
        g('loginBtn').disabled = false; g('loginBtn').innerText = t('btn_signin');
        if (rows && rows.length > 0) {
            if (rows[0].is_banned) { setMsg('loginMsg', t('err_banned'), 'err'); return; }
            chrome.storage.local.set({ session_user: username }); showMain(username);
            chrome.runtime.sendMessage({ action: 'ACTIVITY_PING', username });
        } else {
            setMsg('loginMsg', t('err_wrong'), 'err');
            [g('loginUser'), g('loginPass')].forEach(el => { el.classList.add('err'); setTimeout(() => el.classList.remove('err'), 1000); });
        }
    });

    // Logout
    g('logoutBtn').addEventListener('click', () => {
        chrome.storage.local.remove(['session_user']);
        g('mainView').classList.remove('active'); g('authView').classList.add('active');
        g('loginUser').value = ''; g('loginPass').value = ''; connectedUsername = '';
        switchTab('login'); applyLang();
    });

    // Lang cycle
    g('langBtn').addEventListener('click', () => {
        currentLang = langs[(langs.indexOf(currentLang) + 1) % langs.length];
        chrome.storage.local.set({ lang: currentLang });
        applyLang();
    });

    // Theme light/dark
    g('themeBtn').addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light');
        chrome.storage.local.set({ theme: isLight ? 'light' : 'dark' });
        updateThemeIcon(isLight);
    });

    // Color picker toggle
    g('colorBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        g('colorPicker').classList.toggle('open');
    });
    document.addEventListener('click', () => g('colorPicker').classList.remove('open'));

    // Color swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            e.stopPropagation();
            const theme = swatch.dataset.theme;
            const isLight = document.body.classList.contains('light');
            document.body.className = theme + (isLight ? ' light' : '');
            currentTheme = theme;
            chrome.storage.local.set({ color_theme: theme });
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('active', s.dataset.theme === theme));
            g('colorPicker').classList.remove('open');
        });
    });

    // Nav tabs
    g('navPrepare').addEventListener('click', () => {
        g('navPrepare').classList.add('active'); g('navDownload').classList.remove('active');
        g('tabPrepare').classList.remove('hidden'); g('tabDownload').classList.add('hidden');
    });
    g('navDownload').addEventListener('click', () => {
        g('navDownload').classList.add('active'); g('navPrepare').classList.remove('active');
        g('tabDownload').classList.remove('hidden'); g('tabPrepare').classList.add('hidden');
    });

    // Prepare video mode selector
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            prepMode = btn.dataset.mode;
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Prepare video
    const prepDrop = g('prepDrop'), prepFileInput = g('prepFileInput');
    prepDrop.addEventListener('click', () => prepFileInput.click());
    prepDrop.addEventListener('dragover', (e) => { e.preventDefault(); prepDrop.classList.add('drag-over'); });
    prepDrop.addEventListener('dragleave', () => prepDrop.classList.remove('drag-over'));
    prepDrop.addEventListener('drop', (e) => { e.preventDefault(); prepDrop.classList.remove('drag-over'); const f=e.dataTransfer.files[0]; if(f) processAndDownload(f); });
    prepFileInput.addEventListener('change', (e) => { const f=e.target.files[0]; if(f) processAndDownload(f); });
    g('resetBtn').addEventListener('click', () => {
        g('processPanel').classList.remove('visible'); g('resultBox').classList.remove('visible','err');
        prepDrop.style.display = ''; prepFileInput.value = '';
        // Tampilkan kembali semua step
        ['step1','step2','step3','step4'].forEach(id => { g(id).style.display = ''; });
        setProgress(0); [1,2,3,4].forEach(i => { setStep(i,''); setStepStatus(i, t('waiting')); });
    });

    // Download
    g('dlGoBtn').addEventListener('click', () => {
        const url = g('dlInput').value.trim();
        if (!url.includes('tiktok.com')) { g('dlInput').style.borderColor='var(--red)'; setTimeout(()=>g('dlInput').style.borderColor='',1000); return; }
        fetchTikTok(url);
    });
    g('dlInput').addEventListener('keydown', (e) => { if(e.key==='Enter') g('dlGoBtn').click(); });
    g('dlVideoBtn').addEventListener('click', () => {
        if (!dlData) return;
        chrome.runtime.sendMessage({ action:'DOWNLOAD_FILE', url: dlData.hdplay||dlData.play, filename:`tiktok_${Date.now()}.mp4` });
    });
    g('dlAudioBtn').addEventListener('click', () => {
        if (!dlData) return;
        chrome.runtime.sendMessage({ action:'DOWNLOAD_FILE', url: dlData.music, filename:`tiktok_audio_${Date.now()}.mp3` });
    });
});
