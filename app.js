document.addEventListener('DOMContentLoaded', function () {
    const ADMIN_PASSWORD = 'PXPadmin2026!';
    const ADMIN_STORAGE_KEY = 'pxpAdminContent';
    const ADMIN_SESSION_KEY = 'pxpAdminUnlocked';
    const ADMIN_EDITOR_SCOPE_KEY = 'pxpAdminEditorScope';

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js').catch(function (error) {
            console.warn('Service worker registration failed:', error);
        });
    }

    const currentUrl = new URL(window.location.href);
    const forceMobileView = currentUrl.searchParams.get('mobile') === '1';
    if (forceMobileView) {
        document.body.classList.add('force-mobile-view');
    }

    const shareButton = document.querySelector('.nav-share-button');
    const mobileButtonLabelMediaQuery = window.matchMedia('(max-width: 560px)');
    const adminDeviceMediaQuery = window.matchMedia('(max-width: 760px)');
    const videoCards = document.querySelectorAll('.video-card');
    const videosContainer = document.querySelector('.videos-container');
    const primaryVideoGrid = document.querySelector('.videos-container > .video-grid:not(.video-grid-extra)');
    const extraVideoGrid = document.querySelector('.video-grid-extra');
    const videoExpandToggle = document.querySelector('.video-expand-toggle');
    const videoSearchInput = document.querySelector('.video-search-input');
    const videoSearchEmpty = document.querySelector('.video-search-empty');
    const studyNotesFolderUrl = 'https://drive.google.com/drive/folders/1s9LAyfQf4uSKVNu2kULm0DUGdhHjxtlN?usp=sharing';
    const studyNotesDownloadLinksByYouTubeId = {
        Hu5gbtZsbcg: 'https://drive.google.com/uc?export=download&id=1I5AvwxAb0mNBzNNh4hiTCE29BLIAvkrb',
        jSADhcPqGpQ: 'https://drive.google.com/uc?export=download&id=1GBv-a-P-rjiCHT0pmwAdJ5MzwHELHnl3',
        PlCeqAbGN9U: 'https://drive.google.com/uc?export=download&id=1pe_Aclxwe8HvvZAz_I9jZZ4ir0wKi3vr',
        mYiw0rO3qSo: 'https://drive.google.com/uc?export=download&id=1gK87AXffTQoEjW0TPSH_7O9hGktPhoH4',
        aG4eU8LVzVU: 'https://drive.google.com/uc?export=download&id=1pKFYjcXCWHf6bd7iU2dqwwHVluiJuzhy',
        MZAiZZcdrZ4: 'https://drive.google.com/uc?export=download&id=101uPt9Z1diznGWtctxKxRjyBrVSK7hXp',
        QOqeESjDzmA: 'https://drive.google.com/uc?export=download&id=1-ECjYUQ8gubX4RRZQ_QH9ekypcSO1q1s',
        t2BAf6_z_zk: 'https://drive.google.com/uc?export=download&id=1WTW2OZtogO9SZR0M5U5tN0n9NibcoRx1',
        ZBJrPorLCyc: 'https://drive.google.com/uc?export=download&id=1J3fBz0AZKNjZXxWXgTSemdSEeQqZ5Odt',
    };
    const unavailableStudyNotesYouTubeIds = new Set([
        'I7DZerTI9hg',
        'CGpM9zMOX50',
        '7zyTup1sU2U',
        'aDlh_6UYVWY',
    ]);
    const unavailableStudyNotesLabel = 'Study Notes Not Available';
    const uploadDateLabelsByYouTubeId = {
        '-O99Y4kILG8': 'Uploaded: January 6, 2026',
        '1oi5xAgYyu4': 'Uploaded: January 13, 2026',
        'MlWYBkHROXc': 'Uploaded: January 20, 2026',
        'frqOolLffs8': 'Uploaded: January 27, 2026',
    };
    const activeVideoIds = new Set(Array.from({ length: 17 }, function (_, index) {
        return `video-${index + 1}`;
    }));
    const youtubeApiKey =
        window.YOUTUBE_API_KEY ||
        document.querySelector('meta[name="youtube-api-key"]')?.getAttribute('content')?.trim() ||
        '';
    if (!youtubeApiKey) {
        console.warn('YouTube API key missing: publish dates cannot be fetched. Add window.YOUTUBE_API_KEY or <meta name="youtube-api-key" content="...">.');
    }
    const youtubeMetadataCache = new Map();
    const heroFeaturedIframe = document.querySelector('.hero-featured-video iframe');
    const heroFeaturedDate = document.querySelector('.hero-featured-date');
    const heroYouTubeHandle = '@PoweredXPrayers';
    const heroYouTubeUsername = 'PoweredXPrayers';
    const heroYouTubeChannelId = 'UC1qFfHXbdgzy188ILJFw68Q';
    const heroUploadsPlaylistId = `UU${heroYouTubeChannelId.slice(2)}`;
    const youtubeRssEntriesCache = new Map();
    let adminContent = {};

    const adminOverrideSelectors = [
        '.nav-brand-name',
        '.nav-shop',
        '.hero-title',
        '.hero-title .brand-name',
        '.hero-title-line',
        '.hero-description',
        '.donate-button',
        '.prayer-button',
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

    const getActiveAdminDevice = function () {
        return forceMobileView || adminDeviceMediaQuery.matches ? 'mobile' : 'desktop';
    };

    const getAdminEditorScope = function () {
        const scope = window.sessionStorage.getItem(ADMIN_EDITOR_SCOPE_KEY);
        return scope === 'desktop' || scope === 'mobile' ? scope : 'global';
    };

    const getAdminContent = function () {
        try {
            return JSON.parse(window.localStorage.getItem(ADMIN_STORAGE_KEY) || '{}') || {};
        } catch (error) {
            return {};
        }
    };

    const saveAdminContent = function (content) {
        window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(content));
        adminContent = content;
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

    const applyVideoSrc = function (element, value) {
        if (!element || typeof value !== 'string' || !value.trim()) {
            return;
        }

        element.src = value.trim();
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

    const resetAdminInlineStyles = function () {
        document.querySelectorAll(adminOverrideSelectors.join(',')).forEach(function (element) {
            element.style.fontSize = '';
            element.style.color = '';
            element.style.padding = '';
            element.style.minHeight = '';
            element.style.width = '';
            delete element.dataset.adminFontSize;
            delete element.dataset.adminColor;
            delete element.dataset.adminSize;
        });
    };

    const applyAdminContent = function () {
        adminContent = getAdminContent();
        const activeDevice = getActiveAdminDevice();
        const deviceOverrides = adminContent.deviceOverrides || {};
        const activeContent = deepMerge(adminContent, deviceOverrides[activeDevice] || {});
        const hero = activeContent.hero || {};
        const header = activeContent.header || {};
        const footer = activeContent.footer || {};
        const rss = activeContent.rss || {};
        const videos = Array.isArray(activeContent.videos) ? activeContent.videos : [];
        const textSizes = activeContent.textSizes || {};
        const textColors = activeContent.textColors || {};
        const buttonSizes = activeContent.buttonSizes || {};

        document.documentElement.dataset.adminDevice = activeDevice;
        resetAdminInlineStyles();

        if (typeof activeContent.pageTitle === 'string') {
            document.title = activeContent.pageTitle;
        }
        applyTextOverride('.nav-brand-name', header.brandName);
        applyLinkOverride('.nav-shop', header.shopLink);
        applyTextOverride('.hero-title .brand-name', hero.brandName);
        applyTextOverride('.hero-title-line', hero.titleLine);
        applyTextOverride('.hero-description', hero.description);
        applyLinkOverride('.donate-button', hero.donateLink);
        applyLinkOverride('.prayer-button', hero.prayerLink);
        applyVideoSrc(heroFeaturedIframe, hero.embedLink);
        applyTextOverride('.hero-featured-date', hero.date);
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
        applyFontSizeOverride('.donate-button, .prayer-button', textSizes.heroButtons);
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
        applyColorOverride('.donate-button, .prayer-button', textColors.heroButtons);
        applyColorOverride('.section-title', textColors.videoSectionTitle);
        applyColorOverride('.video-title', textColors.videoTitle);
        applyColorOverride('.video-description', textColors.videoDescription);
        applyColorOverride('.download-button', textColors.studyNotesButton);
        applyColorOverride('.footer-brand', textColors.footerBrand);
        applyColorOverride('.footer-description', textColors.footerDescription);
        applySizeOverride('.donate-button, .prayer-button', 'padding', buttonSizes.heroButtonsPadding);
        applySizeOverride('.download-button', 'padding', buttonSizes.studyNotesButtonPadding);
        applySizeOverride('.donate-button, .prayer-button', 'minHeight', buttonSizes.heroButtonsMinHeight);
        applySizeOverride('.download-button', 'minHeight', buttonSizes.studyNotesButtonMinHeight);

        videos.forEach(function (video, index) {
            const card = videoCards[index];
            if (!card) {
                return;
            }

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
                shopLink: getFieldValue('.nav-shop', 'href'),
            },
            hero: {
                brandName: getFieldValue('.hero-title .brand-name'),
                titleLine: getFieldValue('.hero-title-line'),
                description: getFieldValue('.hero-description'),
                donateLink: getFieldValue('.donate-button', 'href'),
                prayerLink: getFieldValue('.prayer-button', 'href'),
                embedLink: getFieldValue('.hero-featured-video iframe', 'src'),
                date: getFieldValue('.hero-featured-date'),
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

    const getAdminSnapshotForScope = function (scope) {
        const liveSnapshot = getCurrentContentSnapshot();
        const savedContent = getAdminContent();
        const deviceOverrides = savedContent.deviceOverrides || {};
        if (scope === 'desktop' || scope === 'mobile') {
            return deepMerge(deepMerge(liveSnapshot, savedContent), deviceOverrides[scope] || {});
        }
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

    const createAdminSection = function (title) {
        const section = document.createElement('section');
        section.className = 'admin-editor-section';
        const heading = document.createElement('h3');
        heading.textContent = title;
        section.appendChild(heading);
        return section;
    };

    const createAdminScopeSection = function (scope) {
        const section = createAdminSection('Editor Target');
        section.classList.add('admin-scope-section');

        const field = document.createElement('label');
        field.className = 'admin-field';

        const labelText = document.createElement('span');
        labelText.textContent = 'Apply changes to';

        const control = document.createElement('select');
        control.className = 'admin-scope-select';
        control.innerHTML = '<option value="global">Both mobile and desktop</option><option value="desktop">Desktop version only</option><option value="mobile">Mobile version only</option>';
        control.value = scope;

        const badge = document.createElement('span');
        badge.className = `admin-scope-badge admin-scope-badge-${scope}`;
        badge.textContent = scope === 'desktop' ? 'Desktop only' : scope === 'mobile' ? 'Mobile only' : 'Both versions';

        field.append(labelText, control, badge);
        section.appendChild(field);

        control.addEventListener('change', function () {
            window.sessionStorage.setItem(ADMIN_EDITOR_SCOPE_KEY, control.value);
            createAdminOverlay();
        });

        return section;
    };

    const createAdminOverlay = function () {
        const existingOverlay = document.querySelector('.admin-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const editorScope = getAdminEditorScope();
        const snapshot = getAdminSnapshotForScope(editorScope);
        const overlay = document.createElement('div');
        overlay.className = 'admin-overlay';
        overlay.innerHTML = '<div class="admin-panel" role="dialog" aria-modal="true" aria-labelledby="admin-title"><div class="admin-panel-header"><div><p class="admin-kicker">Private Admin</p><h2 id="admin-title">Edit Website Content</h2><p class="admin-device-note"></p></div><button type="button" class="admin-close" aria-label="Close admin editor">x</button></div><form class="admin-form"></form></div>';

        const form = overlay.querySelector('.admin-form');
        const closeButton = overlay.querySelector('.admin-close');
        const deviceNote = overlay.querySelector('.admin-device-note');
        deviceNote.textContent = editorScope === 'desktop' ? 'You are editing the desktop version only.' : editorScope === 'mobile' ? 'You are editing the mobile version only.' : 'You are editing shared settings for both mobile and desktop.';

        const scopeSection = createAdminScopeSection(editorScope);

        const heroSection = createAdminSection('Hero');
        heroSection.append(
            createAdminField('hero.brandName', 'Brand title', snapshot.hero.brandName),
            createAdminField('hero.titleLine', 'Hero title line', snapshot.hero.titleLine),
            createAdminField('hero.description', 'Hero description', snapshot.hero.description, 'textarea'),
            createAdminField('hero.embedLink', 'Hero embedded video link', snapshot.hero.embedLink),
            createAdminField('hero.date', 'Hero video date text', snapshot.hero.date),
            createAdminField('hero.donateLink', 'Donate link', snapshot.hero.donateLink),
            createAdminField('hero.prayerLink', 'Prayer request link', snapshot.hero.prayerLink)
        );

        const headerSection = createAdminSection('Header');
        headerSection.append(
            createAdminField('pageTitle', 'Browser tab title', snapshot.pageTitle),
            createAdminField('header.brandName', 'Header brand text', snapshot.header.brandName),
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
        snapshot.videos.forEach(function (video, index) {
            const group = document.createElement('details');
            group.className = 'admin-video-group';
            if (index === 0) {
                group.open = true;
            }
            const summary = document.createElement('summary');
            summary.textContent = `${index + 1}. ${video.title || 'Video'}`;
            group.append(
                summary,
                createAdminField(`videos.${index}.title`, 'Title', video.title),
                createAdminField(`videos.${index}.date`, 'Date text', video.date),
                createAdminField(`videos.${index}.description`, 'Description', video.description, 'textarea'),
                createAdminField(`videos.${index}.embedLink`, 'Embedded/watch link', video.embedLink),
                createAdminField(`videos.${index}.previewImage`, 'Preview image link', video.previewImage),
                createAdminField(`videos.${index}.downloadLink`, 'Study notes/download link', video.downloadLink),
                createAdminField(`videos.${index}.downloadText`, 'Study notes button text', video.downloadText),
                createAdminField(`videos.${index}.titleSize`, 'Title size', video.titleSize, 'input', 'fontSize'),
                createAdminField(`videos.${index}.dateSize`, 'Date size', video.dateSize, 'input', 'fontSize'),
                createAdminField(`videos.${index}.descriptionSize`, 'Description size', video.descriptionSize, 'input', 'fontSize'),
                createAdminField(`videos.${index}.downloadTextSize`, 'Study notes button text size', video.downloadTextSize, 'input', 'fontSize')
            );
            videosSection.appendChild(group);
        });

        const footerSection = createAdminSection('Footer and RSS');
        footerSection.append(
            createAdminField('footer.brand', 'Footer brand', snapshot.footer.brand),
            createAdminField('footer.description', 'Footer description', snapshot.footer.description, 'textarea'),
            createAdminField('footer.copyrightBrand', 'Copyright brand', snapshot.footer.copyrightBrand),
            createAdminField('footer.logoSrc', 'Footer logo image link', snapshot.footer.logoSrc),
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

        form.append(scopeSection, headerSection, heroSection, textSizeSection, colorSection, buttonSizeSection, videosSection, footerSection, actions);
        document.body.appendChild(overlay);

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

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const formContent = {};
            Array.from(form.elements).forEach(function (element) {
                if (!element.name) {
                    return;
                }
                setNestedValue(formContent, element.name, element.value.trim());
            });
            const currentContent = getAdminContent();
            let nextContent = {};
            if (editorScope === 'desktop' || editorScope === 'mobile') {
                nextContent = deepMerge({}, currentContent);
                if (!nextContent.pageTitle && !nextContent.header && !nextContent.hero) {
                    nextContent = deepMerge(getCurrentContentSnapshot(), nextContent);
                }
                nextContent.deviceOverrides = nextContent.deviceOverrides || {};
                nextContent.deviceOverrides[editorScope] = formContent;
            } else {
                nextContent = formContent;
                if (currentContent.deviceOverrides) {
                    nextContent.deviceOverrides = currentContent.deviceOverrides;
                }
            }
            saveAdminContent(nextContent);
            applyAdminContent();
            overlay.querySelector('.admin-status').textContent = editorScope === 'desktop' ? 'Saved for desktop only.' : editorScope === 'mobile' ? 'Saved for mobile only.' : 'Saved for both mobile and desktop.';
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

    applyAdminContent();
    if (typeof adminDeviceMediaQuery.addEventListener === 'function') {
        adminDeviceMediaQuery.addEventListener('change', applyAdminContent);
    } else if (typeof adminDeviceMediaQuery.addListener === 'function') {
        adminDeviceMediaQuery.addListener(applyAdminContent);
    }
    attachSecretAdminTrigger();

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

    const normalizeSearchText = function (text) {
        return (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
    };

    const parseVideoCardDate = function (card) {
        const dateText = card.querySelector('.video-date')?.textContent || '';
        const dateMatch = dateText.match(/Uploaded:\s*(.+)$/i);
        if (!dateMatch) {
            return 0;
        }

        const parsedDate = new Date(dateMatch[1]);
        return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
    };

    const sortVideoCardsNewestFirst = function () {
        if (!primaryVideoGrid || !extraVideoGrid) {
            return;
        }

        const sortedCards = Array.from(videoCards).sort(function (firstCard, secondCard) {
            return parseVideoCardDate(secondCard) - parseVideoCardDate(firstCard);
        });

        sortedCards.forEach(function (card, index) {
            const targetGrid = index < 8 ? primaryVideoGrid : extraVideoGrid;
            targetGrid.appendChild(card);
        });
    };

    const isPlaceholderVideoCard = function (card, embeddedYouTubeVideoId) {
        return !embeddedYouTubeVideoId;
    };

    const syncStudyNotesLink = function (button, url, shouldDownload, videoId) {
        button.href = url;

        if (shouldDownload) {
            button.setAttribute('download', `${videoId}-study-notes.pdf`);
            button.setAttribute('target', '_self');
            button.removeAttribute('rel');
            return;
        }

        button.removeAttribute('download');
        button.setAttribute('target', '_blank');
        button.setAttribute('rel', 'noopener noreferrer');
    };

    const syncUnavailableStudyNotesButton = function (button) {
        button.href = '#';
        button.removeAttribute('download');
        button.removeAttribute('target');
        button.removeAttribute('rel');
        button.dataset.studyNotesUnavailable = 'true';
    };

    const getEmbeddedYouTubeVideoId = function (card) {
        const iframe = card.querySelector('.video-embed iframe');
        const iframeVideoId = extractYouTubeVideoId(iframe?.getAttribute('src') || '');
        return iframeVideoId || card.dataset.youtubeId || card.querySelector('.video-preview-link')?.dataset.youtubeId || '';
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

        if (videoExpandToggle) {
            const hasSearchQuery = Boolean(query);
            const collapsed = videosContainer ? videosContainer.classList.contains('is-collapsed') : true;
            videoExpandToggle.hidden = hasSearchQuery || visibleCount <= 4;
            videoExpandToggle.textContent = collapsed ? 'See more Videos' : 'See less Videos';
            videoExpandToggle.setAttribute('aria-expanded', String(!collapsed));
        }

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
                    return {
                        videoId: entry.getElementsByTagName('yt:videoId')[0]?.textContent?.trim() || '',
                        title: entry.getElementsByTagName('title')[0]?.textContent?.trim() || '',
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

    const syncHeroFeaturedDateFromIframe = async function () {
        if (!heroFeaturedIframe || !heroFeaturedDate) {
            return;
        }

        const currentHeroVideoId = extractYouTubeVideoId(heroFeaturedIframe.getAttribute('src') || '');
        if (!currentHeroVideoId) {
            heroFeaturedDate.textContent = '';
            return;
        }

        const metadata = await fetchYouTubeMetadata(currentHeroVideoId);
        heroFeaturedDate.textContent = formatUploadDateLabel(metadata?.publishedAt || '');
    };

    const attachHeroVideoFromFeed = async function () {
        if (!heroFeaturedIframe) {
            return;
        }

        const normalizedUsername = (heroYouTubeUsername || '').replace(/^@/, '').trim();
        const channelId = await resolveChannelId() || await resolveChannelIdFromHeroVideo();
        if (!channelId) {
            const latestFromRssByUserOnly = await getLatestVideoIdFromYouTubeRssByUser(normalizedUsername);
            if (latestFromRssByUserOnly?.videoId) {
                heroFeaturedIframe.src = `https://www.youtube.com/embed/${latestFromRssByUserOnly.videoId}`;
                heroFeaturedDate.textContent = formatUploadDateLabel(latestFromRssByUserOnly.publishedAt);
                return;
            }
            await syncHeroFeaturedDateFromIframe();
            return;
        }

        const latestFromApi = await getLatestVideoIdFromYouTubeApi(channelId);
        const latestFromRss = latestFromApi ? null : await getLatestVideoIdFromYouTubeRss(channelId);
        const latestFromRssByUser = (!latestFromApi && !latestFromRss) ? await getLatestVideoIdFromYouTubeRssByUser(normalizedUsername) : null;
        const latestVideo = latestFromApi || latestFromRss || latestFromRssByUser;

        if (!latestVideo?.videoId) {
            const latestFromRssByUserOnly = await getLatestVideoIdFromYouTubeRssByUser(normalizedUsername);
            if (latestFromRssByUserOnly?.videoId) {
                heroFeaturedIframe.src = `https://www.youtube.com/embed/${latestFromRssByUserOnly.videoId}`;
                heroFeaturedDate.textContent = formatUploadDateLabel(latestFromRssByUserOnly.publishedAt);
                return;
            }

            if (heroUploadsPlaylistId) {
                heroFeaturedIframe.src = `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(heroUploadsPlaylistId)}`;
            }
            heroFeaturedDate.textContent = '';
            return;
        }

        heroFeaturedIframe.src = `https://www.youtube.com/embed/${latestVideo.videoId}`;

        if (heroFeaturedDate) {
            heroFeaturedDate.textContent = formatUploadDateLabel(latestVideo.publishedAt);
        }

        if (!latestVideo.publishedAt) {
            await syncHeroFeaturedDateFromIframe();
        }
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

    videoCards.forEach((card, index) => {
        if (!card.dataset.videoId) {
            card.dataset.videoId = `video-${index + 1}`;
        }

        const button = card.querySelector('.download-button');
        if (!button) {
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
        const shouldBeComingSoon = (!activeVideoIds.has(videoId) || isPlaceholderCard) && !hasAdminVideoOverride;

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

                dateLabel.textContent = `Uploaded: ${formattedDate}`;
                applyVideoSearchFilter();
            });
        }

        if (studyNotesUnavailable && button.dataset.adminOverride !== 'true') {
            syncUnavailableStudyNotesButton(button);

            button.addEventListener('click', function (event) {
                event.preventDefault();
                button.dataset.studyNotesUnavailableClicked = 'true';
                button.textContent = unavailableStudyNotesLabel;
            });
            return;
        }

        if (button.dataset.adminOverride !== 'true') {
            syncStudyNotesLink(button, resolvedDownloadUrl, shouldDownloadStudyNotes, videoId);
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
            videoExpandToggle.textContent = collapsed ? 'See more Videos' : 'See less Videos';
            videoExpandToggle.setAttribute('aria-expanded', String(!collapsed));
        });
    }

    if (videoSearchInput) {
        videoSearchInput.addEventListener('input', applyVideoSearchFilter);
    }

    if (typeof mobileButtonLabelMediaQuery.addEventListener === 'function') {
        mobileButtonLabelMediaQuery.addEventListener('change', syncStudyNotesButtonLabels);
    } else if (typeof mobileButtonLabelMediaQuery.addListener === 'function') {
        // Safari fallback for older iOS versions.
        mobileButtonLabelMediaQuery.addListener(syncStudyNotesButtonLabels);
    }
    syncStudyNotesButtonLabels();
    sortVideoCardsNewestFirst();
    applyVideoSearchFilter();

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

    if (!adminContent.hero?.embedLink) {
        attachHeroVideoFromFeed();
    }
});
