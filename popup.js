
if (!document.getElementById('pixora-global-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'pixora-global-styles';

styleEl.textContent = `
    /* --- HATA TÄ°TREME ANÄ°MASYONU --- */
    @keyframes errorShake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-10px); }
        40%, 80% { transform: translateX(10px); }
    }

    /* Hata durumunda inputun alt Ã§izgisini ve gÃ¶lgesini kÄ±rmÄ±zÄ± yapar */
    .error-active {
        border-bottom-color: #FE2C55 !important;
        filter: drop-shadow(0 0 5px rgba(254, 44, 85, 0.5));
    }
    
    /* Sallanma efektini uygular */
    .shake-active {
        animation: errorShake 0.4s cubic-bezier(.36,.07,.19,.97) both;
    }

    /* DiÄŸer mevcut ban/overlay stilleri burada kalmaya devam etsin... */
    #pixora-ban-overlay { ... }
`;
    document.head.appendChild(styleEl);
}
let deviceID = null; 
function getSmartDeviceID() {
    return new Promise((resolve) => {
        let localID = localStorage.getItem('pixora_device_id');
        chrome.storage.local.get(['pixora_device_id'], function(localResult) {
            chrome.storage.sync.get(['pixora_device_id'], function(syncResult) {
                let finalID = syncResult.pixora_device_id || localResult.pixora_device_id || localID;

                if (finalID) {
                    if (!localID) localStorage.setItem('pixora_device_id', finalID);
                    if (!localResult.pixora_device_id) chrome.storage.local.set({ 'pixora_device_id': finalID });
                    if (!syncResult.pixora_device_id) chrome.storage.sync.set({ 'pixora_device_id': finalID });
                    
                    console.log("â™»ï¸ Mevcut ID Geri YÃ¼klendi:", finalID);
                    resolve(finalID);
                } else {
                    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
                    const newID = `K-${randomPart}`;
                    localStorage.setItem('pixora_device_id', newID);
                    chrome.storage.local.set({ 'pixora_device_id': newID });
                    chrome.storage.sync.set({ 'pixora_device_id': newID });
                    try { 
                        setTimeout(() => { 
                            chrome.runtime.sendMessage({ action: "SEND_LOG", type: "YENÄ° KURULUM", msg: `Yeni ID: ${newID}`, username: "Misafir" }); 
                        }, 2000); 
                    } catch(e){}
                    
                    console.log("âœ¨ Yeni ID oluÅŸturuldu:", newID);
                    resolve(newID);
                }
            });
        });
    });
}
const g = i => document.getElementById(i);

const cv = document.getElementById('particle-canvas');

if (cv) {
    const ctx = cv.getContext('2d');
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;

    let particles = [];
    

    let mouse = { x: null, y: null, radius: 100 };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });


    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    class Particle {
        constructor(x, y, dirX, dirY, size, color) {
            this.x = x;
            this.y = y;
            this.dirX = dirX;
            this.dirY = dirY;
            this.size = size;
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
  
            if (this.x > cv.width || this.x < 0) this.dirX = -this.dirX;
            if (this.y > cv.height || this.y < 0) this.dirY = -this.dirY;

            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);

            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < cv.width - this.size * 10) {
                    this.x += 2;
                }
                if (mouse.x > this.x && this.x > this.size * 10) {
                    this.x -= 2; 
                }
                if (mouse.y < this.y && this.y < cv.height - this.size * 10) {
                    this.y += 2;
                }
                if (mouse.y > this.y && this.y > this.size * 10) {
                    this.y -= 2;
                }
            }

            this.x += this.dirX;
            this.y += this.dirY;
            this.draw();
        }
    }

    function initParticles() {
        particles = [];
        let numberOfParticles = (cv.height * cv.width) / 6000; 
        
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let dirX = (Math.random() * 1) - 0.5; 
            let dirY = (Math.random() * 1) - 0.5;

            let color = Math.random() > 0.5 ? 'rgba(37, 244, 238, 0.8)' : 'rgba(254, 44, 85, 0.8)';
            
            particles.push(new Particle(x, y, dirX, dirY, size, color));
        }
    }

    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {

                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                             + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                

                if (distance < (cv.width/7) * (cv.height/7)) {
                    opacityValue = 1 - (distance / 10000);
                    ctx.strokeStyle = 'rgba(255, 255, 255,' + opacityValue * 0.15 + ')'; 
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }
        connect(); 
    }


    window.addEventListener('resize', () => {
        cv.width = innerWidth;
        cv.height = innerHeight;
        initParticles();
    });

    initParticles();
    animate();
}

(async function() {
    deviceID = await getSmartDeviceID();
    // --- BYPASS: Remote lock, ban, dan system status check dinonaktifkan ---
    const curtain = document.getElementById('security-curtain'); if(curtain) curtain.remove();
    const main = document.getElementById('mainView'); const login = document.getElementById('loginView');
    if(main) { main.style.opacity = '1'; main.style.pointerEvents = 'auto'; }
    if(login) { login.style.opacity = '1'; login.style.pointerEvents = 'auto'; }
})();

const lv = g('loginView'), mv = g('mainView'), sv = g('statsView'); 
const ui = g('usernameInput'), lb = g('loginBtn'), bts = g('btnTextSpan'); 
const udn = g('userDisplayName'), ua = g('userAvatar'), lob = g('logoutBtn');
const lab = g('langBtn'), themeBtn = g('themeBtn'), stb = g('statsBtn');
const bmb = g('backToMainBtn'), sa = g('statsAvatar'), su = g('statsUsername');
const translations={en:{status_off:"INACTIVE",status_on:"ACTIVE",feat1_title:"HD Boost",feat1_desc:"Sharper result",feat2_title:"Smart Upload",feat2_desc:"Less compression",feat3_title:"FPS Boost",feat3_desc:"Smooth playback",footer_made:"Made by @em.n.ef",footer_status:"ONLINE",btn_enter:"Sign In",remember:"Remember Me",btn_checking:"Checking...",stats_title:"Analytics",live_tag_static:"LIVE DATA",vid_prefix:"Video #",status_live:"Live",status_boost:"Boosting...",status_active:"Active",time_now:"Just now",time_min:"min ago",time_hour:"hrs ago",update_title:"UPDATE AVAILABLE",update_force:"MANDATORY UPDATE",update_desc:"ready to install.",best_time_title:"Best Upload Time",best_time_calc:"Calculating...",best_time_nodata:"Not enough data",best_time_avg:"Avg. ~",best_time_views:"views",dl_title:"Downloader",dl_input_ph:"Paste TikTok link",err_no_video_title:"NO VIDEOS FOUND",err_no_video_desc:"User might be private or has no content."},id:{status_off:"NONAKTIF",status_on:"AKTIF",feat1_title:"HD Boost",feat1_desc:"Hasil lebih tajam",feat2_title:"Upload Cerdas",feat2_desc:"Kompresi minimal",feat3_title:"FPS Boost",feat3_desc:"Playback mulus",footer_made:"Dibuat oleh @em.n.ef",footer_status:"ONLINE",btn_enter:"Masuk",remember:"Ingat Saya",btn_checking:"Memeriksa...",stats_title:"Analitik",live_tag_static:"DATA LANGSUNG",vid_prefix:"Video #",status_live:"Live",status_boost:"Memproses...",status_active:"Aktif",time_now:"Baru saja",time_min:"mnt lalu",time_hour:"jam lalu",update_title:"PEMBARUAN TERSEDIA",update_force:"PEMBARUAN WAJIB",update_desc:"siap diinstal.",best_time_title:"Waktu Upload Terbaik",best_time_calc:"Menghitung...",best_time_nodata:"Data tidak cukup",best_time_avg:"Rata ~",best_time_views:"tayangan",dl_title:"Pengunduh",dl_input_ph:"Tempel link TikTok",err_no_video_title:"VIDEO TIDAK DITEMUKAN",err_no_video_desc:"Akun mungkin privat atau belum ada video."}};
let currentAvatarUrl = null; // Yakalanan avatar linkini burada tutacaÄŸÄ±z
let currentLang = 'en';
let currentVideoData = []; 
let currentIsReal = false;
let currentSourceMode = "";

