document.addEventListener('DOMContentLoaded', function () {
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
        const shouldBeComingSoon = !activeVideoIds.has(videoId) || isPlaceholderCard;

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

                if (videoTitle && metadata.title) {
                    videoTitle.textContent = metadata.title;
                }

                if (videoDescription && metadata.description) {
                    const normalizedDescription = normalizeYouTubeDescription(metadata.description);
                    if (normalizedDescription) {
                        videoDescription.textContent = normalizedDescription;
                    }
                }

                if (!dateLabel) {
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

        if (studyNotesUnavailable) {
            syncUnavailableStudyNotesButton(button);

            button.addEventListener('click', function (event) {
                event.preventDefault();
                button.dataset.studyNotesUnavailableClicked = 'true';
                button.textContent = unavailableStudyNotesLabel;
            });
            return;
        }

        syncStudyNotesLink(button, resolvedDownloadUrl, shouldDownloadStudyNotes, videoId);
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

    if (rssStripItem && rssStripSource) {
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
