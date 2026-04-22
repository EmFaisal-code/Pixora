(function() {
    'use strict';

    function isUploadPage() {
        const url = window.location.href;
        return url.includes('/upload') || url.includes('/creator-center');
    }

    if (typeof window._pixora_active === 'undefined') window._pixora_active = false;
    window._pixora_lang = 'en';

    const badgeTranslations = {
        en: { ready: "Ready", active: "Active" },
        id: { ready: "Siap", active: "Aktif" }
    };

    window.setBadgeLanguage = function(lang) {
        if (!badgeTranslations[lang]) return;
        window._pixora_lang = lang;
        updateBadge(window._pixora_active ? 'active' : 'ready');
    };

    function updateBadge(status) {
        const badge = document.getElementById('pixora-badge');
        const statusText = document.getElementById('k-status-text');
        if (!badge || !statusText) return;
        const texts = badgeTranslations[window._pixora_lang || 'en'];
        badge.classList.remove('ready', 'active');
        if (status === 'active') {
            badge.classList.add('active');
            statusText.innerText = texts.active;
            statusText.style.color = "#6366f1";
        } else {
            badge.classList.add('ready');
            statusText.innerText = texts.ready;
            statusText.style.color = "#22c55e";
        }
    }

    // ── JSON PAYLOAD CLEANER ONLY ──
    // Hanya bersihkan metadata TikTok, tidak modifikasi URL/header
    // karena modifikasi URL/header menyebabkan upload retry/gagal
    const origStringify = JSON.stringify;
    JSON.stringify = function(value, replacer, space) {
        if (!isUploadPage() || !window._pixora_active) {
            return origStringify.apply(this, arguments);
        }
        if (value && typeof value === 'object') {
            try {
                const deepClean = (obj) => {
                    if (!obj || typeof obj !== 'object') return;
                    ['draft', 'canvas_config', 'vedit_segment_info', 'vedit_project', 'edit_common_info']
                        .forEach(k => { if (obj.hasOwnProperty(k)) delete obj[k]; });
                    if (obj.cloud_edit_is_use_video_canvas !== undefined) obj.cloud_edit_is_use_video_canvas = false;
                    if (obj.post_type === 2) obj.post_type = 3;
                    for (let k in obj) { if (obj[k] && typeof obj[k] === 'object') deepClean(obj[k]); }
                };
                if (value.single_post_req_list || value.vedit_common_info || value.post_common_info || value.feature_common_info_list) {
                    deepClean(value);
                }
            } catch(e) { console.error("[Pixora] Clean error:", e); }
        }
        return origStringify.apply(this, arguments);
    };

    window.activate60FPS = function() {
        window._pixora_active = true;
        updateBadge('active');
        return { status: "Boost Active" };
    };

    window.reset60FPS = function() {
        window._pixora_active = false;
        updateBadge('ready');
        return { status: "Reset" };
    };

    window.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'PIXORA_SET_LANG') window.setBadgeLanguage(e.data.lang);
    });

    if (isUploadPage()) {
        window._pixora_active = false;
        updateBadge('ready');
    }

})();