document.addEventListener('DOMContentLoaded', async () => {
    chrome.storage.local.get(['theme', 'lang'], function(result) {
    const idDisplay = document.getElementById('deviceIdDisplay');
    if(idDisplay && deviceID) {
        idDisplay.innerText = `ID: ${deviceID}`;
        idDisplay.addEventListener('click', () => {
            navigator.clipboard.writeText(deviceID);
            const originalText = idDisplay.innerText;
            idDisplay.innerText = "KOPYALANDI!";
            idDisplay.style.color = "#25F4EE";
            setTimeout(() => {
                idDisplay.innerText = originalText;
                idDisplay.style.color = "#444";
            }, 1000);
        });
    }
        const savedTheme = result.theme || 'dark';
        if (savedTheme === 'light') { document.body.classList.add('light'); updateThemeIcon(true); }
        currentLang = result.lang || 'en';
        sL(currentLang, false, false);
    });

    // Auto-login: cek saved session
    chrome.storage.local.get(['emef_username', 'emef_avatar'], function(session) {
        if (session.emef_username) {
            lv.style.display = 'none';
            mv.classList.remove('slide-right');
            uP(session.emef_username, session.emef_avatar || "");
        }
    });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if(tab && tab.url && tab.url.includes("tiktok.com")) {
        chrome.scripting.executeScript({ target: { tabId: tab.id }, world: "MAIN", args: [currentLang], func: (l) => { if(window.setBadgeLanguage) window.setBadgeLanguage(l, false); } });
       
        const onUploadPage = tab && tab.url && (tab.url.includes('/upload') || tab.url.includes('/creator-center'));

        chrome.scripting.executeScript({ target: { tabId: tab.id }, world: "MAIN", func: () => window._pixora_active || false }, (r) => {
        
        if (r && r[0] && r[0].result === true && onUploadPage) {
        g('toggleBtn').checked = true;
        uUI(true);
        } else {
       
        g('toggleBtn').checked = false;
        uUI(false);
        }
    });
    }
    
});

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light');
        const themeVal = isLight ? 'light' : 'dark';
        chrome.storage.local.set({theme: themeVal});
        updateThemeIcon(isLight);
        sendThemeToPage(isLight);
    });
}
function updateThemeIcon(isLight) {
    const moonIcon = document.querySelector('.icon-moon');
    const sunIcon = document.querySelector('.icon-sun');
    if (isLight) { moonIcon.classList.add('hidden'); sunIcon.classList.remove('hidden'); } 
    else { moonIcon.classList.remove('hidden'); sunIcon.classList.add('hidden'); }
}
function sendThemeToPage(isLight) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url.includes("tiktok.com")) {
            chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: (light) => { const badgeContent = document.querySelector('.k-content'); if (badgeContent) { if (light) badgeContent.classList.add('light-mode'); else badgeContent.classList.remove('light-mode'); } }, args: [isLight] });
        }
    });
}

function sL(l, stp = true, an = true) {
    const dS = () => {
        // fallback ke 'en' jika bahasa tidak ada di translations
        const lang = translations[l] ? l : 'en';
        currentLang = lang;
        chrome.storage.local.set({lang: lang});
        g('langBtn').innerText = lang.toUpperCase();
        const ic = g('toggleBtn') ? g('toggleBtn').checked : false;
        const t = translations[lang];
        document.querySelectorAll('[data-key]').forEach(el => {
            const k = el.getAttribute('data-key');
            if (k === 'status_off' || k === 'status_on') { uUI(ic); return; }
            if (t[k] !== undefined) el.innerText = t[k];
        });
        const c = g('videoList');
        if (c && !c.innerHTML.includes('svg') && currentVideoData.length > 0) rVL(c, currentVideoData, currentIsReal, currentSourceMode);
    };
    if (an) { document.body.classList.add('switching-lang'); setTimeout(() => { dS(); document.body.classList.remove('switching-lang'); }, 200); } else { dS(); }
    if (stp) { chrome.tabs.query({ active: true, currentWindow: true }, (ts) => { if(ts[0] && ts[0].url && ts[0].url.includes("tiktok.com")) { chrome.scripting.executeScript({ target: { tabId: ts[0].id }, world: "MAIN", args: [l, g('toggleBtn') ? g('toggleBtn').checked : false], func: (l, a) => { if(window.setBadgeLanguage) window.setBadgeLanguage(l, a); } }).catch(()=>{}); } }); }
}
lab.addEventListener('click', () => { if (currentLang === 'en') sL('id'); else sL('en'); });

function calculateBestTime(videos) {
    const timeRes = document.getElementById('bestTimeResult'); const viewRes = document.getElementById('bestTimeViews'); const t = translations[currentLang] || translations['en']; 
    if (!timeRes || !videos || videos.length === 0) { if(timeRes) timeRes.innerText = "-"; if(viewRes) viewRes.innerText = ""; return; }
    let hoursMap = {}; let validCount = 0;
    videos.forEach(v => {
        if (!v.create_time) return; 
        validCount++; let date = new Date(v.create_time * 1000); let hour = date.getHours();
        if (!hoursMap[hour]) hoursMap[hour] = { totalViews: 0, count: 0 };
        let rawViews = v.views;
        if (typeof rawViews === 'string') { if (rawViews.includes('M')) rawViews = parseFloat(rawViews) * 1000000; else if (rawViews.includes('K')) rawViews = parseFloat(rawViews) * 1000; else rawViews = parseInt(rawViews); }
        hoursMap[hour].totalViews += rawViews; hoursMap[hour].count++;
    });
    if (validCount === 0) { timeRes.innerText = t.best_time_nodata; viewRes.innerText = ""; return; }
    let bestHour = -1; let maxAvgViews = 0;
    for (let h in hoursMap) { let avg = hoursMap[h].totalViews / hoursMap[h].count; if (avg > maxAvgViews) { maxAvgViews = avg; bestHour = h; } }
    if (bestHour !== -1) {
        let nextHour = (parseInt(bestHour) + 1) % 24; timeRes.innerText = `${bestHour.toString().padStart(2, '0')}:00 - ${nextHour.toString().padStart(2, '0')}:00`;
        let displayAvg = fN(Math.floor(maxAvgViews)); viewRes.innerText = `${t.best_time_avg}${displayAvg} ${t.best_time_views}`;
    }
}

// cIS removed - .input-wrapper tidak ada di HTML baru

const showRegisterBtn = document.getElementById('showRegisterBtn');
const showLoginBtn = document.getElementById('showLoginBtn');
const loginFormArea = document.getElementById('loginFormArea');
const registerFormArea = document.getElementById('registerFormArea');

if (showRegisterBtn && showLoginBtn) {
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormArea.style.display = 'none';
        registerFormArea.style.display = 'block';
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerFormArea.style.display = 'none';
        loginFormArea.style.display = 'block';
    });
}

