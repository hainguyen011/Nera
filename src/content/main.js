/**
 * Nera AI Agent - Content Script Entry Point
 * Routing theo URL để khởi chạy đúng agent chuyên biệt:
 *   - /messages/e2ee/  → NeraMessengerInfiltrator (Auto Reply)
 *   - Mọi trang khác   → NeraInfiltrator (News Feed / Comment)
 */
(async () => {
    try {
        const url = window.location.href;
        const isMessenger = url.includes('/messages/');

        console.log(`[NERA] Route detected: ${isMessenger ? 'MESSENGER' : 'FACEBOOK'}`);

        if (isMessenger) {
            // ── Messenger Agent ──────────────────────────────────────
            const { NeraMessengerInfiltrator } = await import(chrome.runtime.getURL('src/content/modules/MessengerInfiltrator.js'));
            const { NeraOverlay } = await import(chrome.runtime.getURL('src/content/modules/Overlay.js'));

            window.__neraMessenger = new NeraMessengerInfiltrator();
            window.__neraOverlay = new NeraOverlay({ mode: 'messenger' });
            
            _initMessengerSidebarToggle();
        } else {
            // ── News Feed / Standard Facebook Agent ──────────────────────
            const { NeraStyles } = await import(chrome.runtime.getURL('src/content/modules/Styles.js'));
            const { NeraTemplates } = await import(chrome.runtime.getURL('src/content/modules/Templates.js'));
            const { NeraInfiltrator } = await import(chrome.runtime.getURL('src/content/modules/Infiltrator.js'));
            const { NeraOverlay } = await import(chrome.runtime.getURL('src/content/modules/Overlay.js'));
            const { NeraDataMiner } = await import(chrome.runtime.getURL('src/content/modules/DataMiner.js'));

            new NeraInfiltrator(NeraStyles, NeraTemplates, NeraDataMiner);
            new NeraOverlay();
        }

        console.log('[NERA] System initialized in modular mode.');
    } catch (err) {
        console.error('[NERA] Initialization failed:', err);
    }
})();

/**
 * Toggle sidebar trái của Facebook Messenger bằng phím Alt+Z
 * Sidebar trái = panel danh sách hội thoại bên trái màn hình
 */
function _initMessengerSidebarToggle() {
    // Các selector ổn định theo role/aria-label (chống lại class đổi)
    const SIDEBAR_SELECTORS = [
        'div[aria-label="Cuộc hội thoại"]',   // VI locale
        'div[aria-label="Chats"]',             // EN locale  
        'div[aria-label="Messenger"]',         // Fallback
        'div[role="navigation"]',              // Generic nav
    ];

    function findSidebar() {
        for (const sel of SIDEBAR_SELECTORS) {
            const el = document.querySelector(sel);
            if (el) return el;
        }
        return null;
    }

    let isHidden = false;
    let savedStyle = '';

    document.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'z' || e.key === 'Z')) {
            e.preventDefault();
            const sidebar = findSidebar();
            if (!sidebar) {
                console.warn('[NERA] Messenger sidebar not found. Selector may need update.');
                return;
            }

            if (!isHidden) {
                // Ẩn sidebar với animation
                savedStyle = sidebar.style.cssText;
                sidebar.style.cssText = `
                    transition: all 0.25s ease;
                    overflow: hidden;
                    min-width: 0 !important;
                    max-width: 0 !important;
                    width: 0 !important;
                    opacity: 0;
                    transform: translateX(-100%);
                `;
                isHidden = true;
                console.log('[NERA] Sidebar hidden (Alt+Z).');
            } else {
                // Hiện lại sidebar
                sidebar.style.cssText = savedStyle;
                // Đảm bảo transition được apply
                requestAnimationFrame(() => {
                    sidebar.style.transition = 'all 0.25s ease';
                });
                isHidden = false;
                console.log('[NERA] Sidebar shown (Alt+Z).');
            }
        }
    });

    console.log('[NERA] Alt+Z sidebar toggle ready.');
}
