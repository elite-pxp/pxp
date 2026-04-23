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
    const videoExpandToggle = document.querySelector('.video-expand-toggle');
    const videoSearchInput = document.querySelector('.video-search-input');
    const videoSearchEmpty = document.querySelector('.video-search-empty');
    const defaultStudyNotesDownloadUrl = 'https://drive.google.com/uc?export=download&id=1LyHUPEO-xrRe6R-xDYBQ5IZMPZiYJdc4';
    const studyNotesLinksByVideoId = {
        'video-2': 'https://drive.google.com/uc?export=download&id=1lAzRUtpEwzuzxansQvQ9jzd30T5f77WO',
        'video-3': 'https://drive.google.com/uc?export=download&id=1zPRkUQ0n7cMzWsPFbulv_HBXnrCEOw0j',
        'video-4': 'https://drive.google.com/uc?export=download&id=1jbeVO3QWQnGbQYloVurRSL0gTU-pLndp',
    };
    const activeVideoIds = new Set(['video-1', 'video-2', 'video-3', 'video-4']);
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

    const normalizeYouTubeDescription = function (descriptionText) {
        if (!descriptionText) {
            return '';
        }

        return descriptionText.replace(/\s+/g, ' ').trim();
    };

    const normalizeSearchText = function (text) {
        return (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
    };

    const isPlaceholderVideoCard = function (card, embeddedYouTubeVideoId) {
        return !embeddedYouTubeVideoId;
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
            const embedName = card.querySelector('.video-embed iframe')?.getAttribute('title') || '';
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
            button.textContent = label;
        });
    };

    const fetchYouTubeMetadata = async function (videoId) {
        if (!videoId) {
            return null;
        }

        if (youtubeMetadataCache.has(videoId)) {
            return youtubeMetadataCache.get(videoId);
        }

        const metadataPromise = (async function () {
            if (!youtubeApiKey) {
                return null;
            }

            try {
                const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${youtubeApiKey}`;
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    return null;
                }

                const payload = await response.json();
                const item = payload?.items?.[0];
                if (!item?.snippet) {
                    return null;
                }

                return {
                    title: item.snippet.title || '',
                    description: item.snippet.description || '',
                    channelId: item.snippet.channelId || '',
                    publishedAt: item.snippet.publishedAt || '',
                };
            } catch (error) {
                return null;
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
        const formattedDate = formatPostedDate(metadata?.publishedAt || '');
        heroFeaturedDate.textContent = formattedDate ? `Uploaded ${formattedDate}` : '';
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
                const fallbackDate = formatPostedDate(latestFromRssByUserOnly.publishedAt);
                heroFeaturedDate.textContent = fallbackDate ? `Uploaded ${fallbackDate}` : '';
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
                const fallbackDate = formatPostedDate(latestFromRssByUserOnly.publishedAt);
                heroFeaturedDate.textContent = fallbackDate ? `Uploaded ${fallbackDate}` : '';
                return;
            }

            if (heroUploadsPlaylistId) {
                heroFeaturedIframe.src = `https://www.youtube.com/embed?listType=playlist&list=${encodeURIComponent(heroUploadsPlaylistId)}`;
            }
            heroFeaturedDate.textContent = '';
            return;
        }

        heroFeaturedIframe.src = `https://www.youtube.com/embed/${latestVideo.videoId}`;

        if (heroFeaturedDate) {
            const formattedDate = formatPostedDate(latestVideo.publishedAt);
            heroFeaturedDate.textContent = formattedDate ? `Uploaded ${formattedDate}` : '';
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
        const resolvedDownloadUrl = studyNotesLinksByVideoId[videoId] || defaultStudyNotesDownloadUrl;
        const iframe = card.querySelector('.video-embed iframe');
        const embeddedYouTubeVideoId = extractYouTubeVideoId(iframe?.getAttribute('src') || '');
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

        if (shouldBeComingSoon) {
            if (videoTitle) {
                videoTitle.textContent = 'Coming Soon';
            }

            if (videoDescription) {
                videoDescription.textContent = 'Coming Soon';
            }

            if (dateLabel) {
                dateLabel.textContent = 'Coming Soon';
            }

            button.href = resolvedDownloadUrl;
            button.setAttribute('download', `${videoId}-study-notes.pdf`);
            button.setAttribute('target', '_self');

            button.addEventListener('click', function (event) {
                event.preventDefault();
                window.location.href = resolvedDownloadUrl;
            });

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
                    dateLabel.remove();
                    applyVideoSearchFilter();
                    return;
                }

                dateLabel.textContent = formattedDate;
                applyVideoSearchFilter();
            });
        }

        button.href = resolvedDownloadUrl;
        button.setAttribute('download', `${videoId}-study-notes.pdf`);
        button.setAttribute('target', '_self');

        button.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = resolvedDownloadUrl;
        });
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
        applyVideoSearchFilter();
    }

    if (typeof mobileButtonLabelMediaQuery.addEventListener === 'function') {
        mobileButtonLabelMediaQuery.addEventListener('change', syncStudyNotesButtonLabels);
    } else if (typeof mobileButtonLabelMediaQuery.addListener === 'function') {
        // Safari fallback for older iOS versions.
        mobileButtonLabelMediaQuery.addListener(syncStudyNotesButtonLabels);
    }
    syncStudyNotesButtonLabels();

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