// --- FORGOT PASSWORD ---
function maskPassword(pass) {
    const len = pass.length;
    if (len <= 1) return pass;
    if (len <= 8) {
        // 1 depan, 1 belakang
        return pass[0] + '*'.repeat(len - 2) + pass[len - 1];
    } else {
        // 2 depan, 2 belakang
        return pass.slice(0, 2) + '*'.repeat(len - 4) + pass.slice(-2);
    }
}

const showForgotBtn = document.getElementById('showForgotBtn');
const backToLoginBtn = document.getElementById('backToLoginBtn');
const forgotArea = document.getElementById('forgotArea');
const forgotCheckBtn = document.getElementById('forgotCheckBtn');

if (showForgotBtn) {
    showForgotBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormArea.style.display = 'none';
        forgotArea.style.display = 'block';
        document.getElementById('forgotResult').style.display = 'none';
        document.getElementById('forgotError').style.display = 'none';
        document.getElementById('forgotUsernameInput').value = '';
    });
}

if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        forgotArea.style.display = 'none';
        loginFormArea.style.display = 'block';
    });
}

if (forgotCheckBtn) {
    forgotCheckBtn.addEventListener('click', () => {
        let username = document.getElementById('forgotUsernameInput').value.trim();
        if (!username.startsWith('@')) username = '@' + username;
        const resultEl = document.getElementById('forgotResult');
        const errorEl = document.getElementById('forgotError');
        const hintEl = document.getElementById('forgotHintText');

        chrome.storage.local.get(['pixora_accounts'], (res) => {
            const accounts = res.pixora_accounts || {};
            const account = accounts[username];
            if (account) {
                hintEl.innerText = maskPassword(account.password);
                resultEl.style.display = 'block';
                errorEl.style.display = 'none';
            } else {
                resultEl.style.display = 'none';
                errorEl.style.display = 'block';
            }
        });
    });
}

// modern-input listeners removed - class tidak ada di HTML baru


document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['pixora_fetched_username'], (res) => {
        if (res.pixora_fetched_username) {
            document.getElementById('usernameInput').value = res.pixora_fetched_username;
            
            if (loginFormArea && registerFormArea) {
                loginFormArea.style.display = 'none';
                registerFormArea.style.display = 'block';
            }

            const fetchBtnText = document.getElementById('fetchBtnText');
            const fetchBtn = document.getElementById('fetchUserBtn');
            if (fetchBtnText && fetchBtn) {
                fetchBtn.style.background = "rgba(37, 244, 238, 0.2)";
                fetchBtn.style.boxShadow = "0 0 15px rgba(37, 244, 238, 0.4)";
                fetchBtnText.innerText = `${res.pixora_fetched_username} Connected ✔`;
            }
        }
    });
});


const fetchUserBtn = document.getElementById('fetchUserBtn');
if (fetchUserBtn) {
    fetchUserBtn.addEventListener('click', () => {
        const fetchBtnText = document.getElementById('fetchBtnText');
        if (fetchBtnText) fetchBtnText.innerText = "Connecting...";
        fetchUserBtn.disabled = true;

        chrome.runtime.sendMessage({ action: "GET_ACTIVE_TIKTOK_USER" }, (response) => {
    if (response && response.success && response.username) {
        const detectedUser = response.username;
        document.getElementById('usernameInput').value = detectedUser;


        chrome.runtime.sendMessage({ action: "FETCH_AVATAR", username: detectedUser }, (avatarRes) => {
            fetchUserBtn.disabled = false;
            if (avatarRes && avatarRes.success) {

                currentAvatarUrl = avatarRes.avatar;
                chrome.storage.local.set({ 'pixora_temp_avatar': avatarRes.avatar }); 

                fetchBtnText.innerText = `${detectedUser} Connected ✔`;
                fetchUserBtn.style.background = "rgba(37, 244, 238, 0.2)";
                fetchUserBtn.style.boxShadow = "0 0 15px rgba(37, 244, 238, 0.4)";
            } else {
                fetchBtnText.innerText = `${detectedUser} Connected ✔`;
            }
                });
            } else {
                fetchUserBtn.disabled = false;
                alert("Log in to TikTok on the active tab and try again.");
            }
        });
    });
}

const registerBtn = document.getElementById('registerBtn');

if (registerBtn) {
    registerBtn.addEventListener('click', () => {

        chrome.storage.local.get(['pixora_temp_avatar'], (storageRes) => {
            const finalAvatar = storageRes.pixora_temp_avatar || null;

            const fetchBtn = document.getElementById('fetchUserBtn'); 
            const usernameInp = document.getElementById('usernameInput'); 
            const passwordInp = document.getElementById('passwordInput');
            const regArea = document.getElementById('registerFormArea');
            const logArea = document.getElementById('loginFormArea');
            
            const btnSpan = registerBtn.querySelector('.btn-text');
            const originalBtnText = btnSpan ? btnSpan.innerText : "Create Account";

            let fetchedUser = usernameInp ? usernameInp.value.trim() : "";
            let pass = passwordInp ? passwordInp.value.trim() : "";

            if (!fetchedUser || fetchedUser === "" || fetchedUser === "NOT FOUND") {
                if (fetchBtn) {
                    fetchBtn.classList.add('error-shake');
                    fetchBtn.style.borderColor = '#FE2C55';
                    fetchBtn.style.boxShadow = '0 0 15px rgba(254, 44, 85, 0.4)';
                    
                    setTimeout(() => {
                        fetchBtn.classList.remove('error-shake');
                        fetchBtn.style.borderColor = 'var(--primary)';
                        fetchBtn.style.boxShadow = 'none';
                    }, 1000);
                }
                return; 
            }

            if (pass.length < 2) {
                if (passwordInp) {
                    passwordInp.classList.add('error-shake', 'error-input');
                    setTimeout(() => {
                        passwordInp.classList.remove('error-shake', 'error-input');
                    }, 1000);
                }
                return;
            }

            if (btnSpan) btnSpan.innerText = "CREATING...";
            registerBtn.disabled = true;

            // LOCAL AUTH: simpan ke chrome.storage.local, tidak perlu server
            chrome.storage.local.get(['pixora_accounts'], (res) => {
                const accounts = res.pixora_accounts || {};
                if (accounts[fetchedUser]) {
                    registerBtn.disabled = false;
                    if (btnSpan) btnSpan.innerText = originalBtnText;
                    if (typeof showDuplicateAccountScreen === "function") {
                        showDuplicateAccountScreen(fetchedUser, "Account already exists.");
                    }
                    return;
                }
                accounts[fetchedUser] = { password: pass, avatar: finalAvatar || "" };
                chrome.storage.local.set({ pixora_accounts: accounts }, () => {
                    registerBtn.disabled = false;
                    if (btnSpan) btnSpan.innerText = originalBtnText;

                    document.getElementById('registerFormArea').style.display = 'none';
                    const successArea = document.getElementById('successArea');
                    successArea.style.display = 'block';
                    passwordInp.value = "";
                    chrome.storage.local.remove(['pixora_fetched_username', 'pixora_temp_avatar']);
                    document.getElementById('successToLoginBtn').onclick = () => {
                        successArea.style.display = 'none';
                        document.getElementById('loginFormArea').style.display = 'block';
                    };
                });
            });
        });
    });
}

