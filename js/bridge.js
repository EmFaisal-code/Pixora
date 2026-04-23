// Pixora - content script

let isInjected = false;

function checkAndInject() {
    if (isInjected) return;
    const url = window.location.href;
    if (url.includes('/upload') || url.includes('/creator-center')) {
        const s = document.createElement('script');
        s.src = chrome.runtime.getURL('js/engine.js');
        s.onload = function() {
            this.remove();
            // Auto-activate boost setelah inject
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('PIXORA_AUTO_ACTIVATE'));
            }, 500);
        };
        (document.head || document.documentElement).appendChild(s);
        isInjected = true;
    }
}

// Dengarkan event auto-activate dari inject.js
window.addEventListener('PIXORA_AUTO_ACTIVATE', () => {
    if (window.activate60FPS) window.activate60FPS();
});

checkAndInject();

const observer = new MutationObserver(() => checkAndInject());
if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
}
