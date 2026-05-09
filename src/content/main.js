/**
 * Nera AI Agent - Content Script Entry Point
 */
(async () => {
    try {
        // Dynamic imports for modular architecture
        const { NeraStyles } = await import(chrome.runtime.getURL('src/content/modules/Styles.js'));
        const { NeraTemplates } = await import(chrome.runtime.getURL('src/content/modules/Templates.js'));
        const { NeraInfiltrator } = await import(chrome.runtime.getURL('src/content/modules/Infiltrator.js'));
        const { NeraOverlay } = await import(chrome.runtime.getURL('src/content/modules/Overlay.js'));
        const { NeraDataMiner } = await import(chrome.runtime.getURL('src/content/modules/DataMiner.js'));

        // Initialize components with required dependencies
        new NeraInfiltrator(NeraStyles, NeraTemplates, NeraDataMiner);
        new NeraOverlay();


        console.log("[NERA] System initialized in modular mode.");
    } catch (err) {
        console.error("[NERA] Initialization failed:", err);
    }
})();