const loginBtnNew = document.getElementById('loginBtn');
if (loginBtnNew) {
    loginBtnNew.addEventListener('click', () => {
        const userInp = document.getElementById('loginUsernameInput');
        const passInp = document.getElementById('loginPasswordInput');
        let n = userInp.value.trim();
        let pass = passInp.value.trim();

        const triggerHataUI = () => {
            const userInp = document.getElementById('loginUsernameInput');
            const passInp = document.getElementById('loginPasswordInput');
            userInp.classList.add('err', 'shake');
            passInp.classList.add('err');
            setTimeout(() => {
                userInp.classList.remove('err', 'shake');
                passInp.classList.remove('err');
            }, 1000);
        };


        if (n.length < 2 || pass.length < 2) {
            triggerHataUI();
            return;
        }
        
        if (!n.startsWith('@')) n = '@' + n;
        
        const t = translations[currentLang];
        loginBtnNew.disabled = true;
        if (document.getElementById('btnTextSpan')) document.getElementById('btnTextSpan').innerText = t.btn_checking || "CHECKING...";

        // LOCAL AUTH: cek dari chrome.storage.local
        chrome.storage.local.get(['pixora_accounts'], (res) => {
            loginBtnNew.disabled = false;
            if (document.getElementById('btnTextSpan')) document.getElementById('btnTextSpan').innerText = t.btn_enter || "LOG IN";

            const accounts = res.pixora_accounts || {};
            const account = accounts[n];

            if (account && account.password === pass) {
                chrome.storage.local.set({ emef_username: n, emef_avatar: account.avatar || "" });
                uP(n, account.avatar || "");
                document.getElementById('loginView').classList.add('slide-left');
                setTimeout(() => { document.getElementById('mainView').classList.remove('slide-right'); }, 300);
            } else {
                triggerHataUI();
            }
        });
    });
}

lob.addEventListener('click', () => {
    chrome.storage.local.remove(['emef_username', 'emef_avatar', 'pixora_fetched_username']);


    const fetchBtnText = document.getElementById('fetchBtnText');
    const fetchBtn = document.getElementById('fetchUserBtn');
    const hiddenInput = document.getElementById('usernameInput');
    
    if (fetchBtnText && fetchBtn) {
        fetchBtn.style.background = "rgba(37, 244, 238, 0.05)"; 
        fetchBtn.style.boxShadow = "none"; 
        fetchBtnText.innerText = "Connect TikTok Account"; 
    }
    if (hiddenInput) hiddenInput.value = "";

    const inputsToClear = ['loginUsernameInput', 'loginPasswordInput', 'passwordInput'];
    inputsToClear.forEach(id => {
        const inputEl = document.getElementById(id);
        if (inputEl) inputEl.value = "";
    });

    mv.classList.add('slide-right');
    setTimeout(() => {
        lv.style.display = 'flex';
        document.getElementById('registerFormArea').style.display = 'none';
        document.getElementById('loginFormArea').style.display = 'block';
        setTimeout(() => lv.classList.remove('slide-left'), 50);
    }, 300);
});

function uP(n, a) {
    if (!n.startsWith('@')) n = '@' + n;
    udn.innerText = n;
    su.innerText = n;
    const letter = n.replace('@', '').charAt(0).toUpperCase();
    if (a && a !== "undefined" && a !== "null") {
        const s = `url('${a}') center center / cover no-repeat`;
        ua.innerText = ""; ua.style.background = s;
        sa.innerText = ""; sa.style.background = s;
    } else {
        ua.style.background = "linear-gradient(135deg,#6366f1,#8b5cf6)"; ua.innerText = letter;
        sa.style.background = "linear-gradient(135deg,#6366f1,#8b5cf6)"; sa.innerText = letter;
    }
}

stb.addEventListener('click', () => {
    mv.classList.add('slide-left');
    sv.style.display = 'flex';
    const container = g('videoList');
    sBF(container);
    setTimeout(() => { sv.classList.remove('slide-right') }, 50);
});bmb.addEventListener('click',()=>{sv.classList.add('slide-right');setTimeout(()=>{sv.style.display='none';mv.classList.remove('slide-left')},300)});

function sBF(c){
    chrome.storage.local.get(['emef_username'], function(session) {
        let r = session.emef_username || 'pixora';
        if(r.startsWith('@')) r = r.substring(1);

        const t = translations[currentLang];
        c.innerHTML = `<div style="text-align:center; padding:20px; color:var(--muted); font-size:12px;">${t.best_time_calc}</div>`;
        document.getElementById('bestTimeResult').innerText = t.best_time_calc;
        document.getElementById('bestTimeViews').innerText = "";

        chrome.runtime.sendMessage({action:"FETCH_TIKTOK_DATA", username:r}, (x) => {
            if(chrome.runtime.lastError || !x || !x.success || !x.data || x.data.length === 0){
                c.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px 20px;text-align:center;opacity:0.6;">
                    <svg viewBox="0 0 24 24" style="width:36px;fill:var(--muted);margin-bottom:12px;"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <div style="font-weight:700;font-size:14px;color:var(--text);">${t.err_no_video_title}</div>
                    <div style="font-size:11px;color:var(--muted);margin-top:4px;">${t.err_no_video_desc}</div>
                </div>`;
                document.getElementById('bestTimeResult').innerText = "-";
                return;
            }
            let cl = x.data.filter(i => parseInt(i.views) > 0);
            currentVideoData = cl.slice(0, 10).map(i => ({
                views: fN(i.views), title: i.title, cover: i.cover,
                playUrl: i.playUrl, musicUrl: i.musicUrl,
                engagement: cE(i.views, i.likes, i.comments, i.shares),
                isReal: true, create_time: i.create_time
            }));
            rVL(c, currentVideoData, true, "LIVE SYNC");
        });
    });
}

function cE(v,l,c,s){if(!v||v==0)return"0.0%";const t=parseInt(l||0)+parseInt(c||0)+parseInt(s||0);return((t/parseInt(v))*100).toFixed(1)+"%"}
function tT(t,m){if(!t)return"";if(t.length<=m)return t;return t.substring(0,m)+"..."}

function rVL(c,d,ir,sm){
    c.innerHTML=''; const t=translations[currentLang];
    d.forEach((v,i)=>{
        const el=document.createElement('div'); el.className='vid-card';
        let dt="",st="",ts="",eh="",bh="";
        if(ir){
            if(v.title&&v.title.trim()!=="")dt=tT(v.title,20);else dt=`${t.vid_prefix}${i+1}`;
            st=t.status_live; if(v.cover)ts=`background: url('${v.cover}') center/cover no-repeat;`;else ts=`background: #333;`;
            eh=`<div class="engagement-badge" title="EtkileÅŸim OranÄ±">ðŸ”¥ ${v.engagement}</div>`;
            
        }
        const vc=v.views,vcl=ir?'#2ecc71':'#fff';
        el.innerHTML=`<div class="vid-left"><div style="display:flex; gap:10px; align-items:center;"><div class="vid-thumb" style="${ts}"></div><div class="vid-meta"><div class="vid-title" title="${ir?v.title:''}">${dt}</div>${eh}<div class="vid-stat" style="${ir?'color:var(--accent);':''}">${st}</div></div></div></div><div class="vid-right-group"><div class="vid-views">${vc}</div>${bh}</div>`;
        c.appendChild(el)
    });
    document.querySelectorAll('.video-dl').forEach(b=>{b.addEventListener('click',()=>dM(b.dataset.link,b.dataset.name))});
    document.querySelectorAll('.music-dl').forEach(b=>{b.addEventListener('click',()=>dM(b.dataset.link,b.dataset.name))});
    if(ir) { setTimeout(() => calculateBestTime(d), 100); }
}


const toggleBtn = g('toggleBtn');

toggleBtn.addEventListener('click', async (e) => {

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isUploadPage = tab && tab.url && (tab.url.includes('/upload') || tab.url.includes('/creator-center'));
    

    if (e.target.checked && !isUploadPage) {
        e.preventDefault(); 
        e.target.checked = false; 
        showWrongPageWarning(); 
        return; 
    }


    const ic = e.target.checked;
    uUI(ic); 

    if (tab && tab.url.includes("tiktok.com")) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            world: "MAIN",
            args: [currentLang, ic],
            func: (l, a) => { if (window.setBadgeLanguage) window.setBadgeLanguage(l, a) }
        });

        const actionFunc = ic ? 
            () => window.activate60FPS ? window.activate60FPS() : null : 
            () => window.reset60FPS ? window.reset60FPS() : null;

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            world: "MAIN",
            func: actionFunc
        });
    }
});

