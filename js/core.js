// Pixora - core service worker

const SUPA_URL = 'https://movecexnjyeaipkklijv.supabase.co/rest/v1/pixora_users';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdmVjZXhuanllYWlwa2tsaWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTYzMDUsImV4cCI6MjA5MjQ3MjMwNX0.LdytPpEvTDapFfh_OxxOwSf3i8af4XVSe9mdy3QDkhE';
const VERSION = '1.2.1';

// ── HD VIDEO via tikwm task API ──
async function handleHDProcess(tiktokUrl) {
    try {
        const submit = await fetch('https://www.tikwm.com/api/video/task/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': 'https://www.tikwm.com/originalDownloader.html',
                'Origin': 'https://www.tikwm.com'
            },
            body: `url=${encodeURIComponent(tiktokUrl)}&web=1`
        });
        const submitData = await submit.json();
        if (submitData.code === 0 && submitData.data?.task_id) {
            await new Promise(r => setTimeout(r, 2500));
            const result = await fetch(`https://www.tikwm.com/api/video/task/result?task_id=${submitData.data.task_id}`);
            const json = await result.json();
            if (json.code === 0 && json.data) {
                const d = json.data.detail || json.data;
                return d.play_url || d.download_url || d.play || null;
            }
        }
    } catch(e) {}
    return null;
}

async function sendActivityPing(username) {
    if (!username) return;
    try {
        await fetch(`${SUPA_URL}?username=eq.${encodeURIComponent(username)}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPA_KEY,
                'Authorization': `Bearer ${SUPA_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                last_seen: new Date().toISOString(),
                version_used: VERSION
            })
        });
    } catch(e) {}
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === 'GET_ACTIVE_TIKTOK_USER') {
        fetch('https://www.tiktok.com/passport/web/account/info/', { credentials: 'include' })
            .then(r => r.json())
            .then(json => {
                if (json.data && json.data.username) {
                    sendResponse({ success: true, username: '@' + json.data.username });
                } else {
                    scanTabForUser(sendResponse);
                }
            })
            .catch(() => scanTabForUser(sendResponse));
        return true;
    }

    if (request.action === 'DOWNLOAD_FILE') {
        const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
        const filename = request.filename || `pixora_${rand}.mp4`;
        // Fetch blob dulu agar filename bisa dikontrol penuh
        fetch(request.url)
            .then(r => r.blob())
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                chrome.downloads.download({ url: blobUrl, filename: `pixora/${filename}`, saveAs: false },
                    () => setTimeout(() => URL.revokeObjectURL(blobUrl), 10000));
            })
            .catch(() => {
                chrome.downloads.download({ url: request.url, filename: `pixora/${filename}`, saveAs: false });
            });
        return true;
    }

    if (request.action === 'FETCH_HD_VIDEO') {
        handleHDProcess(request.tiktokUrl)
            .then(hdLink => {
                if (hdLink) sendResponse({ success: true, url: hdLink });
                else sendResponse({ success: false });
            })
            .catch(() => sendResponse({ success: false }));
        return true;
    }

    if (request.action === 'ACTIVITY_PING') {
        sendActivityPing(request.username);
        return true;
    }

});

function scanTabForUser(sendResponse) {
    chrome.tabs.query({ url: 'https://www.tiktok.com/*' }, (tabs) => {
        if (!tabs || tabs.length === 0) { sendResponse({ success: false }); return; }
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id }, world: 'MAIN',
            func: () => {
                try {
                    const nav = document.querySelector('a[data-e2e="nav-profile"]');
                    if (nav) { const m = nav.href.match(/\/@([^/?]+)/); if (m) return '@' + m[1]; }
                    const links = document.querySelectorAll('a[href*="/@"]');
                    for (const l of links) {
                        const m = l.href.match(/\/@([^/?]+)/);
                        if (m && m[1] && !m[1].includes('.')) return '@' + m[1];
                    }
                } catch(e) {}
                return null;
            }
        }, (results) => {
            const username = results && results[0] && results[0].result;
            if (username) sendResponse({ success: true, username });
            else sendResponse({ success: false });
        });
    });
}
