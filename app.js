document.addEventListener('DOMContentLoaded', async function () {
    const ADMIN_PASSWORD = 'xx99';
    const ADMIN_STORAGE_KEY = 'pxpAdminContent';
    const ADMIN_SESSION_KEY = 'pxpAdminUnlocked';
    const ADMIN_CONTENT_URL = './content/admin-content.json';
    const FREE_JOURNAL_FORM_ID = 'Ed7R0udrrYcJrtyRNIZz';

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js').catch(function (error) {
            console.warn('Service worker registration failed:', error);
        });
    }

    const currentUrl = new URL(window.location.href);
    const forceMobileView = currentUrl.searchParams.get('mobile') === '1';
    const useLocalAdminOverrides = currentUrl.searchParams.get('adminPreview') === '1';
    if (forceMobileView) {
        document.body.classList.add('force-mobile-view');
    }

    const preservePreviewParamsOnInternalLinks = function () {
        const previewParams = [];
        if (forceMobileView) {
            previewParams.push(['mobile', '1']);
        }
        if (useLocalAdminOverrides) {
            previewParams.push(['adminPreview', '1']);
        }
        if (!previewParams.length) {
            return;
        }

        const links = Array.from(document.querySelectorAll('a[href]'));
        links.forEach(function (link) {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }

            let targetUrl;
            try {
                targetUrl = new URL(href, currentUrl.href);
            } catch (error) {
                return;
            }

            if (targetUrl.origin !== currentUrl.origin) {
                return;
            }

            const isHtmlPage = targetUrl.pathname.endsWith('.html') || targetUrl.pathname.endsWith('/');
            if (!isHtmlPage) {
                return;
            }

            previewParams.forEach(function (entry) {
                targetUrl.searchParams.set(entry[0], entry[1]);
            });
            link.href = targetUrl.pathname + targetUrl.search + targetUrl.hash;
        });
    };

    preservePreviewParamsOnInternalLinks();

    const shareButton = document.querySelector('.nav-share-button');
    const prayerRequestTriggers = document.querySelectorAll('.prayer-request-trigger');
    const disableAutoPrayerPopup = document.body.dataset.disablePrayerPopupAuto === 'true';
    const requestedPrayerPopupDelay = Number.parseInt(document.body.dataset.prayerPopupDelay || '', 10);
    const AUTO_PRAYER_POPUP_DELAY_MS = disableAutoPrayerPopup
        ? null
        : Number.isFinite(requestedPrayerPopupDelay) && requestedPrayerPopupDelay >= 0
            ? requestedPrayerPopupDelay
            : 20000;
    const requestedFreeJournalPopupDelay = Number.parseInt(document.body.dataset.freeJournalPopupDelay || '', 10);
    const AUTO_FREE_JOURNAL_POPUP_DELAY_MS = Number.isFinite(requestedFreeJournalPopupDelay) && requestedFreeJournalPopupDelay >= 0
        ? requestedFreeJournalPopupDelay
        : null;
    const mobileButtonLabelMediaQuery = window.matchMedia('(max-width: 560px)');
    let videoCards = Array.from(document.querySelectorAll('.video-card'));
    const videosContainer = document.querySelector('.videos-container');
    const primaryVideoGrid = document.querySelector('.videos-container > .video-grid:not(.video-grid-extra)');
    const extraVideoGrid = document.querySelector('.video-grid-extra');
    const videoExpandToggle = document.querySelector('.video-expand-toggle');
    const videoSearchInput = document.querySelector('.video-search-input');
    const videoSortSelect = document.querySelector('.video-sort-select');
    const videoSearchEmpty = document.querySelector('.video-search-empty');
    const studyNotesFolderUrl = 'https://drive.google.com/drive/folders/1s9LAyfQf4uSKVNu2kULm0DUGdhHjxtlN?usp=sharing';
    const studyNotesDownloadLinksByYouTubeId = {
        Zv4tzmP2OfI: 'https://drive.google.com/uc?export=download&id=1LCIsrskVxvef33XEBmbb6RQ1c6p_zHh7',
        'Jva-mSBFc9k': 'https://drive.google.com/uc?export=download&id=1q4WbAewxnPmCbDpr7897iqqE1Vxwteca',
        '-O99Y4kILG8': 'https://drive.google.com/uc?export=download&id=1LyHUPEO-xrRe6R-xDYBQ5IZMPZiYJdc4',
        Hu5gbtZsbcg: 'https://drive.google.com/uc?export=download&id=1I5AvwxAb0mNBzNNh4hiTCE29BLIAvkrb',
        jSADhcPqGpQ: 'https://drive.google.com/uc?export=download&id=1GBv-a-P-rjiCHT0pmwAdJ5MzwHELHnl3',
        PlCeqAbGN9U: 'https://drive.google.com/uc?export=download&id=1pe_Aclxwe8HvvZAz_I9jZZ4ir0wKi3vr',
        mYiw0rO3qSo: 'https://drive.google.com/uc?export=download&id=1gK87AXffTQoEjW0TPSH_7O9hGktPhoH4',
        aG4eU8LVzVU: 'https://drive.google.com/uc?export=download&id=1pKFYjcXCWHf6bd7iU2dqwwHVluiJuzhy',
        MZAiZZcdrZ4: 'https://drive.google.com/uc?export=download&id=101uPt9Z1diznGWtctxKxRjyBrVSK7hXp',
        QOqeESjDzmA: 'https://drive.google.com/uc?export=download&id=1-ECjYUQ8gubX4RRZQ_QH9ekypcSO1q1s',
        t2BAf6_z_zk: 'https://drive.google.com/uc?export=download&id=1WTW2OZtogO9SZR0M5U5tN0n9NibcoRx1',
        ZBJrPorLCyc: 'https://drive.google.com/uc?export=download&id=1J3fBz0AZKNjZXxWXgTSemdSEeQqZ5Odt',
        I7DZerTI9hg: 'https://drive.google.com/file/d/1jXTc2pWNGPJ3Pi7CCrPJ3kG0JAzkd0GM/view?usp=sharing',
        CGpM9zMOX50: 'https://drive.google.com/drive/folders/1Jwt70wfCazmUoWpXVsFlXw8KS1hIcWoz?usp=drive_link',
        '7zyTup1sU2U': 'https://drive.google.com/file/d/1GIsqYW5Bl1JKub1xs_PPNlSWSufFCX8R/view?usp=drive_link',
        aDlh_6UYVWY: 'https://drive.google.com/file/d/1engIMXYPZm5dUpwcYNSNNHnHaw_Km9G5/view?usp=sharing',
        'Vz-MnpmWfl8': 'https://drive.google.com/file/d/1_FjV8gHA8wT3PuarWWfvSWhPb7NnxdPi/view?usp=sharing',
        VZygVRaDCUI: 'https://drive.google.com/file/d/1AU4r3qAmzNDas3B6ZSVmHToU1VKnQ7a8/view?usp=sharing',
        QogDKTsxzUk: 'https://drive.google.com/file/d/1-V2vcY8TrdoinGM1pGhoS8S35_gv4jUL/view?usp=sharing',
        blfU1dO9p94: 'https://drive.google.com/file/d/1WE4GbXCxkfpFxXlmAYxyjxc6-EElXz7D/view?usp=drive_link',
    };
    const unavailableStudyNotesYouTubeIds = new Set(['9lBcgWMiE7g']);
    const unavailableStudyNotesLabel = 'Study Notes Not Available';
    const uploadDateLabelsByYouTubeId = {
        '-O99Y4kILG8': 'Uploaded: January 6, 2026',
        '1oi5xAgYyu4': 'Uploaded: January 13, 2026',
        'MlWYBkHROXc': 'Uploaded: January 20, 2026',
        'frqOolLffs8': 'Uploaded: January 27, 2026',
    };
    const youtubeApiKey =
        window.YOUTUBE_API_KEY ||
        document.querySelector('meta[name="youtube-api-key"]')?.getAttribute('content')?.trim() ||
        '';
    if (!youtubeApiKey) {
        console.warn('YouTube API key missing: publish dates cannot be fetched. Add window.YOUTUBE_API_KEY or <meta name="youtube-api-key" content="...">.');
    }
    const youtubeMetadataCache = new Map();
    const heroFeaturedVideo = document.querySelector('.hero-featured-video');
    const heroFeaturedMedia = document.querySelector('.hero-featured-media');
    let heroFeaturedIframe = heroFeaturedMedia?.querySelector('iframe') || null;
    const heroFeaturedDate = document.querySelector('.hero-featured-date');
    const heroYouTubeHandle = '@PoweredXPrayers';
    const heroYouTubeUsername = 'PoweredXPrayers';
    const heroYouTubeChannelId = 'UC1qFfHXbdgzy188ILJFw68Q';
    const uploadScheduleTimeZone = 'America/New_York';
    const heroUploadsPlaylistId = `UU${heroYouTubeChannelId.slice(2)}`;
    const youtubeRssEntriesCache = new Map();
    let adminContent = {};
    let hasAutoPrayerPopupOpened = false;

    const adminOverrideSelectors = [
        '.nav-brand-name',
        '.nav-shop',
        '.hero-title',
        '.hero-title .brand-name',
        '.hero-title-line',
        '.hero-description',
        '.donate-button',
        '.prayer-button',
        '.cashapp-button',
        '.hero-featured-date',
        '.section-title',
        '.video-title',
        '.video-date',
        '.video-description',
        '.toggle-description',
        '.download-button',
        '.footer-brand',
        '.footer-description',
        '.footer-link',
        '.footer-copyright',
        '.rss-strip-item',
        '.rss-strip-source',
        '.rss-strip-label',
        '.brand-icon',
        '.brand-icon-image',
        '.footer-pxp-logo',
    ];

    const deepMerge = function (base, override) {
        if (!override || typeof override !== 'object') {
            return Array.isArray(base) ? base.slice() : { ...(base || {}) };
        }

        if (Array.isArray(base) || Array.isArray(override)) {
            const baseArray = Array.isArray(base) ? base : [];
            const overrideArray = Array.isArray(override) ? override : [];
            const maxLength = Math.max(baseArray.length, overrideArray.length);
            return Array.from({ length: maxLength }, function (_, index) {
                const baseValue = baseArray[index];
                const overrideValue = overrideArray[index];
                if (baseValue && typeof baseValue === 'object' && overrideValue && typeof overrideValue === 'object') {
                    return deepMerge(baseValue, overrideValue);
                }
                return overrideValue === undefined ? baseValue : overrideValue;
            });
        }

        const merged = { ...(base || {}) };
        Object.keys(override).forEach(function (key) {
            const baseValue = merged[key];
            const overrideValue = override[key];
            if (baseValue && typeof baseValue === 'object' && overrideValue && typeof overrideValue === 'object') {
                merged[key] = deepMerge(baseValue, overrideValue);
                return;
            }
            merged[key] = overrideValue;
        });
        return merged;
    };

    const setNestedValue = function (target, path, value) {
        const parts = path.split('.');
        let cursor = target;
        parts.forEach(function (part, index) {
            const isLast = index === parts.length - 1;
            const nextPart = parts[index + 1];
            const shouldBeArray = /^\d+$/.test(nextPart || '');
            if (isLast) {
                cursor[part] = value;
                return;
            }
            if (!cursor[part]) {
                cursor[part] = shouldBeArray ? [] : {};
            }
            cursor = cursor[part];
        });
    };

    const pruneEmptyAdminBranches = function (value) {
        if (!value || typeof value !== 'object') {
            return false;
        }

        if (Array.isArray(value)) {
            value.forEach(function (item) {
                pruneEmptyAdminBranches(item);
            });
            return false;
        }

        Object.keys(value).forEach(function (key) {
            if (pruneEmptyAdminBranches(value[key])) {
                delete value[key];
            }
        });
        return Object.keys(value).length === 0;
    };

    const migrateLegacyDeviceOverrides = function (content) {
        if (!content || typeof content !== 'object' || !content.deviceOverrides) {
            return content || {};
        }

        const migrated = deepMerge({}, content);
        const deviceOverrides = migrated.deviceOverrides || {};
        const desktop = deviceOverrides.desktop || {};
        const mobile = deviceOverrides.mobile || {};
        const merged = deepMerge(deepMerge(migrated, desktop), mobile);
        delete merged.deviceOverrides;
        return merged;
    };

    const getLocalAdminContent = function () {
        try {
            return JSON.parse(window.localStorage.getItem(ADMIN_STORAGE_KEY) || '{}') || {};
        } catch (error) {
            return {};
        }
    };

    const saveLocalAdminContent = function (content) {
        window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(content));
    };

    const getAdminContent = function () {
        return adminContent && typeof adminContent === 'object' ? adminContent : {};
    };

    const saveAdminContent = function (content) {
        saveLocalAdminContent(content);
        adminContent = content;
    };

    const getPublishedAdminContent = async function () {
        try {
            const response = await fetch(`${ADMIN_CONTENT_URL}?t=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok) {
                return {};
            }

            const payload = await response.json();
            return payload && typeof payload === 'object' ? payload : {};
        } catch (error) {
            return {};
        }
    };

    const initializeAdminContent = async function () {
        let loadedContent = {};

        if (useLocalAdminOverrides) {
            loadedContent = getLocalAdminContent();
        } else {
            loadedContent = await getPublishedAdminContent();
        }

        adminContent = migrateLegacyDeviceOverrides(loadedContent || {});
    };

    const applyTextOverride = function (selector, value) {
        const element = document.querySelector(selector);
        if (element && typeof value === 'string') {
            element.textContent = value;
        }
    };

    const applyLinkOverride = function (selector, value) {
        const element = document.querySelector(selector);
        if (element && typeof value === 'string') {
            element.href = value;
        }
    };

    const applyImageOverride = function (selector, value) {
        const element = document.querySelector(selector);
        if (element && typeof value === 'string' && value.trim()) {
            element.src = value.trim();
            element.dataset.adminOverride = 'true';
        }
    };

    const openPrayerRequestPopup = function () {
        const formId = 'xNAkyNruR5LibqfWRvXy';
        const popupBaseId = `popup-${formId}`;
        const popupInstanceId = `${popupBaseId}-${Date.now()}`;

        Array.from(document.querySelectorAll(`iframe[id^="${popupBaseId}"]`)).forEach(function (frame) {
            frame.remove();
        });

        const existingScript = document.getElementById('pxp-prayer-popup-script');
        if (existingScript) {
            existingScript.remove();
        }

        try {
            Object.keys(window.localStorage).forEach(function (key) {
                if (key.includes(formId) || key.includes(popupBaseId)) {
                    window.localStorage.removeItem(key);
                }
            });
            Object.keys(window.sessionStorage).forEach(function (key) {
                if (key.includes(formId) || key.includes(popupBaseId)) {
                    window.sessionStorage.removeItem(key);
                }
            });
        } catch (error) {
            // Ignore storage cleanup errors in restricted contexts.
        }

        const iframe = document.createElement('iframe');
        iframe.src = 'https://link.poweredxprayers.com/widget/form/xNAkyNruR5LibqfWRvXy';
        iframe.style.display = 'none';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '3px';
        iframe.id = popupInstanceId;
        iframe.setAttribute('data-layout', "{'id':'POPUP'}");
        iframe.setAttribute('data-trigger-type', 'alwaysShow');
        iframe.setAttribute('data-trigger-value', '');
        iframe.setAttribute('data-activation-type', 'alwaysActivated');
        iframe.setAttribute('data-activation-value', '');
        iframe.setAttribute('data-deactivation-type', 'neverDeactivate');
        iframe.setAttribute('data-deactivation-value', '');
        iframe.setAttribute('data-form-name', 'Prayer Request');
        iframe.setAttribute('data-height', 'undefined');
        iframe.setAttribute('data-layout-iframe-id', popupInstanceId);
        iframe.setAttribute('data-form-id', formId);
        iframe.title = 'Prayer Request';
        iframe.setAttribute('data-modal-height', '500');
        document.body.appendChild(iframe);

        const script = document.createElement('script');
        script.id = 'pxp-prayer-popup-script';
        script.src = `https://link.poweredxprayers.com/js/form_embed.js?v=${Date.now()}`;
        script.async = true;
        document.body.appendChild(script);
    };

    const cleanupClosedFreeJournalPopup = function () {
        const popupBaseId = `popup-${FREE_JOURNAL_FORM_ID}`;
        const now = Date.now();
        document.querySelectorAll(`.ep-overlay[id^="${popupBaseId}"]`).forEach(function (overlay) {
            if (!overlay.dataset.pxpJournalOverlaySeenAt) {
                overlay.dataset.pxpJournalOverlaySeenAt = String(now);
                return;
            }

            const overlayAgeMs = now - Number(overlay.dataset.pxpJournalOverlaySeenAt || now);
            if (overlayAgeMs < 500) {
                return;
            }

            const frame = overlay.querySelector(`iframe[id^="${popupBaseId}"]`);
            const overlayStyle = window.getComputedStyle(overlay);
            const frameStyle = frame ? window.getComputedStyle(frame) : null;
            const frameRect = frame ? frame.getBoundingClientRect() : null;
            const overlayIsHidden = overlay.hidden || overlayStyle.display === 'none' || overlayStyle.visibility === 'hidden' || overlayStyle.opacity === '0';
            const frameIsHidden = !frame || frame.hidden || frameStyle?.display === 'none' || frameStyle?.visibility === 'hidden' || frameRect?.width === 0 || frameRect?.height === 0;

            if (overlayIsHidden || frameIsHidden) {
                overlay.remove();
            }
        });
    };

    const watchFreeJournalPopupCleanup = function () {
        if (!document.body) {
            return;
        }

        const observer = new MutationObserver(function () {
            window.requestAnimationFrame(cleanupClosedFreeJournalPopup);
        });
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['aria-hidden', 'class', 'hidden', 'style'],
            childList: true,
            subtree: true,
        });
        window.addEventListener('message', function () {
            window.setTimeout(cleanupClosedFreeJournalPopup, 100);
        });
    };

    const openFreeJournalPopup = function () {
        const formId = FREE_JOURNAL_FORM_ID;
        const popupBaseId = `popup-${formId}`;
        const popupInstanceId = `${popupBaseId}-${Date.now()}`;

        Array.from(document.querySelectorAll(`iframe[id^="${popupBaseId}"]`)).forEach(function (frame) {
            frame.remove();
        });

        const existingScript = document.getElementById('pxp-free-journal-popup-script');
        if (existingScript) {
            existingScript.remove();
        }

        try {
            Object.keys(window.localStorage).forEach(function (key) {
                if (key.includes(formId) || key.includes(popupBaseId)) {
                    window.localStorage.removeItem(key);
                }
            });
            Object.keys(window.sessionStorage).forEach(function (key) {
                if (key.includes(formId) || key.includes(popupBaseId)) {
                    window.sessionStorage.removeItem(key);
                }
            });
        } catch (error) {
            // Ignore storage cleanup errors in restricted contexts.
        }

        const iframe = document.createElement('iframe');
        iframe.src = 'https://link.poweredxprayers.com/widget/form/Ed7R0udrrYcJrtyRNIZz';
        iframe.style.display = 'none';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '3px';
        iframe.id = popupInstanceId;
        iframe.setAttribute('data-layout', "{'id':'POPUP'}");
        iframe.setAttribute('data-trigger-type', 'alwaysShow');
        iframe.setAttribute('data-trigger-value', '');
        iframe.setAttribute('data-activation-type', 'alwaysActivated');
        iframe.setAttribute('data-activation-value', '');
        iframe.setAttribute('data-deactivation-type', 'neverDeactivate');
        iframe.setAttribute('data-deactivation-value', '');
        iframe.setAttribute('data-form-name', 'Form - Get Your Free Restore Series Journal');
        iframe.setAttribute('data-height', 'undefined');
        iframe.setAttribute('data-layout-iframe-id', popupInstanceId);
        iframe.setAttribute('data-form-id', formId);
        iframe.title = 'Form - Get Your Free Restore Series Journal';
        iframe.setAttribute('data-modal-height', '900');
        document.body.appendChild(iframe);

        const script = document.createElement('script');
        script.id = 'pxp-free-journal-popup-script';
        script.src = `https://link.poweredxprayers.com/js/form_embed.js?v=${Date.now()}`;
        script.async = true;
        document.body.appendChild(script);
    };

    const autoOpenPrayerRequestPopup = function () {
        if (hasAutoPrayerPopupOpened) {
            return;
        }
        hasAutoPrayerPopupOpened = true;
        openPrayerRequestPopup();
    };

    const normalizeYouTubeEmbedUrl = function (value) {
        if (typeof value !== 'string' || !value.trim()) {
            return '';
        }

        try {
            const parsedUrl = new URL(value.trim(), window.location.origin);
            const embedMatch = parsedUrl.pathname.match(/\/embed\/([^/?]+)/);
            const shortMatch = parsedUrl.hostname.includes('youtu.be') ? parsedUrl.pathname.replace('/', '') : '';
            const watchId = parsedUrl.searchParams.get('v');
            const videoId = embedMatch?.[1] || watchId || shortMatch;
            return videoId ? `https://www.youtube.com/embed/${videoId}` : value.trim();
        } catch (error) {
            return value.trim();
        }
    };

    const applyVideoSrc = function (element, value) {
        if (!element || typeof value !== 'string' || !value.trim()) {
            return;
        }

        element.src = normalizeYouTubeEmbedUrl(value);
        element.dataset.adminOverride = 'true';
    };

    const normalizeCssSize = function (value) {
        if (typeof value !== 'string') {
            return '';
        }

        const trimmedValue = value.trim();
        if (!trimmedValue) {
            return '';
        }

        if (/^\d+(\.\d+)?$/.test(trimmedValue)) {
            return `${trimmedValue}px`;
        }

        return trimmedValue;
    };

    const applyFontSizeOverride = function (selector, value) {
        const cssSize = normalizeCssSize(value);
        if (!cssSize) {
            return;
        }

        document.querySelectorAll(selector).forEach(function (element) {
            element.style.fontSize = cssSize;
            element.dataset.adminFontSize = 'true';
        });
    };

    const applyColorOverride = function (selector, value) {
        if (typeof value !== 'string' || !value.trim()) {
            return;
        }

        document.querySelectorAll(selector).forEach(function (element) {
            element.style.color = value.trim();
            element.dataset.adminColor = 'true';
        });
    };

    const applySizeOverride = function (selector, property, value) {
        const cssSize = normalizeCssSize(value);
        if (!cssSize) {
            return;
        }

        document.querySelectorAll(selector).forEach(function (element) {
            element.style[property] = cssSize;
            element.dataset.adminSize = 'true';
        });
    };

    const isAdminVideoEmpty = function (video) {
        if (!video || typeof video !== 'object') {
            return true;
        }

        return ['title', 'date', 'description', 'embedLink', 'previewImage', 'downloadLink', 'downloadText'].every(function (key) {
            return !String(video[key] || '').trim();
        });
    };

    const createVideoCardElement = function (index) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.videoId = `video-${index + 1}`;
        card.dataset.adminCreated = 'true';
        card.innerHTML = '<div class="video-embed"><iframe width="100%" height="300" src="" title="Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><div class="video-card-body"><h3 class="video-title">New Video</h3><p class="video-date"></p><p class="video-description">Add a YouTube link in the editor to auto-fill this video card.</p></div><div class="video-card-footer"><button type="button" class="toggle-description">See more</button><a href="#" class="download-button">Download Study Notes</a></div>';

        const toggle = card.querySelector('.toggle-description');
        const description = card.querySelector('.video-description');
        toggle.addEventListener('click', function () {
            const expanded = description.classList.toggle('expanded');
            toggle.textContent = expanded ? 'See less' : 'See more';
            toggle.setAttribute('aria-expanded', expanded);
        });

        (extraVideoGrid || primaryVideoGrid)?.appendChild(card);
        videoCards = Array.from(document.querySelectorAll('.video-card'));
        return card;
    };

    const resetAdminInlineStyles = function () {
        document.querySelectorAll(adminOverrideSelectors.join(',')).forEach(function (element) {
            element.style.fontSize = '';
            element.style.color = '';
            element.style.padding = '';
            element.style.minHeight = '';
            element.style.width = '';
            element.style.height = '';
            delete element.dataset.adminFontSize;
            delete element.dataset.adminColor;
            delete element.dataset.adminSize;
        });
    };

    const applyAdminContent = function () {
        const activeContent = migrateLegacyDeviceOverrides(getAdminContent());
        const hero = activeContent.hero || {};
        const header = activeContent.header || {};
        const footer = activeContent.footer || {};
        const rss = activeContent.rss || {};
        const videos = Array.isArray(activeContent.videos) ? activeContent.videos : [];
        const textSizes = activeContent.textSizes || {};
        const textColors = activeContent.textColors || {};
        const buttonSizes = activeContent.buttonSizes || {};

        document.documentElement.dataset.adminDevice = forceMobileView ? 'mobile' : 'desktop';
        resetAdminInlineStyles();

        if (typeof activeContent.pageTitle === 'string') {
            document.title = activeContent.pageTitle;
        }
        applyTextOverride('.nav-brand-name', header.brandName);
        applyImageOverride('.brand-icon-image', header.logoSrc);
        applySizeOverride('.brand-icon', 'width', header.logoSize);
        applySizeOverride('.brand-icon', 'height', header.logoSize);
        applyLinkOverride('.nav-shop', header.shopLink);
        applyTextOverride('.hero-title .brand-name', hero.brandName);
        applyTextOverride('.hero-title-line', hero.titleLine);
        applyTextOverride('.hero-description', hero.description);
        applyLinkOverride('.donate-button', hero.donateLink);
        applyLinkOverride('.prayer-button', hero.prayerLink);
        applyTextOverride('.section-title', activeContent.videoSectionTitle);
        applyTextOverride('.footer-brand', footer.brand);
        applyTextOverride('.footer-description', footer.description);
        applyTextOverride('.footer-copyright .brand-name', footer.copyrightBrand);
        applyImageOverride('.footer-pxp-logo', footer.logoSrc);
        applySizeOverride('.footer-pxp-logo', 'width', footer.logoWidth);

        const footerLinks = document.querySelectorAll('.footer-link');
        if (Array.isArray(footer.links)) {
            footer.links.forEach(function (link, index) {
                const element = footerLinks[index];
                if (!element) {
                    return;
                }
                if (typeof link.text === 'string') {
                    element.textContent = link.text;
                }
                if (typeof link.href === 'string') {
                    element.href = link.href;
                }
            });
        }

        const footerActionLinks = document.querySelectorAll('.footer-action-icon');
        if (Array.isArray(footer.actionLinks)) {
            footer.actionLinks.forEach(function (href, index) {
                if (footerActionLinks[index] && typeof href === 'string') {
                    footerActionLinks[index].href = href;
                }
            });
        }

        const socialLinks = document.querySelectorAll('.social-icon');
        if (Array.isArray(footer.socialLinks)) {
            footer.socialLinks.forEach(function (href, index) {
                if (socialLinks[index] && typeof href === 'string') {
                    socialLinks[index].href = href;
                }
            });
        }

        applyTextOverride('.rss-strip-item', rss.title);
        applyLinkOverride('.rss-strip-item', rss.link);
        applyLinkOverride('.rss-strip-source', rss.feedLink);

        applyFontSizeOverride('.nav-brand-name', textSizes.headerBrand);
        applyFontSizeOverride('.nav-shop', textSizes.headerShop);
        applyFontSizeOverride('.hero-title', textSizes.heroTitle);
        applyFontSizeOverride('.hero-title .brand-name', textSizes.heroBrand);
        applyFontSizeOverride('.hero-title-line', textSizes.heroTitleLine);
        applyFontSizeOverride('.hero-description', textSizes.heroDescription);
        applyFontSizeOverride('.donate-button, .cashapp-button, .prayer-button', textSizes.heroButtons);
        applyFontSizeOverride('.hero-featured-date', textSizes.heroDate);
        applyFontSizeOverride('.section-title', textSizes.videoSectionTitle);
        applyFontSizeOverride('.video-title', textSizes.videoTitle);
        applyFontSizeOverride('.video-date', textSizes.videoDate);
        applyFontSizeOverride('.video-description', textSizes.videoDescription);
        applyFontSizeOverride('.toggle-description', textSizes.videoToggle);
        applyFontSizeOverride('.download-button', textSizes.studyNotesButton);
        applyFontSizeOverride('.footer-brand', textSizes.footerBrand);
        applyFontSizeOverride('.footer-description', textSizes.footerDescription);
        applyFontSizeOverride('.footer-link', textSizes.footerLinks);
        applyFontSizeOverride('.footer-copyright', textSizes.footerCopyright);
        applyFontSizeOverride('.rss-strip-item, .rss-strip-source, .rss-strip-label', textSizes.rss);
        applyColorOverride('.nav-brand-name', textColors.headerBrand);
        applyColorOverride('.hero-title', textColors.heroTitle);
        applyColorOverride('.hero-description', textColors.heroDescription);
        applyColorOverride('.donate-button, .cashapp-button, .prayer-button', textColors.heroButtons);
        applyColorOverride('.section-title', textColors.videoSectionTitle);
        applyColorOverride('.video-title', textColors.videoTitle);
        applyColorOverride('.video-description', textColors.videoDescription);
        applyColorOverride('.download-button', textColors.studyNotesButton);
        applyColorOverride('.footer-brand', textColors.footerBrand);
        applyColorOverride('.footer-description', textColors.footerDescription);
        applySizeOverride('.donate-button, .cashapp-button, .prayer-button', 'padding', buttonSizes.heroButtonsPadding);
        applySizeOverride('.download-button', 'padding', buttonSizes.studyNotesButtonPadding);
        applySizeOverride('.donate-button, .cashapp-button, .prayer-button', 'minHeight', buttonSizes.heroButtonsMinHeight);
        applySizeOverride('.download-button', 'minHeight', buttonSizes.studyNotesButtonMinHeight);

        videos.forEach(function (video, index) {
            if (isAdminVideoEmpty(video)) {
                const emptyCard = videoCards[index];
                if (emptyCard?.dataset.adminCreated === 'true') {
                    emptyCard.hidden = true;
                }
                return;
            }

            const card = videoCards[index] || createVideoCardElement(index);
            if (!card) {
                return;
            }
            card.hidden = false;

            const iframe = card.querySelector('.video-embed iframe');
            const previewLink = card.querySelector('.video-preview-link');
            const previewImage = card.querySelector('.video-preview-link img');
            const title = card.querySelector('.video-title');
            const date = card.querySelector('.video-date');
            const description = card.querySelector('.video-description');
            const download = card.querySelector('.download-button');

            if (typeof video.title === 'string' && title) {
                title.textContent = video.title;
                card.dataset.adminTitle = 'true';
            }
            if (typeof video.date === 'string' && date) {
                date.textContent = video.date;
                card.dataset.adminDate = 'true';
            }
            if (typeof video.description === 'string' && description) {
                description.textContent = video.description;
                card.dataset.adminDescription = 'true';
            }
            if (typeof video.embedLink === 'string') {
                applyVideoSrc(iframe, video.embedLink);
                if (previewLink) {
                    previewLink.href = video.embedLink;
                    previewLink.dataset.adminOverride = 'true';
                }
            }
            if (typeof video.embedLink === 'string' && iframe && title) {
                iframe.title = title.textContent.trim() || 'Video';
            }
            if (typeof video.previewImage === 'string' && previewImage) {
                previewImage.src = video.previewImage;
            }
            if (typeof video.downloadLink === 'string' && download) {
                download.href = video.downloadLink;
                download.dataset.adminOverride = 'true';
            }
            if (typeof video.downloadText === 'string' && download) {
                download.textContent = video.downloadText;
                download.dataset.adminLabel = 'true';
            }
            if (typeof video.titleSize === 'string' && title) {
                title.style.fontSize = normalizeCssSize(video.titleSize);
            }
            if (typeof video.dateSize === 'string' && date) {
                date.style.fontSize = normalizeCssSize(video.dateSize);
            }
            if (typeof video.descriptionSize === 'string' && description) {
                description.style.fontSize = normalizeCssSize(video.descriptionSize);
            }
            if (typeof video.downloadTextSize === 'string' && download) {
                download.style.fontSize = normalizeCssSize(video.downloadTextSize);
            }
        });
    };

    const getFieldValue = function (selector, attribute = 'text') {
        const element = document.querySelector(selector);
        if (!element) {
            return '';
        }
        return attribute === 'href' || attribute === 'src' ? element.getAttribute(attribute) || '' : element.textContent.trim();
    };

    const getVideoFieldValue = function (card, selector, attribute = 'text') {
        const element = card.querySelector(selector);
        if (!element) {
            return '';
        }
        return attribute === 'href' || attribute === 'src' ? element.getAttribute(attribute) || '' : element.textContent.trim();
    };

    const getComputedFontSize = function (selector) {
        const element = document.querySelector(selector);
        if (!element) {
            return '';
        }
        return window.getComputedStyle(element).fontSize || '';
    };

    const getComputedStyleValue = function (selector, property) {
        const element = document.querySelector(selector);
        if (!element) {
            return '';
        }
        return window.getComputedStyle(element)[property] || '';
    };

    const getComputedPadding = function (selector) {
        const element = document.querySelector(selector);
        if (!element) {
            return '';
        }

        const style = window.getComputedStyle(element);
        return `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`;
    };

    const getVideoFontSize = function (card, selector) {
        const element = card.querySelector(selector);
        if (!element) {
            return '';
        }
        return window.getComputedStyle(element).fontSize || '';
    };

    const getCurrentContentSnapshot = function () {
        const footerLinks = Array.from(document.querySelectorAll('.footer-link')).map(function (link) {
            return {
                text: link.textContent.trim(),
                href: link.getAttribute('href') || '',
            };
        });
        const footerActionLinks = Array.from(document.querySelectorAll('.footer-action-icon')).map(function (link) {
            return link.getAttribute('href') || '';
        });
        const socialLinks = Array.from(document.querySelectorAll('.social-icon')).map(function (link) {
            return link.getAttribute('href') || '';
        });

        return {
            pageTitle: document.title,
            header: {
                brandName: getFieldValue('.nav-brand-name'),
                logoSrc: getFieldValue('.brand-icon-image', 'src'),
                logoSize: getComputedStyleValue('.brand-icon', 'width'),
                shopLink: getFieldValue('.nav-shop', 'href'),
            },
            hero: {
                brandName: getFieldValue('.hero-title .brand-name'),
                titleLine: getFieldValue('.hero-title-line'),
                description: getFieldValue('.hero-description'),
                donateLink: getFieldValue('.donate-button', 'href'),
                prayerLink: getFieldValue('.prayer-button', 'href'),
            },
            videoSectionTitle: getFieldValue('.section-title'),
            textSizes: {
                headerBrand: getComputedFontSize('.nav-brand-name'),
                headerShop: getComputedFontSize('.nav-shop'),
                heroTitle: getComputedFontSize('.hero-title'),
                heroBrand: getComputedFontSize('.hero-title .brand-name'),
                heroTitleLine: getComputedFontSize('.hero-title-line'),
                heroDescription: getComputedFontSize('.hero-description'),
                heroButtons: getComputedFontSize('.donate-button'),
                heroDate: getComputedFontSize('.hero-featured-date'),
                videoSectionTitle: getComputedFontSize('.section-title'),
                videoTitle: getComputedFontSize('.video-title'),
                videoDate: getComputedFontSize('.video-date'),
                videoDescription: getComputedFontSize('.video-description'),
                videoToggle: getComputedFontSize('.toggle-description'),
                studyNotesButton: getComputedFontSize('.download-button'),
                footerBrand: getComputedFontSize('.footer-brand'),
                footerDescription: getComputedFontSize('.footer-description'),
                footerLinks: getComputedFontSize('.footer-link'),
                footerCopyright: getComputedFontSize('.footer-copyright'),
                rss: getComputedFontSize('.rss-strip-item'),
            },
            textColors: {
                headerBrand: getComputedStyleValue('.nav-brand-name', 'color'),
                heroTitle: getComputedStyleValue('.hero-title', 'color'),
                heroDescription: getComputedStyleValue('.hero-description', 'color'),
                heroButtons: getComputedStyleValue('.donate-button', 'color'),
                videoSectionTitle: getComputedStyleValue('.section-title', 'color'),
                videoTitle: getComputedStyleValue('.video-title', 'color'),
                videoDescription: getComputedStyleValue('.video-description', 'color'),
                studyNotesButton: getComputedStyleValue('.download-button', 'color'),
                footerBrand: getComputedStyleValue('.footer-brand', 'color'),
                footerDescription: getComputedStyleValue('.footer-description', 'color'),
            },
            buttonSizes: {
                heroButtonsPadding: getComputedPadding('.donate-button'),
                studyNotesButtonPadding: getComputedPadding('.download-button'),
                heroButtonsMinHeight: getComputedStyleValue('.donate-button', 'minHeight'),
                studyNotesButtonMinHeight: getComputedStyleValue('.download-button', 'minHeight'),
            },
            videos: Array.from(videoCards).map(function (card) {
                return {
                    title: getVideoFieldValue(card, '.video-title'),
                    date: getVideoFieldValue(card, '.video-date'),
                    description: getVideoFieldValue(card, '.video-description'),
                    embedLink: getVideoFieldValue(card, '.video-embed iframe', 'src') || getVideoFieldValue(card, '.video-preview-link', 'href'),
                    previewImage: getVideoFieldValue(card, '.video-preview-link img', 'src'),
                    downloadLink: getVideoFieldValue(card, '.download-button', 'href'),
                    downloadText: getVideoFieldValue(card, '.download-button'),
                    titleSize: getVideoFontSize(card, '.video-title'),
                    dateSize: getVideoFontSize(card, '.video-date'),
                    descriptionSize: getVideoFontSize(card, '.video-description'),
                    downloadTextSize: getVideoFontSize(card, '.download-button'),
                };
            }),
            footer: {
                brand: getFieldValue('.footer-brand'),
                description: getFieldValue('.footer-description'),
                copyrightBrand: getFieldValue('.footer-copyright .brand-name'),
                logoSrc: getFieldValue('.footer-pxp-logo', 'src'),
                logoWidth: getComputedStyleValue('.footer-pxp-logo', 'width'),
                links: footerLinks,
                actionLinks: footerActionLinks,
                socialLinks: socialLinks,
            },
            rss: {
                title: getFieldValue('.rss-strip-item'),
                link: getFieldValue('.rss-strip-item', 'href'),
                feedLink: getFieldValue('.rss-strip-source', 'href'),
            },
        };
    };

    const getAdminSnapshotForScope = function () {
        const liveSnapshot = getCurrentContentSnapshot();
        const savedContent = migrateLegacyDeviceOverrides(getAdminContent());
        return deepMerge(liveSnapshot, savedContent);
    };

    const updateAdminPreview = function (control, preview, previewType) {
        if (!preview || !previewType) {
            return;
        }

        const value = control.value.trim();
        preview.removeAttribute('style');

        if (previewType === 'fontSize') {
            preview.textContent = value || 'Text size preview';
            if (value) {
                preview.style.fontSize = normalizeCssSize(value);
            }
            return;
        }

        if (previewType === 'color') {
            preview.textContent = value || 'Color preview';
            if (value) {
                preview.style.color = value;
                preview.style.borderColor = value;
            }
            return;
        }

        if (previewType === 'buttonSize') {
            preview.textContent = value || 'Button size preview';
            if (value) {
                preview.style.padding = normalizeCssSize(value);
            }
            return;
        }

        if (previewType === 'buttonHeight') {
            preview.textContent = value || 'Button height preview';
            if (value) {
                preview.style.minHeight = normalizeCssSize(value);
            }
        }
    };

    const createAdminField = function (name, label, value, type = 'input', previewType = '') {
        const field = document.createElement('label');
        field.className = 'admin-field';
        const labelText = document.createElement('span');
        labelText.textContent = label;
        const control = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
        control.name = name;
        control.value = value || '';
        if (type !== 'textarea') {
            control.type = 'text';
        }
        field.append(labelText, control);
        if (previewType) {
            const preview = document.createElement('span');
            preview.className = `admin-field-preview admin-field-preview-${previewType}`;
            field.appendChild(preview);
            updateAdminPreview(control, preview, previewType);
            control.addEventListener('input', function () {
                updateAdminPreview(control, preview, previewType);
            });
        }
        return field;
    };

    const createAdminImageUploadField = function (targetName, label, value) {
        const field = document.createElement('label');
        field.className = 'admin-field admin-image-upload-field';

        const labelText = document.createElement('span');
        labelText.textContent = label;

        const control = document.createElement('input');
        control.type = 'file';
        control.accept = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';

        const preview = document.createElement('img');
        preview.className = 'admin-image-upload-preview';
        preview.alt = '';
        if (value) {
            preview.src = value;
        }

        const status = document.createElement('span');
        status.className = 'admin-image-upload-status';
        status.textContent = 'Choose an image, then save changes.';

        control.addEventListener('change', function () {
            const file = control.files && control.files[0];
            if (!file) {
                return;
            }

            if (!file.type.startsWith('image/')) {
                status.textContent = 'Please choose an image file.';
                return;
            }

            if (file.size > 1800000) {
                status.textContent = 'This image is large. A smaller image will save more reliably.';
            } else {
                status.textContent = 'Image loaded. Save changes to keep it.';
            }

            const reader = new FileReader();
            reader.addEventListener('load', function () {
                const result = typeof reader.result === 'string' ? reader.result : '';
                const target = field.closest('form')?.elements[targetName];
                if (target && result) {
                    target.value = result;
                    target.dispatchEvent(new Event('input', { bubbles: true }));
                }
                if (result) {
                    preview.src = result;
                }
            });
            reader.readAsDataURL(file);
        });

        field.append(labelText, control, preview, status);
        return field;
    };

    const createAdminVideoGroup = function (video, index, open = false) {
        const group = document.createElement('details');
        group.className = 'admin-video-group';
        group.dataset.videoIndex = String(index);
        group.open = open;

        const summary = document.createElement('summary');
        summary.textContent = `${index + 1}. ${video.title || 'New Video Card'}`;

        const embedField = createAdminField(`videos.${index}.embedLink`, 'Embedded/watch link', video.embedLink);
        const embedInput = embedField.querySelector('input');
        const titleField = createAdminField(`videos.${index}.title`, 'Title', video.title);
        const titleInput = titleField.querySelector('input');
        const dateField = createAdminField(`videos.${index}.date`, 'Date text', video.date);
        const dateInput = dateField.querySelector('input');
        const descriptionField = createAdminField(`videos.${index}.description`, 'Description', video.description, 'textarea');
        const descriptionInput = descriptionField.querySelector('textarea');
        const previewField = createAdminField(`videos.${index}.previewImage`, 'Preview image link', video.previewImage);
        const previewInput = previewField.querySelector('input');
        const autoFillStatus = document.createElement('p');
        autoFillStatus.className = 'admin-video-autofill-status';

        const autoFillFromYouTube = function () {
            const videoId = extractYouTubeVideoId(embedInput.value);
            if (!videoId) {
                autoFillStatus.textContent = '';
                return;
            }

            autoFillStatus.textContent = 'Fetching YouTube details...';
            if (previewInput && !previewInput.value.trim()) {
                previewInput.value = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }

            fetchYouTubeMetadata(videoId).then(function (metadata) {
                if (!metadata) {
                    autoFillStatus.textContent = 'Could not auto-fill from YouTube. You can still edit manually.';
                    return;
                }

                if (titleInput && metadata.title) {
                    titleInput.value = metadata.title;
                    summary.textContent = `${index + 1}. ${metadata.title}`;
                }

                const normalizedDescription = normalizeYouTubeDescription(metadata.description || '');
                if (descriptionInput && normalizedDescription) {
                    descriptionInput.value = normalizedDescription;
                }

                const formattedDate = formatPostedDate(metadata.publishedAt);
                if (dateInput && formattedDate) {
                    dateInput.value = `Uploaded: ${formattedDate}`;
                }

                autoFillStatus.textContent = 'YouTube details loaded. Save changes to publish this card.';
            });
        };

        embedInput.addEventListener('change', autoFillFromYouTube);
        embedInput.addEventListener('blur', autoFillFromYouTube);

        group.append(
            summary,
            embedField,
            autoFillStatus,
            titleField,
            dateField,
            descriptionField,
            previewField,
            createAdminField(`videos.${index}.downloadLink`, 'Study notes/download link', video.downloadLink),
            createAdminField(`videos.${index}.downloadText`, 'Study notes button text', video.downloadText || 'Download Study Notes'),
            createAdminField(`videos.${index}.titleSize`, 'Title size', video.titleSize, 'input', 'fontSize'),
            createAdminField(`videos.${index}.dateSize`, 'Date size', video.dateSize, 'input', 'fontSize'),
            createAdminField(`videos.${index}.descriptionSize`, 'Description size', video.descriptionSize, 'input', 'fontSize'),
            createAdminField(`videos.${index}.downloadTextSize`, 'Study notes button text size', video.downloadTextSize, 'input', 'fontSize')
        );

        return group;
    };

    const createAdminSection = function (title) {
        const section = document.createElement('section');
        section.className = 'admin-editor-section';
        const heading = document.createElement('h3');
        heading.textContent = title;
        section.appendChild(heading);
        return section;
    };

    const createAdminOverlay = function () {
        const existingOverlay = document.querySelector('.admin-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const snapshot = getAdminSnapshotForScope();
        const overlay = document.createElement('div');
        overlay.className = 'admin-overlay';
        overlay.innerHTML = '<div class="admin-panel" role="dialog" aria-modal="true" aria-labelledby="admin-title"><div class="admin-panel-header"><div><p class="admin-kicker">Private Admin</p><h2 id="admin-title">Edit Website Content</h2><p class="admin-device-note"></p></div><button type="button" class="admin-close" aria-label="Close admin editor">x</button></div><form class="admin-form"></form></div>';

        const form = overlay.querySelector('.admin-form');
        const closeButton = overlay.querySelector('.admin-close');
        const deviceNote = overlay.querySelector('.admin-device-note');
        deviceNote.textContent = 'You are editing one shared website content source for both desktop and mobile browsers.';

        const heroSection = createAdminSection('Hero');
        heroSection.append(
            createAdminField('hero.brandName', 'Brand title', snapshot.hero.brandName),
            createAdminField('hero.titleLine', 'Hero title line', snapshot.hero.titleLine),
            createAdminField('hero.description', 'Hero description', snapshot.hero.description, 'textarea'),
            createAdminField('hero.donateLink', 'Donate link', snapshot.hero.donateLink),
            createAdminField('hero.prayerLink', 'Prayer request link', snapshot.hero.prayerLink)
        );

        const headerSection = createAdminSection('Header');
        headerSection.append(
            createAdminField('pageTitle', 'Browser tab title', snapshot.pageTitle),
            createAdminField('header.brandName', 'Header brand text', snapshot.header.brandName),
            createAdminField('header.logoSrc', 'Header logo image link', snapshot.header.logoSrc),
            createAdminImageUploadField('header.logoSrc', 'Upload header logo', snapshot.header.logoSrc),
            createAdminField('header.logoSize', 'Header logo size', snapshot.header.logoSize, 'input', 'buttonHeight'),
            createAdminField('header.shopLink', 'Shop link', snapshot.header.shopLink),
            createAdminField('videoSectionTitle', 'Video section title', snapshot.videoSectionTitle)
        );

        const textSizeSection = createAdminSection('Text Sizes');
        textSizeSection.append(
            createAdminField('textSizes.headerBrand', 'Header brand size', snapshot.textSizes.headerBrand, 'input', 'fontSize'),
            createAdminField('textSizes.headerShop', 'Shop link size', snapshot.textSizes.headerShop, 'input', 'fontSize'),
            createAdminField('textSizes.heroTitle', 'Full hero title size', snapshot.textSizes.heroTitle, 'input', 'fontSize'),
            createAdminField('textSizes.heroBrand', 'Hero brand name size', snapshot.textSizes.heroBrand, 'input', 'fontSize'),
            createAdminField('textSizes.heroTitleLine', 'Hero title line size', snapshot.textSizes.heroTitleLine, 'input', 'fontSize'),
            createAdminField('textSizes.heroDescription', 'Hero description size', snapshot.textSizes.heroDescription, 'input', 'fontSize'),
            createAdminField('textSizes.heroButtons', 'Hero button text size', snapshot.textSizes.heroButtons, 'input', 'fontSize'),
            createAdminField('textSizes.heroDate', 'Hero video date size', snapshot.textSizes.heroDate, 'input', 'fontSize'),
            createAdminField('textSizes.videoSectionTitle', 'Video section title size', snapshot.textSizes.videoSectionTitle, 'input', 'fontSize'),
            createAdminField('textSizes.videoTitle', 'All video title size', snapshot.textSizes.videoTitle, 'input', 'fontSize'),
            createAdminField('textSizes.videoDate', 'All video date size', snapshot.textSizes.videoDate, 'input', 'fontSize'),
            createAdminField('textSizes.videoDescription', 'All video description size', snapshot.textSizes.videoDescription, 'input', 'fontSize'),
            createAdminField('textSizes.videoToggle', 'See more text size', snapshot.textSizes.videoToggle, 'input', 'fontSize'),
            createAdminField('textSizes.studyNotesButton', 'All study notes button size', snapshot.textSizes.studyNotesButton, 'input', 'fontSize'),
            createAdminField('textSizes.footerBrand', 'Footer brand size', snapshot.textSizes.footerBrand, 'input', 'fontSize'),
            createAdminField('textSizes.footerDescription', 'Footer description size', snapshot.textSizes.footerDescription, 'input', 'fontSize'),
            createAdminField('textSizes.footerLinks', 'Footer links size', snapshot.textSizes.footerLinks, 'input', 'fontSize'),
            createAdminField('textSizes.footerCopyright', 'Footer copyright size', snapshot.textSizes.footerCopyright, 'input', 'fontSize'),
            createAdminField('textSizes.rss', 'RSS strip text size', snapshot.textSizes.rss, 'input', 'fontSize')
        );

        const colorSection = createAdminSection('Text Colors');
        colorSection.append(
            createAdminField('textColors.headerBrand', 'Header brand color', snapshot.textColors.headerBrand, 'input', 'color'),
            createAdminField('textColors.heroTitle', 'Hero title color', snapshot.textColors.heroTitle, 'input', 'color'),
            createAdminField('textColors.heroDescription', 'Hero description color', snapshot.textColors.heroDescription, 'input', 'color'),
            createAdminField('textColors.heroButtons', 'Hero button text color', snapshot.textColors.heroButtons, 'input', 'color'),
            createAdminField('textColors.videoSectionTitle', 'Video section title color', snapshot.textColors.videoSectionTitle, 'input', 'color'),
            createAdminField('textColors.videoTitle', 'Video title color', snapshot.textColors.videoTitle, 'input', 'color'),
            createAdminField('textColors.videoDescription', 'Video description color', snapshot.textColors.videoDescription, 'input', 'color'),
            createAdminField('textColors.studyNotesButton', 'Study notes button text color', snapshot.textColors.studyNotesButton, 'input', 'color'),
            createAdminField('textColors.footerBrand', 'Footer brand color', snapshot.textColors.footerBrand, 'input', 'color'),
            createAdminField('textColors.footerDescription', 'Footer description color', snapshot.textColors.footerDescription, 'input', 'color')
        );

        const buttonSizeSection = createAdminSection('Button Sizes');
        buttonSizeSection.append(
            createAdminField('buttonSizes.heroButtonsPadding', 'Hero button padding', snapshot.buttonSizes.heroButtonsPadding, 'input', 'buttonSize'),
            createAdminField('buttonSizes.heroButtonsMinHeight', 'Hero button minimum height', snapshot.buttonSizes.heroButtonsMinHeight, 'input', 'buttonHeight'),
            createAdminField('buttonSizes.studyNotesButtonPadding', 'Study notes button padding', snapshot.buttonSizes.studyNotesButtonPadding, 'input', 'buttonSize'),
            createAdminField('buttonSizes.studyNotesButtonMinHeight', 'Study notes button minimum height', snapshot.buttonSizes.studyNotesButtonMinHeight, 'input', 'buttonHeight')
        );

        const videosSection = createAdminSection('Videos');
        const addVideoButton = document.createElement('button');
        addVideoButton.type = 'button';
        addVideoButton.className = 'admin-add-video';
        addVideoButton.textContent = 'Add Video Card';
        videosSection.appendChild(addVideoButton);

        let renderedVideoGroups = 0;
        snapshot.videos.forEach(function (video, index) {
            if (isAdminVideoEmpty(video)) {
                return;
            }

            videosSection.appendChild(createAdminVideoGroup(video, index, renderedVideoGroups === 0));
            renderedVideoGroups += 1;
        });

        addVideoButton.addEventListener('click', function () {
            const existingGroups = Array.from(videosSection.querySelectorAll('.admin-video-group'));
            const nextIndex = existingGroups.reduce(function (maxIndex, group) {
                return Math.max(maxIndex, Number(group.dataset.videoIndex || -1));
            }, snapshot.videos.length - 1) + 1;
            const nextGroup = createAdminVideoGroup({
                title: '',
                date: '',
                description: '',
                embedLink: '',
                previewImage: '',
                downloadLink: studyNotesFolderUrl,
                downloadText: 'Download Study Notes',
                titleSize: snapshot.textSizes.videoTitle,
                dateSize: snapshot.textSizes.videoDate,
                descriptionSize: snapshot.textSizes.videoDescription,
                downloadTextSize: snapshot.textSizes.studyNotesButton,
            }, nextIndex, true);
            videosSection.appendChild(nextGroup);
            nextGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        const footerSection = createAdminSection('Footer and RSS');
        footerSection.append(
            createAdminField('footer.brand', 'Footer brand', snapshot.footer.brand),
            createAdminField('footer.description', 'Footer description', snapshot.footer.description, 'textarea'),
            createAdminField('footer.copyrightBrand', 'Copyright brand', snapshot.footer.copyrightBrand),
            createAdminField('footer.logoSrc', 'Footer logo image link', snapshot.footer.logoSrc),
            createAdminImageUploadField('footer.logoSrc', 'Upload footer logo', snapshot.footer.logoSrc),
            createAdminField('footer.logoWidth', 'Footer logo width', snapshot.footer.logoWidth),
            createAdminField('rss.title', 'RSS text', snapshot.rss.title),
            createAdminField('rss.link', 'RSS item link', snapshot.rss.link),
            createAdminField('rss.feedLink', 'RSS feed link', snapshot.rss.feedLink)
        );

        snapshot.footer.links.forEach(function (link, index) {
            footerSection.append(
                createAdminField(`footer.links.${index}.text`, `Footer link ${index + 1} text`, link.text),
                createAdminField(`footer.links.${index}.href`, `Footer link ${index + 1} URL`, link.href)
            );
        });

        snapshot.footer.actionLinks.forEach(function (href, index) {
            footerSection.append(createAdminField(`footer.actionLinks.${index}`, `Footer action ${index + 1} link`, href));
        });

        snapshot.footer.socialLinks.forEach(function (href, index) {
            footerSection.append(createAdminField(`footer.socialLinks.${index}`, `Social icon ${index + 1} link`, href));
        });

        const actions = document.createElement('div');
        actions.className = 'admin-actions';
        actions.innerHTML = '<button type="submit" class="admin-save">Save Changes</button><button type="button" class="admin-export">Export JSON</button><button type="button" class="admin-import">Import JSON</button><button type="button" class="admin-reset">Reset Local Edits</button><span class="admin-status" role="status"></span>';

        form.append(headerSection, heroSection, textSizeSection, colorSection, buttonSizeSection, videosSection, footerSection, actions);
        document.body.appendChild(overlay);

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const formContent = {};
            Array.from(form.elements).forEach(function (element) {
                if (!element.name) {
                    return;
                }
                setNestedValue(formContent, element.name, element.value.trim());
            });
            const status = overlay.querySelector('.admin-status');
            status.textContent = 'Saving...';
            const nextContent = formContent;

            saveAdminContent(nextContent);
            applyAdminContent();
            status.textContent = 'Saved on this browser.';
        });

        overlay.querySelector('.admin-export').addEventListener('click', function () {
            window.prompt('Admin content JSON:', JSON.stringify(getAdminContent(), null, 2));
        });

        overlay.querySelector('.admin-import').addEventListener('click', function () {
            const json = window.prompt('Paste admin content JSON:');
            if (!json) {
                return;
            }
            try {
                saveAdminContent(JSON.parse(json));
                window.location.reload();
            } catch (error) {
                overlay.querySelector('.admin-status').textContent = 'That JSON could not be imported.';
            }
        });

        overlay.querySelector('.admin-reset').addEventListener('click', function () {
            if (!window.confirm('Reset saved admin edits on this browser?')) {
                return;
            }
            window.localStorage.removeItem(ADMIN_STORAGE_KEY);
            window.location.reload();
        });

        closeButton.addEventListener('click', function () {
            overlay.remove();
        });

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                overlay.remove();
            }
        });
    };

    const openAdminLogin = function () {
        if (window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
            createAdminOverlay();
            return;
        }

        const password = window.prompt('Admin password:');
        if (password === ADMIN_PASSWORD) {
            window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
            createAdminOverlay();
            return;
        }

        if (password !== null) {
            window.alert('Incorrect password.');
        }
    };

    const attachSecretAdminTrigger = function () {
        const trigger = document.querySelector('.nav-brand') || document.querySelector('.footer-pxp-logo');
        if (!trigger) {
            return;
        }

        let clickCount = 0;
        let clickTimer = null;
        trigger.addEventListener('click', function (event) {
            event.preventDefault();
            clickCount += 1;
            window.clearTimeout(clickTimer);
            clickTimer = window.setTimeout(function () {
                clickCount = 0;
            }, 900);

            if (clickCount >= 3) {
                clickCount = 0;
                window.clearTimeout(clickTimer);
                openAdminLogin();
            }
        });
    };

    await initializeAdminContent();
    applyAdminContent();
    attachSecretAdminTrigger();
    watchFreeJournalPopupCleanup();
    prayerRequestTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', function (event) {
            event.preventDefault();
            openPrayerRequestPopup();
        });
    });

    const freeJournalPopupSelector = '.free-journal-popup-trigger, .focus-hero-book-link';
    document.querySelectorAll(freeJournalPopupSelector).forEach(function (trigger) {
        trigger.setAttribute('href', '#');
        trigger.removeAttribute('target');
        trigger.removeAttribute('rel');
    });

    document.addEventListener('click', function (event) {
        const trigger = event.target.closest(freeJournalPopupSelector);
        if (!trigger) {
            return;
        }

        event.preventDefault();
        openFreeJournalPopup();
    });

    if (AUTO_FREE_JOURNAL_POPUP_DELAY_MS !== null) {
        window.setTimeout(function () {
            openFreeJournalPopup();
        }, AUTO_FREE_JOURNAL_POPUP_DELAY_MS);
    }

    if (AUTO_PRAYER_POPUP_DELAY_MS !== null) {
        window.setTimeout(function () {
            autoOpenPrayerRequestPopup();
        }, AUTO_PRAYER_POPUP_DELAY_MS);
    }

    const setShareButtonFeedback = function (message, timeoutMs) {
        if (!shareButton) {
            return;
        }

        const defaultLabel = 'Share this website';
        shareButton.setAttribute('aria-label', message);
        shareButton.setAttribute('title', message);

        window.setTimeout(function () {
            shareButton.setAttribute('aria-label', defaultLabel);
            shareButton.setAttribute('title', defaultLabel);
        }, timeoutMs);
    };

    const extractYouTubeVideoId = function (src) {
        if (!src) {
            return null;
        }

        try {
            const parsedUrl = new URL(src, window.location.origin);
            const embedMatch = parsedUrl.pathname.match(/\/embed\/([^/?]+)/);
            if (embedMatch && embedMatch[1]) {
                return embedMatch[1];
            }

            if (parsedUrl.hostname.includes('youtu.be')) {
                return parsedUrl.pathname.replace('/', '') || null;
            }

            const watchId = parsedUrl.searchParams.get('v');
            return watchId || null;
        } catch (error) {
            return null;
        }
    };

    const formatPostedDate = function (isoDate) {
        const parsedDate = new Date(isoDate);
        if (Number.isNaN(parsedDate.getTime())) {
            return null;
        }

        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(parsedDate);
    };

    const isTuesdayUploadDate = function (isoDate) {
        const parsedDate = new Date(isoDate);
        if (Number.isNaN(parsedDate.getTime())) {
            return false;
        }
        const weekday = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            timeZone: uploadScheduleTimeZone,
        }).format(parsedDate);
        return weekday === 'Tuesday';
    };

    const formatUploadDateLabel = function (isoDate) {
        const formattedDate = formatPostedDate(isoDate);
        return formattedDate ? `Uploaded: ${formattedDate}` : '';
    };

    const normalizeYouTubeDescription = function (descriptionText) {
        if (!descriptionText) {
            return '';
        }

        return descriptionText.replace(/\s+/g, ' ').trim();
    };

    const getYouTubeWatchUrl = function (videoId) {
        return videoId ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}` : '';
    };

    const getYouTubeThumbnailUrl = function (videoId) {
        return videoId ? `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg` : '';
    };

    const setHeroFeaturedIframe = function (videoId, titleText) {
        if (!heroFeaturedMedia || !videoId) {
            return;
        }

        const safeTitle = titleText || 'Latest upload from PoweredXPrayers';
        heroFeaturedMedia.innerHTML = `<iframe width="100%" height="300" src="https://www.youtube.com/embed/${encodeURIComponent(videoId)}" title="${safeTitle.replace(/"/g, '&quot;')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        heroFeaturedIframe = heroFeaturedMedia.querySelector('iframe');
    };

    const setHeroFeaturedPreview = function (videoId, titleText) {
        if (!heroFeaturedMedia || !videoId) {
            return;
        }

        const safeTitle = titleText || 'Latest upload from PoweredXPrayers';
        const watchUrl = getYouTubeWatchUrl(videoId);
        const thumbnailUrl = getYouTubeThumbnailUrl(videoId);
        const escapedTitle = safeTitle.replace(/"/g, '&quot;');
        heroFeaturedMedia.innerHTML = `<a class="video-preview-link hero-preview-link" href="${watchUrl}" target="_blank" rel="noopener noreferrer" data-youtube-id="${videoId}" aria-label="Watch ${escapedTitle} on YouTube"><img src="${thumbnailUrl}" alt="${escapedTitle} preview" loading="lazy" /><span class="video-preview-play" aria-hidden="true"></span></a>`;
        heroFeaturedIframe = null;
    };

    const normalizeSearchText = function (text) {
        return (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
    };

    const getVideoDatePrefix = function (card) {
        return (card?.dataset?.datePrefix || 'Uploaded').trim() || 'Uploaded';
    };

    const parseVideoCardDate = function (card) {
        const dateText = card.querySelector('.video-date')?.textContent || '';
        const dateMatch = dateText.match(/^(?:Uploaded|Premiered):\s*(.+)$/i);
        if (!dateMatch) {
            return 0;
        }

        const parsedDate = new Date(dateMatch[1]);
        return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
    };

    const sortVideoCardsByDate = function (sortMode = 'newest') {
        if (!primaryVideoGrid || !extraVideoGrid) {
            return;
        }

        videoCards = Array.from(document.querySelectorAll('.video-card'));
        const newestFirst = sortMode !== 'oldest';
        const sortedCards = Array.from(videoCards).sort(function (firstCard, secondCard) {
            const firstTime = parseVideoCardDate(firstCard);
            const secondTime = parseVideoCardDate(secondCard);
            if (!firstTime && !secondTime) {
                return 0;
            }
            if (!firstTime) {
                return 1;
            }
            if (!secondTime) {
                return -1;
            }

            const timeDelta = secondTime - firstTime;
            return newestFirst ? timeDelta : -timeDelta;
        });

        sortedCards.forEach(function (card, index) {
            const targetGrid = index < 8 ? primaryVideoGrid : extraVideoGrid;
            targetGrid.appendChild(card);
        });
    };

    const isPlaceholderVideoCard = function (card, embeddedYouTubeVideoId) {
        return !embeddedYouTubeVideoId;
    };

    const getGoogleDriveId = function (url) {
        if (typeof url !== 'string' || !url.trim()) {
            return '';
        }

        try {
            const parsedUrl = new URL(url.trim(), window.location.origin);
            const fileMatch = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/);
            const folderMatch = parsedUrl.pathname.match(/\/folders\/([^/]+)/);
            return parsedUrl.searchParams.get('id') || fileMatch?.[1] || folderMatch?.[1] || '';
        } catch (error) {
            const idMatch = url.match(/[?&]id=([^&]+)/);
            const fileMatch = url.match(/\/file\/d\/([^/]+)/);
            return decodeURIComponent(idMatch?.[1] || fileMatch?.[1] || '');
        }
    };

    const getStudyNotesPreviewUrl = function (url) {
        if (typeof url !== 'string' || !url.trim() || url.trim() === '#') {
            return '';
        }

        try {
            const parsedUrl = new URL(url.trim(), window.location.origin);
            const driveId = getGoogleDriveId(url);

            if (driveId && parsedUrl.pathname.includes('/folders/')) {
                return `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(driveId)}#list`;
            }

            if (driveId && parsedUrl.hostname.includes('drive.google.com')) {
                return `https://drive.google.com/file/d/${encodeURIComponent(driveId)}/preview`;
            }
        } catch (error) {
            // Fall through to the original link for non-standard URLs.
        }

        return url.trim();
    };

    const getStudyNotesModal = function () {
        let modal = document.querySelector('.study-notes-modal');
        if (modal) {
            return modal;
        }

        modal = document.createElement('div');
        modal.className = 'study-notes-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'study-notes-modal-title');
        modal.hidden = true;
        modal.innerHTML = '<div class="study-notes-modal-backdrop" data-study-notes-close></div><div class="study-notes-modal-panel"><div class="study-notes-modal-header"><h2 id="study-notes-modal-title">Study Notes Preview</h2><button type="button" class="study-notes-modal-close" aria-label="Close study notes preview" data-study-notes-close>&times;</button></div><div class="study-notes-preview-frame-wrap"><iframe class="study-notes-preview-frame" title="Study notes preview" loading="lazy" allow="autoplay"></iframe></div><div class="study-notes-modal-actions"><a href="#" class="study-notes-modal-download">Download</a></div></div>';
        document.body.appendChild(modal);

        modal.addEventListener('click', function (event) {
            if (event.target.closest('[data-study-notes-close]')) {
                closeStudyNotesModal();
            }
        });

        return modal;
    };

    const closeStudyNotesModal = function () {
        const modal = document.querySelector('.study-notes-modal');
        if (!modal) {
            return;
        }

        const iframe = modal.querySelector('.study-notes-preview-frame');
        modal.hidden = true;
        document.body.classList.remove('study-notes-modal-open');
        if (iframe) {
            iframe.src = 'about:blank';
        }
    };

    const openStudyNotesModal = function (button) {
        const downloadUrl = button.dataset.studyNotesDownloadUrl || button.href;
        const previewUrl = getStudyNotesPreviewUrl(downloadUrl);
        if (!previewUrl) {
            return;
        }

        const modal = getStudyNotesModal();
        const iframe = modal.querySelector('.study-notes-preview-frame');
        const downloadLink = modal.querySelector('.study-notes-modal-download');

        iframe.src = previewUrl;
        downloadLink.href = downloadUrl;
        downloadLink.textContent = button.dataset.studyNotesModalDownloadLabel || 'Download';

        if (button.dataset.studyNotesShouldDownload === 'true') {
            downloadLink.setAttribute('download', button.dataset.studyNotesFileName || 'study-notes.pdf');
            downloadLink.setAttribute('target', '_self');
            downloadLink.removeAttribute('rel');
        } else {
            downloadLink.removeAttribute('download');
            downloadLink.setAttribute('target', '_blank');
            downloadLink.setAttribute('rel', 'noopener noreferrer');
        }

        modal.hidden = false;
        document.body.classList.add('study-notes-modal-open');
        modal.querySelector('.study-notes-modal-close')?.focus();
    };

    const syncStudyNotesLink = function (button, url, shouldDownload, videoId) {
        button.href = '#';
        button.dataset.studyNotesDownloadUrl = url;
        button.dataset.studyNotesPreviewUrl = getStudyNotesPreviewUrl(url);
        button.dataset.studyNotesModalDownloadLabel = 'Download';
        button.dataset.studyNotesShouldDownload = shouldDownload ? 'true' : 'false';
        button.dataset.studyNotesFileName = `${videoId}-study-notes.pdf`;
        button.removeAttribute('download');
        button.removeAttribute('target');
        button.removeAttribute('rel');
    };

    const syncUnavailableStudyNotesButton = function (button) {
        button.href = '#';
        button.removeAttribute('download');
        button.removeAttribute('target');
        button.removeAttribute('rel');
        button.dataset.studyNotesUnavailable = 'true';
        delete button.dataset.studyNotesDownloadUrl;
        delete button.dataset.studyNotesPreviewUrl;
    };

    const getEmbeddedYouTubeVideoId = function (card) {
        const iframe = card.querySelector('.video-embed iframe');
        const iframeVideoId = extractYouTubeVideoId(iframe?.getAttribute('src') || '');
        return iframeVideoId || card.dataset.youtubeId || card.querySelector('.video-preview-link')?.dataset.youtubeId || '';
    };

    const syncVideoExpandToggleState = function (visibleCount = null) {
        if (!videosContainer || !videoExpandToggle) {
            return;
        }

        const count = Number.isFinite(visibleCount)
            ? visibleCount
            : videoCards.filter(function (card) {
                return !card.classList.contains('is-filter-hidden');
            }).length;
        const hasSearchQuery = Boolean(videoSearchInput && normalizeSearchText(videoSearchInput.value));
        const collapsed = videosContainer.classList.contains('is-collapsed');

        videoExpandToggle.hidden = hasSearchQuery || count <= 4;
        videoExpandToggle.textContent = collapsed ? 'See more Videos' : 'See less Videos';
        videoExpandToggle.setAttribute('aria-expanded', String(!collapsed));
    };

    const applyVideoSearchFilter = function () {
        if (!videoSearchInput) {
            return;
        }

        const query = normalizeSearchText(videoSearchInput.value);
        let visibleCount = 0;

        videoCards.forEach(function (card) {
            const title = card.querySelector('.video-title')?.textContent || '';
            const date = card.querySelector('.video-date')?.textContent || '';
            const description = card.querySelector('.video-description')?.textContent || '';
            const embedName = card.querySelector('.video-embed iframe')?.getAttribute('title') || card.querySelector('.video-preview-link')?.getAttribute('aria-label') || '';
            const videoName = card.dataset.videoId || '';
            const searchableText = normalizeSearchText(`${title} ${date} ${description} ${embedName} ${videoName}`);
            const isMatch = !query || searchableText.includes(query);

            card.classList.toggle('is-filter-hidden', !isMatch);
            if (isMatch) {
                visibleCount += 1;
            }
        });

        if (videosContainer) {
            videosContainer.classList.toggle('is-searching', Boolean(query));
        }

        syncVideoExpandToggleState(visibleCount);

        if (videoSearchEmpty) {
            videoSearchEmpty.hidden = visibleCount > 0;
        }

    };

    const syncStudyNotesButtonLabels = function () {
        const useCompactLabel = mobileButtonLabelMediaQuery.matches || document.body.classList.contains('force-mobile-view');
        const label = useCompactLabel ? 'Study Notes' : 'Download Study Notes';
        document.querySelectorAll('.download-button').forEach(function (button) {
            if (button.dataset.adminLabel === 'true') {
                return;
            }

            if (button.dataset.studyNotesUnavailableClicked === 'true') {
                button.textContent = unavailableStudyNotesLabel;
                return;
            }

            button.textContent = label;
        });
    };

    const fetchYouTubeRssEntries = async function (channelId) {
        if (!channelId) {
            return [];
        }

        if (youtubeRssEntriesCache.has(channelId)) {
            return youtubeRssEntriesCache.get(channelId);
        }

        const entriesPromise = (async function () {
            try {
                const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
                const response = await fetch(rssUrl);
                if (!response.ok) {
                    return [];
                }

                const xmlText = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

                return Array.from(xmlDoc.getElementsByTagName('entry')).map(function (entry) {
                    const alternateLink = Array.from(entry.getElementsByTagName('link')).find(function (linkNode) {
                        return linkNode.getAttribute('rel') === 'alternate';
                    });
                    return {
                        videoId: entry.getElementsByTagName('yt:videoId')[0]?.textContent?.trim() || '',
                        title: entry.getElementsByTagName('title')[0]?.textContent?.trim() || '',
                        link: alternateLink?.getAttribute('href')?.trim() || '',
                        description: entry.getElementsByTagName('media:description')[0]?.textContent?.trim() || '',
                        publishedAt: entry.getElementsByTagName('published')[0]?.textContent?.trim() || '',
                    };
                }).filter(function (entry) {
                    return Boolean(entry.videoId);
                });
            } catch (error) {
                return [];
            }
        })();

        youtubeRssEntriesCache.set(channelId, entriesPromise);
        return entriesPromise;
    };

    const isYouTubeShortEntry = function (entry) {
        if (!entry || typeof entry !== 'object') {
            return false;
        }

        const entryLink = String(entry.link || '').toLowerCase();
        const entryTitle = String(entry.title || '').toLowerCase();
        return entryLink.includes('/shorts/') || entryTitle.includes('#shorts');
    };

    const fetchYouTubeRssMetadata = async function (videoId, channelId) {
        const rssEntries = await fetchYouTubeRssEntries(channelId);
        const matchingEntry = rssEntries.find(function (entry) {
            return entry.videoId === videoId;
        });

        if (!matchingEntry) {
            return null;
        }

        return {
            title: matchingEntry.title || '',
            description: matchingEntry.description || '',
            channelId: channelId || '',
            publishedAt: matchingEntry.publishedAt || '',
        };
    };

    const fetchYouTubeMetadata = async function (videoId, fallbackChannelId = heroYouTubeChannelId) {
        if (!videoId) {
            return null;
        }

        if (youtubeMetadataCache.has(videoId)) {
            return youtubeMetadataCache.get(videoId);
        }

        const metadataPromise = (async function () {
            if (!youtubeApiKey) {
                return fetchYouTubeRssMetadata(videoId, fallbackChannelId);
            }

            try {
                const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${youtubeApiKey}`;
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    return fetchYouTubeRssMetadata(videoId, fallbackChannelId);
                }

                const payload = await response.json();
                const item = payload?.items?.[0];
                if (!item?.snippet) {
                    return fetchYouTubeRssMetadata(videoId, fallbackChannelId);
                }

                return {
                    title: item.snippet.title || '',
                    description: item.snippet.description || '',
                    channelId: item.snippet.channelId || '',
                    publishedAt: item.snippet.publishedAt || '',
                };
            } catch (error) {
                return fetchYouTubeRssMetadata(videoId, fallbackChannelId);
            }
        })();

        youtubeMetadataCache.set(videoId, metadataPromise);
        return metadataPromise;
    };

    const fetchYouTubeApiJson = async function (url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            return null;
        }
    };

    const resolveChannelId = async function () {
        if (heroYouTubeChannelId) {
            return heroYouTubeChannelId;
        }

        if (!youtubeApiKey) {
            return null;
        }

        const rawHandle = (heroYouTubeHandle || '').trim();
        const normalizedHandle = rawHandle.replace(/^@/, '');
        const normalizedUsername = (heroYouTubeUsername || '').replace(/^@/, '').trim();

        if (rawHandle || normalizedHandle) {
            const handleCandidates = [rawHandle, normalizedHandle].filter(Boolean);
            for (const handleCandidate of handleCandidates) {
                const byHandleUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handleCandidate)}&key=${youtubeApiKey}`;
                const byHandlePayload = await fetchYouTubeApiJson(byHandleUrl);
                const byHandleId = byHandlePayload?.items?.[0]?.id || null;
                if (byHandleId) {
                    return byHandleId;
                }
            }
        }

        if (normalizedUsername) {
            const byUsernameUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${encodeURIComponent(normalizedUsername)}&key=${youtubeApiKey}`;
            const byUsernamePayload = await fetchYouTubeApiJson(byUsernameUrl);
            const byUsernameId = byUsernamePayload?.items?.[0]?.id || null;
            if (byUsernameId) {
                return byUsernameId;
            }
        }

        if (normalizedHandle) {
            const bySearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(`${normalizedHandle} channel`)}&key=${youtubeApiKey}`;
            const bySearchPayload = await fetchYouTubeApiJson(bySearchUrl);
            const bySearchId = bySearchPayload?.items?.[0]?.id?.channelId || bySearchPayload?.items?.[0]?.snippet?.channelId || null;
            if (bySearchId) {
                return bySearchId;
            }
        }

        return null;
    };

    const resolveChannelIdFromHeroVideo = async function () {
        if (!heroFeaturedIframe) {
            return null;
        }

        const heroVideoId = extractYouTubeVideoId(heroFeaturedIframe.getAttribute('src') || '');
        if (!heroVideoId) {
            return null;
        }

        const heroMetadata = await fetchYouTubeMetadata(heroVideoId);
        return heroMetadata?.channelId || null;
    };

    const getLatestVideoIdFromYouTubeRss = async function (channelId) {
        if (!channelId) {
            return null;
        }

        try {
            const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
            const response = await fetch(rssUrl);
            if (!response.ok) {
                return null;
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
            const videoIdNode = xmlDoc.getElementsByTagName('yt:videoId')[0];
            const publishedNode = xmlDoc.getElementsByTagName('published')[0];
            const videoId = videoIdNode?.textContent?.trim() || null;

            if (!videoId) {
                return null;
            }

            return {
                videoId: videoId,
                publishedAt: publishedNode?.textContent?.trim() || '',
            };
        } catch (error) {
            return null;
        }
    };

    const getLatestVideoIdFromYouTubeRssByUser = async function (username) {
        if (!username) {
            return null;
        }

        try {
            const rssUrl = `https://www.youtube.com/feeds/videos.xml?user=${encodeURIComponent(username)}`;
            const response = await fetch(rssUrl);
            if (!response.ok) {
                return null;
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
            const videoIdNode = xmlDoc.getElementsByTagName('yt:videoId')[0];
            const publishedNode = xmlDoc.getElementsByTagName('published')[0];
            const videoId = videoIdNode?.textContent?.trim() || null;

            if (!videoId) {
                return null;
            }

            return {
                videoId: videoId,
                publishedAt: publishedNode?.textContent?.trim() || '',
            };
        } catch (error) {
            return null;
        }
    };

    const getLatestVideoIdFromYouTubeApi = async function (channelId) {
        if (!youtubeApiKey || !channelId) {
            return null;
        }

        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId)}&maxResults=1&order=date&type=video&key=${youtubeApiKey}`;
        const payload = await fetchYouTubeApiJson(url);
        const item = payload?.items?.[0];
        const videoId = item?.id?.videoId || null;
        if (!videoId) {
            return null;
        }

        return {
            videoId: videoId,
            publishedAt: item?.snippet?.publishedAt || '',
        };
    };

    const isEmbeddableYouTubeVideoId = async function (videoId) {
        if (!videoId) {
            return false;
        }

        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;
            const response = await fetch(oembedUrl);
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    const findNewestEmbeddableUpload = async function (channelId, options = {}) {
        const includeShorts = options.includeShorts === true;
        const rssEntries = await fetchYouTubeRssEntries(channelId);
        for (const entry of rssEntries) {
            if (!entry?.videoId) {
                continue;
            }

            if (!includeShorts && isYouTubeShortEntry(entry)) {
                continue;
            }

            const embeddable = await isEmbeddableYouTubeVideoId(entry.videoId);
            if (embeddable) {
                return entry;
            }
        }

        return null;
    };

    const syncHeroFeaturedDateFromIframe = async function () {
        if (!heroFeaturedVideo || !heroFeaturedDate) {
            return;
        }

        const currentHeroVideoId = extractYouTubeVideoId(heroFeaturedIframe?.getAttribute('src') || '') || heroFeaturedVideo.querySelector('.hero-preview-link')?.dataset.youtubeId || '';
        if (!currentHeroVideoId) {
            heroFeaturedDate.textContent = '';
            return;
        }

        const metadata = await fetchYouTubeMetadata(currentHeroVideoId);
        heroFeaturedDate.textContent = formatUploadDateLabel(metadata?.publishedAt || '');
    };

    const attachHeroVideoFromFeed = async function () {
        if (!heroFeaturedVideo) {
            return;
        }

        const channelId = await resolveChannelId() || await resolveChannelIdFromHeroVideo();
        const rssEntries = await fetchYouTubeRssEntries(channelId);
        const latestStandardRssEntry = rssEntries.find(function (entry) {
            return !isYouTubeShortEntry(entry);
        }) || null;
        const latestFromRss = latestStandardRssEntry || await getLatestVideoIdFromYouTubeRss(channelId);
        const latestFromUser = !latestFromRss && heroYouTubeUsername ? await getLatestVideoIdFromYouTubeRssByUser(heroYouTubeUsername) : null;
        const latestFromApi = !latestFromRss && !latestFromUser ? await getLatestVideoIdFromYouTubeApi(channelId) : null;
        const latestEntry = latestFromRss || latestFromUser || latestFromApi;

        if (latestEntry?.videoId) {
            const latestMetadata = await fetchYouTubeMetadata(latestEntry.videoId, channelId);
            const latestTitle = latestEntry.title || latestMetadata?.title || 'Latest upload from PoweredXPrayers';
            const latestIsEmbeddable = await isEmbeddableYouTubeVideoId(latestEntry.videoId);
            if (latestIsEmbeddable) {
                setHeroFeaturedIframe(latestEntry.videoId, latestTitle);
                if (heroFeaturedDate) {
                    heroFeaturedDate.textContent = formatUploadDateLabel(latestEntry.publishedAt || latestMetadata?.publishedAt || '');
                }
                return;
            }

            setHeroFeaturedPreview(latestEntry.videoId, latestTitle);
            if (heroFeaturedDate) {
                heroFeaturedDate.textContent = formatUploadDateLabel(latestEntry.publishedAt || latestMetadata?.publishedAt || '');
            }
            return;
        }

        const newestEmbeddable = await findNewestEmbeddableUpload(channelId);
        if (newestEmbeddable?.videoId) {
            const newestEmbeddableMetadata = await fetchYouTubeMetadata(newestEmbeddable.videoId, channelId);
            const newestEmbeddableTitle = newestEmbeddable.title || newestEmbeddableMetadata?.title || 'Latest upload from PoweredXPrayers';
            setHeroFeaturedIframe(newestEmbeddable.videoId, newestEmbeddableTitle);
            if (heroFeaturedDate) {
                heroFeaturedDate.textContent = formatUploadDateLabel(newestEmbeddable.publishedAt || newestEmbeddableMetadata?.publishedAt || '');
            }
            return;
        }

        const newestEmbeddableShortOrUpload = await findNewestEmbeddableUpload(channelId, { includeShorts: true });
        if (newestEmbeddableShortOrUpload?.videoId) {
            const newestEmbeddableShortMetadata = await fetchYouTubeMetadata(newestEmbeddableShortOrUpload.videoId, channelId);
            const newestEmbeddableShortTitle = newestEmbeddableShortOrUpload.title || newestEmbeddableShortMetadata?.title || 'Latest upload from PoweredXPrayers';
            setHeroFeaturedIframe(newestEmbeddableShortOrUpload.videoId, newestEmbeddableShortTitle);
            if (heroFeaturedDate) {
                heroFeaturedDate.textContent = formatUploadDateLabel(newestEmbeddableShortOrUpload.publishedAt || newestEmbeddableShortMetadata?.publishedAt || '');
            }
            return;
        }

        if (heroUploadsPlaylistId) {
            heroFeaturedMedia.innerHTML = `<iframe width="100%" height="300" src="https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(heroUploadsPlaylistId)}" title="Latest uploads from PoweredXPrayers" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            heroFeaturedIframe = heroFeaturedMedia.querySelector('iframe');
        }
        if (heroFeaturedDate) {
            heroFeaturedDate.textContent = 'Latest uploads from PoweredXPrayers';
        }
    };

    const ensureLatestUploadCard = async function () {
        if (!primaryVideoGrid) {
            return;
        }

        const existingVideoIds = new Set(videoCards.map(function (card) {
            return getEmbeddedYouTubeVideoId(card);
        }).filter(Boolean));

        const channelId = await resolveChannelId() || await resolveChannelIdFromHeroVideo();
        const rssEntries = await fetchYouTubeRssEntries(channelId);
        const latestTuesdayEntry = rssEntries.find(function (entry) {
            return isTuesdayUploadDate(entry.publishedAt);
        }) || null;
        const latestVideoId = latestTuesdayEntry?.videoId || '';

        if (!latestVideoId || existingVideoIds.has(latestVideoId)) {
            return;
        }

        const metadata = await fetchYouTubeMetadata(latestVideoId);
        const latestPublishedAt = metadata?.publishedAt || latestTuesdayEntry?.publishedAt || '';
        if (!isTuesdayUploadDate(latestPublishedAt)) {
            return;
        }

        const videoTitle = metadata?.title || 'Latest Upload';
        const videoDescription = normalizeYouTubeDescription(metadata?.description || '') || 'Watch the latest message on YouTube.';
        const postedDate = formatPostedDate(latestPublishedAt);
        const videoDate = postedDate ? `Uploaded: ${postedDate}` : 'Uploaded: Recently';

        const card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.videoId = `video-auto-${latestVideoId}`;
        card.dataset.youtubeId = latestVideoId;
        card.dataset.autoLatest = 'true';

        card.innerHTML = '<div class="video-embed"><iframe width="100%" height="300" src="" title="Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><div class="video-card-body"><h3 class="video-title"></h3><p class="video-date"></p><p class="video-description"></p></div><div class="video-card-footer"><button type="button" class="toggle-description">See more</button><a href="#" class="download-button">Download Study Notes</a></div>';

        const iframe = card.querySelector('.video-embed iframe');
        const title = card.querySelector('.video-title');
        const date = card.querySelector('.video-date');
        const description = card.querySelector('.video-description');
        const toggle = card.querySelector('.toggle-description');

        if (iframe) {
            iframe.src = `https://www.youtube.com/embed/${latestVideoId}`;
            iframe.title = videoTitle;
        }
        if (title) {
            title.textContent = videoTitle;
        }
        if (date) {
            date.textContent = videoDate;
        }
        if (description) {
            description.textContent = videoDescription;
        }
        if (toggle && description) {
            toggle.addEventListener('click', function () {
                const expanded = description.classList.toggle('expanded');
                toggle.textContent = expanded ? 'See less' : 'See more';
                toggle.setAttribute('aria-expanded', expanded);
            });
        }

        primaryVideoGrid.insertBefore(card, primaryVideoGrid.firstChild);
        videoCards = Array.from(document.querySelectorAll('.video-card'));
    };

    if (shareButton) {
        shareButton.addEventListener('click', async function () {
            const shareUrl = window.location.href;
            const shareTitle = document.title || 'Powered by Prayer';
            const shareText = 'Check out Powered by Prayer';

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: shareTitle,
                        text: shareText,
                        url: shareUrl,
                    });
                } catch (error) {
                    return;
                }
                return;
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    setShareButtonFeedback('Link copied', 1400);
                    return;
                } catch (error) {
                    // Continue to fallback prompt.
                }
            }

            window.prompt('Copy this website link:', shareUrl);
        });
    }

    await ensureLatestUploadCard();

    videoCards.forEach((card, index) => {
        if (!card.dataset.videoId) {
            card.dataset.videoId = `video-${index + 1}`;
        }

        const button = card.querySelector('.download-button');
        if (!button) {
            return;
        }
        if (button.dataset.studyNotesDisabled === 'true') {
            button.setAttribute('href', '#');
            button.removeAttribute('target');
            button.removeAttribute('rel');
            button.removeAttribute('download');
            return;
        }

        const videoId = card.dataset.videoId;
        const embeddedYouTubeVideoId = getEmbeddedYouTubeVideoId(card);
        const studyNotesUnavailable = unavailableStudyNotesYouTubeIds.has(embeddedYouTubeVideoId);
        const resolvedDownloadUrl = studyNotesDownloadLinksByYouTubeId[embeddedYouTubeVideoId] || studyNotesFolderUrl;
        const shouldDownloadStudyNotes = Boolean(studyNotesDownloadLinksByYouTubeId[embeddedYouTubeVideoId]);
        const videoTitle = card.querySelector('.video-title');
        const videoDescription = card.querySelector('.video-description');
        const existingDateLabel = card.querySelector('.video-date');
        let dateLabel = existingDateLabel;

        if (videoTitle && !dateLabel) {
            dateLabel = document.createElement('p');
            dateLabel.className = 'video-date';
            videoTitle.insertAdjacentElement('afterend', dateLabel);
        }

        const isPlaceholderCard = isPlaceholderVideoCard(card, embeddedYouTubeVideoId);
        const hasAdminVideoOverride = card.dataset.adminTitle === 'true' || card.dataset.adminDescription === 'true' || card.dataset.adminDate === 'true' || button.dataset.adminOverride === 'true';
        const shouldBeComingSoon = isPlaceholderCard && !hasAdminVideoOverride;

        if (!shouldBeComingSoon && dateLabel && embeddedYouTubeVideoId && uploadDateLabelsByYouTubeId[embeddedYouTubeVideoId]) {
            dateLabel.textContent = uploadDateLabelsByYouTubeId[embeddedYouTubeVideoId];
        }

        if (shouldBeComingSoon) {
            if (videoTitle) {
                videoTitle.textContent = 'Coming Soon';
            }

            if (videoDescription) {
                videoDescription.textContent = 'Coming Soon';
            }

            if (dateLabel) {
                dateLabel.textContent = 'Upload date: Coming soon';
            }

            if (studyNotesUnavailable) {
                syncUnavailableStudyNotesButton(button);
            } else {
                syncStudyNotesLink(button, resolvedDownloadUrl, shouldDownloadStudyNotes, videoId);
            }

            return;
        }

        if (embeddedYouTubeVideoId) {
            card.dataset.youtubeId = embeddedYouTubeVideoId;

            fetchYouTubeMetadata(embeddedYouTubeVideoId).then(function (metadata) {
                if (!metadata) {
                    if (dateLabel && !dateLabel.textContent.trim()) {
                        dateLabel.remove();
                    }
                    return;
                }

                if (videoTitle && metadata.title && card.dataset.adminTitle !== 'true') {
                    videoTitle.textContent = metadata.title;
                }

                if (videoDescription && metadata.description && card.dataset.adminDescription !== 'true') {
                    const normalizedDescription = normalizeYouTubeDescription(metadata.description);
                    if (normalizedDescription) {
                        videoDescription.textContent = normalizedDescription;
                    }
                }

                if (!dateLabel || card.dataset.adminDate === 'true') {
                    return;
                }

                const formattedDate = formatPostedDate(metadata.publishedAt);
                if (!formattedDate) {
                    if (!dateLabel.textContent.trim()) {
                        dateLabel.remove();
                    }
                    applyVideoSearchFilter();
                    return;
                }

                dateLabel.textContent = `${getVideoDatePrefix(card)}: ${formattedDate}`;
                sortVideoCardsByDate(videoSortSelect?.value || 'newest');
                applyVideoSearchFilter();
            });
        }

        const currentButtonHref = (button.getAttribute('href') || '').trim();
        const defaultStudyNotesFolderId = getGoogleDriveId(studyNotesFolderUrl);
        const currentButtonDriveId = getGoogleDriveId(currentButtonHref);
        const isDefaultStudyNotesFolderLink = Boolean(
            currentButtonHref &&
            currentButtonDriveId &&
            defaultStudyNotesFolderId &&
            currentButtonDriveId === defaultStudyNotesFolderId
        );
        const hasCustomAdminStudyNotesLink =
            button.dataset.adminOverride === 'true' &&
            currentButtonHref &&
            currentButtonHref !== '#' &&
            !isDefaultStudyNotesFolderLink;

        if (studyNotesUnavailable && !hasCustomAdminStudyNotesLink) {
            syncUnavailableStudyNotesButton(button);

            button.addEventListener('click', function (event) {
                event.preventDefault();
                button.dataset.studyNotesUnavailableClicked = 'true';
                button.textContent = unavailableStudyNotesLabel;
            });
            return;
        }

        if (embeddedYouTubeVideoId === 'Jva-mSBFc9k') {
            syncStudyNotesLink(
                button,
                studyNotesDownloadLinksByYouTubeId['Jva-mSBFc9k'] || resolvedDownloadUrl,
                true,
                videoId
            );
            return;
        }

        if (!hasCustomAdminStudyNotesLink) {
            syncStudyNotesLink(button, resolvedDownloadUrl, shouldDownloadStudyNotes, videoId);
        }
    });

    document.addEventListener('click', function (event) {
        const button = event.target.closest('.download-button');
        if (!button || button.dataset.studyNotesUnavailable === 'true') {
            return;
        }
        if (button.dataset.studyNotesDisabled === 'true') {
            event.preventDefault();
            return;
        }

        const downloadUrl = button.dataset.studyNotesDownloadUrl || button.href;
        const previewUrl = button.dataset.studyNotesPreviewUrl || getStudyNotesPreviewUrl(downloadUrl);
        if (!previewUrl) {
            return;
        }

        event.preventDefault();
        openStudyNotesModal(button);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeStudyNotesModal();
        }
    });

    const toggleButtons = document.querySelectorAll('.toggle-description');
    toggleButtons.forEach(button => {
        const card = button.closest('.video-card');
        const description = card.querySelector('.video-description');

        button.addEventListener('click', function () {
            const expanded = description.classList.toggle('expanded');
            button.textContent = expanded ? 'See less' : 'See more';
            button.setAttribute('aria-expanded', expanded);
        });
    });

    if (videosContainer && videoExpandToggle) {
        videoExpandToggle.addEventListener('click', function () {
            const collapsed = videosContainer.classList.toggle('is-collapsed');
            syncVideoExpandToggleState();
        });
    }

    if (videoSearchInput) {
        videoSearchInput.addEventListener('input', applyVideoSearchFilter);
    }
    if (videoSortSelect) {
        videoSortSelect.addEventListener('change', function () {
            sortVideoCardsByDate(videoSortSelect.value);
            applyVideoSearchFilter();
        });
    }

    if (typeof mobileButtonLabelMediaQuery.addEventListener === 'function') {
        mobileButtonLabelMediaQuery.addEventListener('change', syncStudyNotesButtonLabels);
    } else if (typeof mobileButtonLabelMediaQuery.addListener === 'function') {
        // Safari fallback for older iOS versions.
        mobileButtonLabelMediaQuery.addListener(syncStudyNotesButtonLabels);
    }
    syncStudyNotesButtonLabels();
    sortVideoCardsByDate(videoSortSelect?.value || 'newest');
    applyVideoSearchFilter();
    syncVideoExpandToggleState();

    const rssStripItem = document.querySelector('.rss-strip-item');
    const rssStripSource = document.querySelector('.rss-strip-source');

    if (rssStripItem && rssStripSource && !adminContent.rss) {
        const rssFeedUrl = 'https://www.ibelieve.com/rss/';
        const rssItems = [
            {
                title: 'A Prayer to Notice Hidden Wonders - Your Daily Prayer - April 12',
                link: 'https://www.ibelieve.com/devotionals/featured/a-prayer-to-notice-hidden-wonders.html',
            },
            {
                title: '5 Spring Activities for the Whole Family',
                link: 'https://www.ibelieve.com/food-home/5-spring-activities-for-the-whole-family.html',
            },
            {
                title: '10 Heartwarming Mother\'s Day Prayers of Encouragement and Blessing',
                link: 'https://www.ibelieve.com/motherhood/mothers-day-prayer-of-encouragement-and-blessing.html',
            },
            {
                title: 'A Bible Guide on the Power of Our Words',
                link: 'https://www.ibelieve.com/featured-plus-pdfs/a-bible-guide-on-the-power-of-our-words.html',
            },
        ];

        let currentIndex = 0;
        const renderRssItem = function (index) {
            const item = rssItems[index];
            rssStripItem.textContent = `Latest: ${item.title}`;
            rssStripItem.href = item.link;
            rssStripSource.href = rssFeedUrl;
        };

        renderRssItem(currentIndex);

        if (rssItems.length > 1) {
            window.setInterval(function () {
                currentIndex = (currentIndex + 1) % rssItems.length;
                renderRssItem(currentIndex);
            }, 7000);
        }
    }

    attachHeroVideoFromFeed();
});