function showWrongPageWarning() {
    const statusText = g('statusText');
    const mainCard = g('mainCard');
    const warnings = { en: "UPLOAD PAGE ONLY!", tr: "SADECE YÃœKLEME EKRANI!", ru: "Ð¢ÐžÐ›Ð¬ÐšÐž Ð—ÐÐ“Ð Ð£Ð—ÐšÐ!" };
    statusText.innerText = warnings[currentLang] || warnings['en'];
    statusText.style.color = "var(--red)";
    mainCard.style.borderColor = "var(--red)";
    mainCard.classList.add('shake');
    setTimeout(() => {
        if (!toggleBtn.checked) {
            statusText.innerText = translations[currentLang]['status_off'];
            statusText.style.color = "var(--muted)";
            mainCard.style.borderColor = "";
        }
        mainCard.classList.remove('shake');
    }, 1500);
}function dM(u,f){if(!u||u==="undefined"){alert("Link bulunamadÄ±!");return}chrome.runtime.sendMessage({action:"DOWNLOAD_MEDIA",url:u,filename:f})}
function fN(n){n=parseInt(n);if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toString()}

function uUI(a){
    const st=g('statusText'), mc=g('mainCard');
    const tk=a?'status_on':'status_off';
    if(translations[currentLang]) st.innerText=translations[currentLang][tk];
    if(a){ st.style.color='var(--accent)'; mc.classList.add('on'); }
    else { st.style.color='var(--muted)'; mc.classList.remove('on'); }
}
// UPDATE CHECK: dinonaktifkan
function cU(){} function iNV(){return false;}

const dlPageBtn = g('dlPageBtn'), dlView = g('dlView'), backDl = g('backFromDl'), dlInput = g('dlUrlInput'), analyzeBtn = g('analyzeBtn'), dlResult = g('dlResultArea');
if(dlPageBtn) { dlPageBtn.addEventListener('click', () => { mv.classList.add('slide-left'); dlView.style.display = 'flex'; setTimeout(() => dlView.classList.remove('slide-right'), 50); }); }
if(backDl) { backDl.addEventListener('click', () => { dlView.classList.add('slide-right'); setTimeout(() => { dlView.style.display = 'none'; mv.classList.remove('slide-left'); dlResult.classList.add('hidden'); dlInput.value = ''; }, 300); }); }

// ── PREPARE VIDEO (elst atom injection) ──
const ELST_PAYLOAD = 268435457; // 0x10000001 dari kuronai-auth.hrmsalih.workers.dev/get_bypass_config

const prepDrop = g('prepDrop');
const prepFileInput = g('prepFileInput');
const prepStatus = g('prepStatus');

function setStatus(msg, type = '') {
    if (!prepStatus) return;
    prepStatus.innerText = msg;
    prepStatus.className = 'prep-status' + (type ? ' ' + type : '');
}

async function processAndDownload(file) {
    setStatus('Memproses...');
    try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const dataView = new DataView(arrayBuffer);
        const elst = [0x65, 0x6C, 0x73, 0x74];

        let idx = -1;
        for (let i = 0; i < uint8.length - 4; i++) {
            if (uint8[i] === elst[0] && uint8[i+1] === elst[1] && uint8[i+2] === elst[2] && uint8[i+3] === elst[3]) {
                idx = i; break;
            }
        }

        if (idx === -1) {
            setStatus('elst atom tidak ditemukan. Coba video MP4 lain.', 'err');
            return;
        }

        dataView.setUint32(idx + 8, ELST_PAYLOAD, false);
        const blob = new Blob([arrayBuffer], { type: file.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const name = file.name.replace(/\.[^/.]+$/, '');
        a.href = url;
        a.download = `${name}_pixora.mp4`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus('✔ File siap! Upload file _pixora.mp4 ke TikTok.', 'ok');
    } catch(e) {
        setStatus('Error: ' + e.message, 'err');
    }
}

if (prepDrop && prepFileInput) {
    prepDrop.addEventListener('click', () => prepFileInput.click());
    prepDrop.addEventListener('dragover', (e) => { e.preventDefault(); prepDrop.style.borderColor = 'var(--accent)'; });
    prepDrop.addEventListener('dragleave', () => { prepDrop.style.borderColor = ''; });
    prepDrop.addEventListener('drop', (e) => {
        e.preventDefault();
        prepDrop.style.borderColor = '';
        const file = e.dataTransfer.files[0];
        if (file) processAndDownload(file);
    });
    prepFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) processAndDownload(file);
    });
}

// ── BITRATE CALCULATOR ──
const calcBtn = g('calcBtn');
if (calcBtn) {
    calcBtn.addEventListener('click', () => {
        const sec = parseInt(g('calcDuration').value);
        if (!sec || sec < 1) { g('calcDuration').style.borderColor = 'var(--red)'; setTimeout(() => g('calcDuration').style.borderColor = '', 1000); return; }
        // TikTok optimal: 1080p ~8Mbps untuk ≤30s, ~6Mbps untuk >30s, ~4Mbps untuk >60s
        let bps;
        if (sec <= 30) bps = 8000;
        else if (sec <= 60) bps = 6000;
        else if (sec <= 180) bps = 4000;
        else bps = 2500;
        const sizeMB = ((bps * 1000 * sec) / 8 / 1024 / 1024).toFixed(1);
        g('calcBitrate').innerText = bps >= 1000 ? `${(bps/1000).toFixed(0)} Mbps` : `${bps} Kbps`;
        g('calcSize').innerText = sizeMB >= 1024 ? `${(sizeMB/1024).toFixed(1)} GB` : `${sizeMB} MB`;
        g('calcResult').classList.add('show');
    });
}

// ── STATS TABS ──
const tabAnalytics = g('tabAnalytics'), tabHistory = g('tabHistory');
const analyticsPanel = g('analyticsPanel'), historyPanel = g('historyPanel');

if (tabAnalytics && tabHistory) {
    tabAnalytics.addEventListener('click', () => {
        tabAnalytics.classList.add('active'); tabHistory.classList.remove('active');
        analyticsPanel.style.display = 'flex'; historyPanel.style.display = 'none';
    });
    tabHistory.addEventListener('click', () => {
        tabHistory.classList.add('active'); tabAnalytics.classList.remove('active');
        analyticsPanel.style.display = 'none'; historyPanel.style.display = 'block';
        renderHistory();
    });
}

// ── UPLOAD HISTORY ──
function addToHistory(title) {
    chrome.storage.local.get(['pixora_history'], (res) => {
        const hist = res.pixora_history || [];
        hist.unshift({ title: title || 'Untitled', date: Date.now() });
        if (hist.length > 50) hist.pop(); // max 50 entri
        chrome.storage.local.set({ pixora_history: hist });
    });
}

function renderHistory() {
    const list = g('historyList');
    if (!list) return;
    chrome.storage.local.get(['pixora_history'], (res) => {
        const hist = res.pixora_history || [];
        if (hist.length === 0) {
            list.innerHTML = `<div class="hist-empty">No upload history yet.<br>History is recorded automatically when you upload on TikTok.</div>`;
            return;
        }
        list.innerHTML = hist.map((item, i) => {
            const d = new Date(item.date);
            const dateStr = `${d.toLocaleDateString()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
            return `<div class="hist-card">
                <div class="hist-icon"><svg viewBox="0 0 24 24"><path d="M4 15v3h16v-3H4zm2-5h3V2h6v8h3L12 16 6 10z"/></svg></div>
                <div class="hist-meta">
                    <div class="hist-title">${item.title}</div>
                    <div class="hist-date">${dateStr}</div>
                </div>
                <button class="hist-del" data-idx="${i}" title="Delete">
                    <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
            </div>`;
        }).join('');
        list.querySelectorAll('.hist-del').forEach(btn => {
            btn.addEventListener('click', () => {
                chrome.storage.local.get(['pixora_history'], (res) => {
                    const h = res.pixora_history || [];
                    h.splice(parseInt(btn.dataset.idx), 1);
                    chrome.storage.local.set({ pixora_history: h }, renderHistory);
                });
            });
        });
    });
}
if(analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
        const url = dlInput.value.trim();
        if(url.length < 10 || !url.includes('tiktok.com')) { const group = dlInput.parentElement.parentElement; group.style.borderColor = '#FE2C55'; group.classList.add('shake-animation'); setTimeout(() => { group.style.borderColor = 'rgba(255,255,255,0.1)'; group.classList.remove('shake-animation'); }, 1000); return; }
        const originalContent = analyzeBtn.innerHTML; analyzeBtn.innerHTML = "â³"; analyzeBtn.disabled = true;
        chrome.runtime.sendMessage({action: "ANALYZE_SINGLE_VIDEO", url: url}, (response) => {
            analyzeBtn.disabled = false; analyzeBtn.innerHTML = originalContent;
            if(response && response.success) {
                const d = response.data;
                if(d.cover) g('dlCover').style.backgroundImage = `url('${d.cover}')`;
                if(d.author) g('dlAuthor').innerText = '@' + d.author;
                const titleText = d.title ? (d.title.length > 80 ? d.title.substring(0, 80) + '...' : d.title) : 'BaÅŸlÄ±ksÄ±z';
                g('dlDesc').innerText = titleText;
                g('dlStatsViews').innerText = fN(d.views || 0); 
                g('dlStatsLikes').innerText = fN(d.likes || 0);
                const vidBtnOld = g('dlVideoBtn');
                const hdBtnOld = g('dlHDBtn'); 
                const musBtnOld = g('dlMusicBtn');
                const newVidBtn = vidBtnOld.cloneNode(true);
                const newHDBtn = hdBtnOld.cloneNode(true);
                const newMusicBtn = musBtnOld.cloneNode(true);
                vidBtnOld.parentNode.replaceChild(newVidBtn, vidBtnOld);
                hdBtnOld.parentNode.replaceChild(newHDBtn, hdBtnOld);
                musBtnOld.parentNode.replaceChild(newMusicBtn, musBtnOld);
                newVidBtn.addEventListener('click', () => dM(d.playUrl, `tiktok_std_${Date.now()}.mp4`));
                newMusicBtn.addEventListener('click', () => dM(d.musicUrl, `tiktok_audio_${Date.now()}.mp3`));
                newHDBtn.addEventListener('click', () => {
                    const originalHTML = newHDBtn.innerHTML;
                    newHDBtn.innerHTML = `<svg viewBox="0 0 24 24" style="animation:spin 1s infinite;"><path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/></svg>`;
                    newHDBtn.disabled = true;
                    const targetUrl = g('dlUrlInput').value.trim();
                    chrome.runtime.sendMessage({ action: "FETCH_HD_VIDEO", url: targetUrl }, (hdRes) => {
                        newHDBtn.innerHTML = originalHTML;
                        newHDBtn.disabled = false;

                        if (hdRes && hdRes.success && hdRes.data && hdRes.data.playUrl) {
                            console.log("ðŸ”¥ HD Link Ä°ndiriliyor:", hdRes.data.playUrl);
                            dM(hdRes.data.playUrl, `tiktok_HD_${Date.now()}.mp4`);
                        } else {
                            alert("HD Link BulunamadÄ± veya Zaman AÅŸÄ±mÄ±.");
                        }
                    });
                });
                
                dlResult.classList.remove('hidden');
            } else { analyzeBtn.style.backgroundColor = '#FE2C55'; setTimeout(() => { analyzeBtn.style.backgroundColor = ''; }, 1000); }
        });
    });
}

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;


function initAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playCyberSound(type) {
    initAudio();
    const now = audioCtx.currentTime;
    

    const masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    masterGain.gain.value = 0.3; 

    if (type === 'hover') {

        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(masterGain);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.03); 
        
        gain1.gain.setValueAtTime(0.05, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        
        osc1.start(now);
        osc1.stop(now + 0.03);


        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(masterGain);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1210, now); 
        
        gain2.gain.setValueAtTime(0.02, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc2.start(now);
        osc2.stop(now + 0.05);

    } else if (type === 'click') {

        const oscLow = audioCtx.createOscillator();
        const gainLow = audioCtx.createGain();
        oscLow.connect(gainLow);
        gainLow.connect(masterGain);

        oscLow.type = 'triangle';
        oscLow.frequency.setValueAtTime(150, now);
        oscLow.frequency.exponentialRampToValueAtTime(40, now + 0.1); 
        
        gainLow.gain.setValueAtTime(0.2, now);
        gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        oscLow.start(now);
        oscLow.stop(now + 0.1);

        const oscHigh = audioCtx.createOscillator();
        const gainHigh = audioCtx.createGain();
        oscHigh.connect(gainHigh);
        gainHigh.connect(masterGain);

        oscHigh.type = 'square';
        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 2000;
        oscHigh.connect(filter);
        filter.connect(gainHigh);

        oscHigh.frequency.setValueAtTime(800, now);
        gainHigh.gain.setValueAtTime(0.05, now);
        gainHigh.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        oscHigh.start(now);
        oscHigh.stop(now + 0.05);
        
    } else if (type === 'success') {

        [440, 554, 659].forEach((freq, i) => { 
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(masterGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + (i * 0.05)); 
            
            gain.gain.setValueAtTime(0.05, now + (i * 0.05));
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            
            osc.start(now);
            osc.stop(now + 0.4);
        });
    } else if (type === 'error') {

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(masterGain);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const hoverElements = document.querySelectorAll('button, .cyber-btn, .update-card, .social-btn');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => playCyberSound('hover'));
    });


    const clickElements = document.querySelectorAll('button, a, input, .card, .icon-btn, .lang-btn, .theme-btn');
    clickElements.forEach(el => {
        el.addEventListener('mousedown', () => playCyberSound('click'));
    });


    const loginBtn = document.getElementById('loginBtn');
    if(loginBtn) {
        loginBtn.addEventListener('click', () => {

            setTimeout(() => playCyberSound('success'), 400); 
        });
    }
});


document.addEventListener('DOMContentLoaded', () => {

    const cards = document.querySelectorAll('.card, .glass-card, .update-card');

    cards.forEach(card => {

        card.style.transition = 'transform 0.1s ease, box-shadow 0.2s ease';
        card.style.transformStyle = 'preserve-3d';
        card.style.perspective = '1000px';

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / 10) * -1; 
            const rotateY = (x - centerX) / 10;        

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

            const shadowX = (x - centerX) / 5;
            const shadowY = (y - centerY) / 5;
            card.style.boxShadow = `${shadowX}px ${shadowY}px 20px rgba(0,0,0,0.3)`;
        });


        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease'; 
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            card.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)'; 
        });
    });
});


const spotlightStyle = document.createElement('style');
spotlightStyle.innerHTML = `

    .card::after, .login-card::after, .glass-card::after, .social-btn::after {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border-radius: inherit;

        opacity: 0;
        transition: opacity 0.5s ease;
        z-index: 1;
        pointer-events: none; 
        

        background: radial-gradient(
            600px circle at var(--mouse-x) var(--mouse-y), 
            rgba(37, 244, 238, 0.10), 
            transparent 40%
        );
    }


    .card:hover::after, 
    .login-card:hover::after, 
    .glass-card:hover::after,
    .social-btn:hover::after {
        opacity: 1;
    }
`;
document.head.appendChild(spotlightStyle);

document.addEventListener('DOMContentLoaded', () => {
    const lightTargets = document.querySelectorAll('.card, .login-card, .glass-card, .social-btn');

    lightTargets.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});

const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes cyberSlideIn {
        0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            filter: blur(5px);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
        }
    }

    /* BaÅŸlangÄ±Ã§ta gÃ¶rÃ¼nmez olsunlar ki animasyonla gelsinler */
    .stagger-load {
        opacity: 0; 
    }
`;
document.head.appendChild(styleSheet);

document.addEventListener("DOMContentLoaded", () => {

    const blocks = document.querySelectorAll(
        '.header-bar, .status-card, .features-list, .social-actions, .footer'
    );

    blocks.forEach((el, index) => {

        el.classList.add('stagger-load');

        el.style.animation = `cyberSlideIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`;
        el.style.animationDelay = `${index * 0.1}s`; 
    });
});


document.addEventListener('DOMContentLoaded', () => {

    const magnets = document.querySelectorAll('.cyber-btn, .social-btn, .icon-btn, .glass-btn, .lang-btn');

    magnets.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            

            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;


            const strength = 0.4;
            

            btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
            

            const icon = btn.querySelector('svg');
            if(icon) {
                icon.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            }
        });


        btn.addEventListener('mouseleave', () => {

            btn.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
            btn.style.transform = 'translate(0, 0)';
            
            const icon = btn.querySelector('svg');
            if(icon) {
                icon.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
                icon.style.transform = 'translate(0, 0)';
            }

            setTimeout(() => {
                btn.style.transition = '';
                if(icon) icon.style.transition = '';
            }, 400);
        });
    });
});

const sheenStyle = document.createElement('style');
sheenStyle.innerHTML = `

    @keyframes sheenSlide {
        0% { left: -100%; opacity: 0; }
        5% { opacity: 1; }
        100% { left: 100%; opacity: 0; }
    }


    .cyber-btn, .social-btn, .glass-btn {
        position: relative;
        overflow: hidden !important; /* IÅŸÄ±k dÄ±ÅŸarÄ± taÅŸmasÄ±n */
    }


    .cyber-btn::before, .social-btn::before, .glass-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        

        background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
        );
        

        transform: skewX(-25deg);
        pointer-events: none;
        z-index: 2;
    }


    .cyber-btn:hover::before, 
    .social-btn:hover::before, 
    .glass-btn:hover::before {
        animation: sheenSlide 0.7s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
`;
document.head.appendChild(sheenStyle);


const shockwaveStyle = document.createElement('style');
shockwaveStyle.innerHTML = `
    .shockwave {
        position: absolute;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none; /* TÄ±klamayÄ± engelleme */
        z-index: 9999;
        

        width: 0px;
        height: 0px;
        border: 2px solid rgba(37, 244, 238, 0.8); /* Neon Turkuaz */
        box-shadow: 0 0 10px rgba(37, 244, 238, 0.5), inset 0 0 10px rgba(37, 244, 238, 0.5);
        opacity: 1;
        
        animation: shockwaveExpand 0.6s ease-out forwards;
    }

    @keyframes shockwaveExpand {
        0% {
            width: 0px;
            height: 0px;
            opacity: 1;
            border-width: 4px;
        }
        100% {
            width: 500px; /* Ne kadar geniÅŸleyeceÄŸi */
            height: 500px;
            opacity: 0;
            border-width: 0px;
        }
    }
`;
document.head.appendChild(shockwaveStyle);


document.addEventListener('click', (e) => {

    const wave = document.createElement('div');
    wave.classList.add('shockwave');
    
    
    wave.style.left = e.clientX + 'px';
    wave.style.top = e.clientY + 'px';
    
    
    const target = e.target.closest('.logout-btn, .btn-secondary, .icon-btn.music-dl');
    if (target) {
        wave.style.borderColor = 'rgba(254, 44, 85, 0.8)';
        wave.style.boxShadow = '0 0 10px rgba(254, 44, 85, 0.5), inset 0 0 10px rgba(254, 44, 85, 0.5)';
    }


    document.body.appendChild(wave);
    

    setTimeout(() => {
        wave.remove();
    }, 600);
});


const sparkStyle = document.createElement('style');
sparkStyle.innerHTML = `
    .spark {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #25F4EE; /* Turkuaz */
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 0 10px #25F4EE;
    }
`;
document.head.appendChild(sparkStyle);

document.addEventListener('click', (e) => {
    const sparkCount = 8; 
    const color = '#25F4EE';
    

    const target = e.target.closest('.logout-btn, .btn-secondary');
    const finalColor = target ? '#FE2C55' : color;

    for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.classList.add('spark');
        document.body.appendChild(spark);


        const x = e.clientX;
        const y = e.clientY;
        
        spark.style.left = x + 'px';
        spark.style.top = y + 'px';
        spark.style.background = finalColor;
        spark.style.boxShadow = `0 0 10px ${finalColor}`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 60 + 20; 
        

        const animation = spark.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`, opacity: 0 }
        ], {
            duration: 400 + Math.random() * 200,
            easing: 'cubic-bezier(0, .9, .57, 1)',
        });


        animation.onfinish = () => spark.remove();
    }
});

const borderStyle = document.createElement('style');
borderStyle.innerHTML = `

    .card::before, .glass-card::before, .login-card::before {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border-radius: inherit;
        padding: 1.5px; /* Kenar kalÄ±nlÄ±ÄŸÄ± */
        

        -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        

        background: radial-gradient(
            300px circle at var(--mouse-x) var(--mouse-y), 
            rgba(37, 244, 238, 1), /* Parlak Turkuaz */
            rgba(255, 255, 255, 0.1) 40%, /* GeÃ§iÅŸ */
            transparent 80% /* Uzaklar sÃ¶nÃ¼k */
        );
        
        z-index: 2; /* Ä°Ã§eriÄŸin Ã¼stÃ¼nde ama tÄ±klamayÄ± engellemez */
        pointer-events: none;
        opacity: 0.6; /* ParlaklÄ±k ayarÄ± */
        transition: opacity 0.5s ease;
    }
`;
document.head.appendChild(borderStyle);

document.addEventListener('DOMContentLoaded', () => {
    const borders = document.querySelectorAll('.card, .glass-card, .login-card');

    borders.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {

    const loginCard = document.querySelector('.login-card');

    if (loginCard) {

        let isHovering = false;

        loginCard.addEventListener('mouseenter', () => {
            isHovering = true;

            loginCard.style.animation = 'none'; 

            loginCard.style.transition = 'transform 0.1s ease-out'; 
        });

        loginCard.addEventListener('mousemove', (e) => {
            if (!isHovering) return; 

            const rect = loginCard.getBoundingClientRect();

            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            loginCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        const resetCard = () => {
            isHovering = false;

            loginCard.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            loginCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';

            setTimeout(() => {
                if (!isHovering) { 
                    loginCard.style.transition = ''; 
                    loginCard.style.animation = 'float 6s ease-in-out infinite'; 
                }
            }, 500);
        };

        loginCard.addEventListener('mouseleave', resetCard);
        window.addEventListener('blur', resetCard);
        document.body.addEventListener('mouseleave', resetCard);
    }
});


function showGlitchBanScreen(username, reason) {

    if (document.getElementById('pixora-ban-overlay')) return;

    if (!document.getElementById('ban-screen-style-safe')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'ban-screen-style-safe';
        styleEl.textContent = `
            /* Arkadaki login ekranÄ±nÄ±n Ã¼stÃ¼ne inen karanlÄ±k cam katmanÄ± */
            #pixora-ban-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 2147483647 !important; /* Her ÅŸeyin en Ã¼stÃ¼nde durmasÄ± iÃ§in maksimum z-index */
                background: rgba(10, 0, 0, 0.85); /* Arkadaki login ekranÄ±nÄ± siyah bir tÃ¼l ile karartÄ±r */
                backdrop-filter: blur(6px); /* Arkadaki ekranÄ± bulanÄ±klaÅŸtÄ±rÄ±r (cam efekti) */
                display: flex;
                align-items: center;
                justify-content: center;
                animation: banFadeIn 0.5s ease forwards;
            }
            
            .ban-logout-btn {
                position: absolute; top: 15px; right: 15px; z-index: 100000; 
                background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
                width: 36px; height: 36px; border-radius: 10px; display: flex; 
                align-items: center; justify-content: center; cursor: pointer; transition: 0.3s;
            }
            .ban-logout-btn svg { width: 18px; height: 18px; fill: #aaa; transition: 0.3s; }
            .ban-logout-btn:hover { background: rgba(254, 44, 85, 0.2); border-color: #FE2C55; transform: rotate(90deg); }
            .ban-logout-btn:hover svg { fill: #FE2C55; }

            .lock-container { 
                background: rgba(20, 0, 0, 0.9); border: 1px solid rgba(254, 44, 85, 0.6); 
                box-shadow: 0 0 50px rgba(254, 44, 85, 0.4), inset 0 0 20px rgba(254, 44, 85, 0.1); 
                padding: 35px 25px; border-radius: 20px; text-align: center; max-width: 85%; 
            } 
            .lock-icon-circle { 
                width: 60px; height: 60px; margin: 0 auto 15px auto; border-radius: 50%; 
                border: 3px solid #FE2C55; display: flex; align-items: center; justify-content: center; 
                box-shadow: 0 0 25px rgba(254, 44, 85, 0.6); 
                animation: pulseRed 2s infinite; background: rgba(254, 44, 85, 0.1); 
            } 
            .lock-icon-circle svg { width: 28px; fill: #FE2C55; } 
            
            .glitch { 
                font-family: 'Rajdhani', sans-serif; color: #FE2C55; margin: 0 0 10px 0; 
                font-size: 24px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; position: relative; 
                text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
            } 
            
            .lock-desc { font-family: 'Inter', sans-serif; color: #ccc; font-size: 12px; line-height: 1.5; margin: 0 0 20px 0; } 
            .lock-footer { font-size: 11px; color: #666; font-family: monospace; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; } 
            
            @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(254, 44, 85, 0.7); transform: scale(1); } 50% { box-shadow: 0 0 0 15px rgba(254, 44, 85, 0); transform: scale(1.05); } 100% { box-shadow: 0 0 0 0 rgba(254, 44, 85, 0); transform: scale(1); } } 
            @keyframes banFadeIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(6px); } } 
        `;
        document.head.appendChild(styleEl);
    }

    const banDiv = document.createElement('div');
    banDiv.id = 'pixora-ban-overlay';
    
    const banTitle = "Account Banned";
    const banMsg =  'Your account has been banned due to violations of our terms of service. Please contact support for more information.';

    banDiv.innerHTML = `
        <div id="banLogoutBtn" class="ban-logout-btn" title="Hesaptan Ã‡Ä±kÄ±ÅŸ Yap">
            <svg viewBox="0 0 24 24">
                <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>
            </svg>
        </div>
        <div class="lock-container">
            <div class="lock-icon-circle">
                <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
            </div>
            <h1 class="glitch" data-text="${banTitle}">${banTitle}</h1>
            <p class="lock-desc">${banMsg}</p>
            <div class="lock-footer">
                KULLANICI: <span style="color:#FE2C55; font-weight:bold; letter-spacing:1px;">${username}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(banDiv);

    document.getElementById('banLogoutBtn').addEventListener('click', () => {
        localStorage.removeItem('pixora_username');
        localStorage.removeItem('pixora_avatar');
        chrome.storage.local.remove('pixora_fetched_username');
        window.location.reload();
    });
}


function showDuplicateAccountScreen(username, reason) {

    if (document.getElementById('pixora-duplicate-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'pixora-duplicate-overlay';

    Object.assign(overlay.style, {
        position: 'absolute',
        top: '0', left: '0', width: '100%', height: '100%',
        backgroundColor: 'rgba(10, 5, 0, 0.85)', 
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: '2147483647',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: '0',
        transition: 'opacity 0.4s ease'
    });


    overlay.innerHTML = `
        <div class="card" style="border-color: #FFA500; box-shadow: 0 10px 40px rgba(255,165,0,0.3); text-align: center; padding: 30px 20px; width: 85%; box-sizing: border-box;">
            
            <div style="width: 60px; height: 60px; margin: 0 auto 15px auto; border-radius: 50%; border: 3px solid #FFA500; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(255,165,0,0.6); background: rgba(255,165,0,0.1);">
                <svg viewBox="0 0 24 24" style="width: 28px; fill: #FFA500;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
            </div>
            
            <div style="font-family: 'Rajdhani', sans-serif; color: #FFA500; margin: 0 0 10px 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 10px rgba(255,165,0,0.5);">
                Account Already Registered
            </div>
            
            <div style="font-family: 'Inter', sans-serif; color: #ccc; font-size: 12px; line-height: 1.4; margin-bottom: 20px;">
                This account is already registered. Please log in with your existing credentials or use a different account to register.
            </div>
            
            <div style="font-size: 11px; color: #666; font-family: monospace; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; margin-bottom: 15px;">
                ACC: <span style="color:#FFA500; font-weight:bold;">${username}</span>
            </div>
            
            <button id="duplicateToLoginBtn" class="cyber-btn" style="background: linear-gradient(90deg, #25F4EE, #FE2C55); padding: 12px; width: 100%;">
                <span class="btn-text" style="font-size: 13px; color: #fff;">GO TO LOGIN SCREEN</span>
            </button>
            
        </div>
    `;

    document.body.appendChild(overlay);


    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 50);

    document.getElementById('duplicateToLoginBtn').addEventListener('click', () => {

        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 400);


        document.getElementById('passwordInput').value = "";
        localStorage.removeItem('pixora_fetched_username');
        uP("NOT FOUND", ""); 


        document.getElementById('registerView').classList.add('hidden-left');
        setTimeout(() => { document.getElementById('loginView').classList.remove('hidden-right') }, 300);
    });
}








