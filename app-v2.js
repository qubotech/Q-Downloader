/*******************************
 * Q-Downloader Pro - Main Application
 * All-in-One Download Manager  
 * PRODUCTION-READY VERSION
 *******************************/

// Global State
const App = {
    activeTab: 'video',
    torrentClient: null,
    activeTorrents: new Map(),
    downloadQueue: [],
    downloadHistory: [],

    init() {
        this.loadHistory();
        this.setupTabSystem();
        this.setupVideoDownloader();
        this.setupTorrentDownloader();
        this.setupDirectDownloader();
        this.setupBatchDownloader();
        this.setupHistory();
        this.setupThemeToggle();
        console.log('⚡ Q-Downloader Pro initialized!');
    },

    loadHistory() {
        const saved = localStorage.getItem('downloadHistory');
        if (saved) {
            try {
                this.downloadHistory = JSON.parse(saved);
            } catch (e) {
                this.downloadHistory = [];
            }
        }
    },

    saveHistory() {
        localStorage.setItem('downloadHistory', JSON.stringify(this.downloadHistory));
    },

    addToHistory(item) {
        this.downloadHistory.unshift({
            ...item,
            timestamp: Date.now(),
            id: Date.now() + Math.random()
        });
        if (this.downloadHistory.length > 100) {
            this.downloadHistory = this.downloadHistory.slice(0, 100);
        }
        this.saveHistory();
        this.renderHistory();
    }
};

/*******************************
 * Tab System
 *******************************/

App.setupTabSystem = function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const dropdownToggle = document.getElementById('tabDropdownToggle');
    const dropdownMenu = document.getElementById('tabDropdownMenu');
    const dropdownItems = document.querySelectorAll('.tab-dropdown-item');
    const currentTabName = document.getElementById('currentTabName');

    // Regular tab buttons
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            this.switchTab(tabName, tabBtns, tabContents);
        });
    });

    // Dropdown toggle
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownToggle.classList.toggle('active');
            dropdownMenu.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownToggle.classList.remove('active');
                dropdownMenu.classList.remove('active');
            }
        });
    }

    // Dropdown items
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.dataset.tab;
            const tabText = item.querySelector('span').textContent;

            // Update active states in dropdown
            dropdownItems.forEach(di => di.classList.remove('active'));
            item.classList.add('active');

            // Update dropdown button text
            if (currentTabName) {
                // Get emoji from item
                const emoji = this.getTabEmoji(tabName);
                currentTabName.textContent = `${emoji} ${tabText}`;
            }

            // Close dropdown
            if (dropdownToggle && dropdownMenu) {
                dropdownToggle.classList.remove('active');
                dropdownMenu.classList.remove('active');
            }

            // Switch tab
            this.switchTab(tabName, tabBtns, tabContents);
        });
    });
};

App.switchTab = function (tabName, tabBtns, tabContents) {
    // Update buttons
    tabBtns.forEach(b => b.classList.remove('active'));
    const activeBtn = Array.from(tabBtns).find(b => b.dataset.tab === tabName);
    if (activeBtn) activeBtn.classList.add('active');

    // Update content
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        }
    });

    this.activeTab = tabName;
};

App.getTabEmoji = function (tabName) {
    const emojis = {
        video: '📹',
        torrent: '🧲',
        direct: '📥',
        batch: '📝',
        history: '🕒',
        image: '📸',
        audio: '🎵',
        playlist: '📑',
        document: '📚',
        subtitle: '💬',
        story: '📱',
        website: '🌐',
        github: '💻',
        stream: '🎮',
        cloud: '☁️'
    };
    return emojis[tabName] || '📄';
};

/*******************************
 * Video Downloader
 *******************************/

App.setupVideoDownloader = function () {
    const btn = document.getElementById('videoDownloadBtn');
    const input = document.getElementById('videoUrl');

    if (btn) btn.addEventListener('click', () => this.handleVideoDownload());
    if (input) input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleVideoDownload();
    });
};

App.handleVideoDownload = function () {
    const input = document.getElementById('videoUrl');
    const loading = document.getElementById('videoLoading');
    const result = document.getElementById('videoResult');
    const url = input.value.trim();

    if (!url) {
        this.showFlash('❌ Error', 'Please enter a valid URL');
        return;
    }

    loading.style.display = 'block';
    result.style.display = 'none';

    this.fetchVideoData(url)
        .then(data => {
            loading.style.display = 'none';
            result.style.display = 'block';
            this.renderVideoResult(data, url);
            this.addToHistory({
                type: 'video',
                url: url,
                title: data.data?.title || 'Video Download',
                status: 'completed'
            });
        })
        .catch(error => {
            loading.style.display = 'none';
            this.showFlash('❌ Error', error.message || 'Failed to fetch video data');
        });
};

App.fetchVideoData = function (url) {
    return new Promise((resolve, reject) => {
        const requestUrl = `https://vkrdownloader.org/server?api_key=vkrdownloader&vkr=${encodeURIComponent(url)}`;

        $.ajax({
            url: requestUrl,
            type: "GET",
            cache: true,
            dataType: 'json',
            timeout: 45000,
            success: (data) => resolve(data),
            error: (xhr, status, error) => reject(new Error('Failed to fetch video information'))
        });
    });
};

App.renderVideoResult = function (data, inputUrl) {
    if (!data.data) return;

    const videoData = data.data;
    const videoId = this.getYouTubeVideoId(videoData.source);
    const thumbnailUrl = videoId ?
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` :
        videoData.thumbnail;

    const videoHtml = `
        <video style='background: black url(${thumbnailUrl}) center center/cover no-repeat; width:100%; max-height:500px; border-radius:20px;' 
               poster='${thumbnailUrl}' controls playsinline>
            <source src='${videoData.downloads[0]?.url || ''}' type='video/mp4'>
        </video>`;

    document.getElementById('videoThumb').innerHTML = videoHtml;
    document.getElementById('videoTitle').innerHTML = `<h3>${DOMPurify.sanitize(videoData.title || '')}</h3>`;

    if (videoData.description) {
        document.getElementById('videoDescription').innerHTML =
            `<details><summary>View Description</summary>${DOMPurify.sanitize(videoData.description)}</details>`;
    }

    this.renderVideoDownloadOptions(data, inputUrl);
};

App.renderVideoDownloadOptions = function (videoData, inputUrl) {
    const container = document.getElementById('videoDownload');
    const downloads = videoData.data?.downloads || [];
    const videoSource = videoData.data?.source;

    let optionsHtml = `
        <div class="download-group">
            <select id="formatSelect" class="glass-select">
                <option value="" disabled selected>Select Format / Quality</option>
    `;

    if (downloads.length > 0) {
        optionsHtml += `<optgroup label="Direct Download (Fastest)">`;
        downloads.forEach(d => {
            const redirectUrl = `https://vkrdownloader.org/forcedl?forceT=${encodeURIComponent(videoData.data.title || 'video')}&forceD=${encodeURIComponent(d.url)}`;
            optionsHtml += `<option value="${redirectUrl}">${DOMPurify.sanitize(d.format_id || 'Download')} ${d.size ? '- ' + DOMPurify.sanitize(d.size) : ''}</option>`;
        });
        optionsHtml += `</optgroup>`;
    }

    const videoId = this.getYouTubeVideoId(videoSource);
    if (videoId || (videoSource && videoSource.includes('youtu'))) {
        optionsHtml += `<optgroup label="Video Converters">`;
        ['1080', '720', '480', '360', '4k', '8k'].forEach(q => {
            const convertUrl = `https://vkrdownloader.org/server/apibtn?q=${q}&vkr=${encodeURIComponent(videoSource)}`;
            optionsHtml += `<option value="${convertUrl}">${q}p Quality</option>`;
        });
        optionsHtml += `</optgroup>`;

        optionsHtml += `<optgroup label="Audio Converters">`;
        optionsHtml += `<option value="https://vkrdownloader.org/server/apibtn?q=mp3&vkr=${encodeURIComponent(videoSource)}">MP3 Audio</option>`;
        optionsHtml += `</optgroup>`;
    }

    optionsHtml += `
            </select>
            <button class="glass-btn-small" onclick="App.triggerVideoDownload()">Download</button>
        </div>
    `;

    container.innerHTML = optionsHtml;
};

App.triggerVideoDownload = function () {
    const select = document.getElementById('formatSelect');
    if (!select || !select.value) {
        alert('Please select a format first!');
        return;
    }

    const url = select.value;
    this.showFlash('⚡ Download Starting', 'Opening download...');

    setTimeout(() => {
        document.getElementById('flashPopup').style.display = 'none';
        if (url.includes('apibtn')) {
            const width = 600, height = 400;
            const left = (screen.width - width) / 2;
            const top = (screen.height - height) / 2;
            window.open(url, 'VKrDownload', `width=${width},height=${height},top=${top},left=${left}`);
        } else {
            window.location.href = url;
        }
    }, 1500);
};

App.getYouTubeVideoId = function (url) {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
        if (urlObj.hostname.includes('youtube.com')) {
            if (urlObj.pathname.startsWith('/shorts/')) {
                return urlObj.pathname.split('/')[2];
            }
            return urlObj.searchParams.get('v');
        }
    } catch (e) { }
    return null;
};

/*******************************
 * Torrent Downloader
 *******************************/

App.setupTorrentDownloader = function () {
    const btn = document.getElementById('torrentDownloadBtn');
    const input = document.getElementById('torrentMagnet');
    const fileInput = document.getElementById('torrentFile');

    if (btn) btn.addEventListener('click', () => this.handleTorrentDownload());

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.handleTorrentFile(file);
        });
    }

    if (typeof WebTorrent !== 'undefined') {
        this.torrentClient = new WebTorrent();
        console.log('✅ WebTorrent initialized');
    } else {
        console.warn('❌ WebTorrent not available');
    }
};

App.handleTorrentDownload = function () {
    const input = document.getElementById('torrentMagnet');
    const magnetUri = input.value.trim();

    if (!magnetUri) {
        this.showFlash('❌ Error', 'Please enter a magnet link');
        return;
    }

    if (!this.torrentClient) {
        this.showFlash('❌ Error', 'WebTorrent not available');
        return;
    }

    if (!magnetUri.startsWith('magnet:')) {
        this.showFlash('❌ Error', 'Invalid magnet link');
        return;
    }

    this.startTorrentDownload(magnetUri);
};

App.handleTorrentFile = function (file) {
    if (!this.torrentClient) {
        this.showFlash('❌ Error', 'WebTorrent not available');
        return;
    }
    this.showFlash('⚡ Processing', 'Loading torrent...');
    this.startTorrentDownload(file);
};

App.startTorrentDownload = function (torrentId) {
    const result = document.getElementById('torrentResult');
    const infoBox = document.getElementById('torrentInfo');

    this.showFlash('🔄 Starting', 'Connecting to peers...');

    result.style.display = 'block';
    infoBox.style.display = 'block';

    try {
        this.torrentClient.add(torrentId, {}, (torrent) => {
            document.getElementById('flashPopup').style.display = 'none';

            this.activeTorrents.set(torrent.infoHash, torrent);

            document.getElementById('torrentName').textContent = torrent.name;
            document.getElementById('torrentSize').textContent = this.formatBytes(torrent.length);
            document.getElementById('torrentFiles').textContent = torrent.files.length;

            this.renderTorrentFiles(torrent);

            const updateStats = () => {
                document.getElementById('torrentPeers').textContent = torrent.numPeers;
                document.getElementById('torrentSpeed').textContent = this.formatBytes(torrent.downloadSpeed) + '/s';

                const progress = Math.round(torrent.progress * 100);
                document.getElementById('torrentProgress').style.width = progress + '%';
                document.getElementById('torrentPercent').textContent = progress + '%';

                if (torrent.progress === 1) {
                    this.showFlash('✅ Complete!', 'Torrent finished');
                    this.addToHistory({
                        type: 'torrent',
                        title: torrent.name,
                        size: this.formatBytes(torrent.length),
                        status: 'completed'
                    });
                }
            };

            torrent.on('download', updateStats);
            torrent.on('upload', updateStats);
            updateStats();

            this.addToHistory({
                type: 'torrent',
                title: torrent.name,
                status: 'started'
            });
        });
    } catch (err) {
        this.showFlash('❌ Error', err.message);
        console.error('Torrent error:', err);
    }
};

App.renderTorrentFiles = function (torrent) {
    const container = document.getElementById('torrentFileList');
    let html = '<h4>Files:</h4><div class="file-list">';

    torrent.files.forEach((file, index) => {
        html += `
            <div class="file-item">
                <div>
                    <div style="font-weight: 600;">${DOMPurify.sanitize(file.name)}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${this.formatBytes(file.length)}</div>
                </div>
                <button class="glass-btn-small" onclick="App.downloadTorrentFile(${index}, '${torrent.infoHash}')">
                    Download
                </button>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
};

App.downloadTorrentFile = function (fileIndex, infoHash) {
    const torrent = this.activeTorrents.get(infoHash);
    if (!torrent) return;

    const file = torrent.files[fileIndex];
    file.getBlobURL((err, url) => {
        if (err) {
            this.showFlash('❌ Error', 'Failed to download');
            return;
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        this.showFlash('✅ Success', 'Download started!');
    });
};

/*******************************
 * Direct File Downloader (FIXED - NO CORS ISSUES)
 *******************************/

App.setupDirectDownloader = function () {
    const btn = document.getElementById('directDownloadBtn');
    const input = document.getElementById('directUrl');

    if (btn) btn.addEventListener('click', () => this.handleDirectDownload());
    if (input) input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleDirectDownload();
    });
};

App.handleDirectDownload = function () {
    const input = document.getElementById('directUrl');
    const url = input.value.trim();

    if (!url) {
        this.showFlash('❌ Error', 'Please enter a URL');
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        this.showFlash('❌ Error', 'URL must start with http:// or https://');
        return;
    }

    try {
        new URL(url);
    } catch (e) {
        this.showFlash('❌ Error', 'Invalid URL format');
        return;
    }

    const result = document.getElementById('directResult');
    result.style.display = 'block';

    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filename = pathParts[pathParts.length - 1] || 'download';
    const extension = filename.includes('.') ? filename.split('.').pop() : 'file';

    document.getElementById('directFileName').textContent = decodeURIComponent(filename);
    document.getElementById('directFileType').textContent = extension.toUpperCase();
    document.getElementById('directFileSize').textContent = 'Starting...';

    // Use simple, CORS-free download method
    this.downloadDirectFile(url, filename);
};

App.downloadDirectFile = function (url, filename) {
    this.showFlash('⚡ Starting Download', 'Opening file...');

    document.getElementById('directProgress').style.width = '100%';
    document.getElementById('directPercent').textContent = 'Starting...';

    setTimeout(() => {
        // Method 1: Try anchor tag download (works for most files)
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        document.getElementById('flashPopup').style.display = 'none';
        this.showFlash('✅ Download Started!', 'Check your downloads folder');
        document.getElementById('directFileSize').textContent = 'Download initiated';

        this.addToHistory({
            type: 'direct',
            title: filename,
            url: url,
            status: 'started'
        });
    }, 1000);
};

/*******************************
 * Batch Downloader
 *******************************/

App.setupBatchDownloader = function () {
    const btn = document.getElementById('batchDownloadBtn');
    if (btn) btn.addEventListener('click', () => this.handleBatchDownload());
};

App.handleBatchDownload = function () {
    const textarea = document.getElementById('batchUrls');
    const urls = textarea.value.trim().split('\n').filter(url => url.trim());

    if (urls.length === 0) {
        this.showFlash('❌ Error', 'Please enter at least one URL');
        return;
    }

    const result = document.getElementById('batchResult');
    result.style.display = 'block';

    document.getElementById('batchTotal').textContent = urls.length;
    document.getElementById('batchProcessing').textContent = '0';
    document.getElementById('batchCompleted').textContent = '0';
    document.getElementById('batchFailed').textContent = '0';

    document.getElementById('batchList').innerHTML = '';

    this.processBatchUrls(urls);
};

App.processBatchUrls = function (urls) {
    const listContainer = document.getElementById('batchList');
    let processing = 0;
    let completed = 0;
    let failed = 0;

    urls.forEach((url, index) => {
        const itemId = `batch-item-${index}`;

        const itemHtml = `
            <div class="batch-item" id="${itemId}">
                <div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${this.truncateUrl(url)}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${url}</div>
                </div>
                <span class="batch-item-status processing">⏳ Processing...</span>
            </div>
        `;
        listContainer.innerHTML += itemHtml;

        processing++;
        document.getElementById('batchProcessing').textContent = processing;

        setTimeout(() => {
            this.processSingleBatchUrl(url, itemId)
                .then(() => {
                    completed++;
                    processing--;
                    document.getElementById('batchCompleted').textContent = completed;
                    document.getElementById('batchProcessing').textContent = processing;

                    const statusEl = document.querySelector(`#${itemId} .batch-item-status`);
                    if (statusEl) {
                        statusEl.className = 'batch-item-status completed';
                        statusEl.textContent = '✅ Completed';
                    }
                })
                .catch(() => {
                    failed++;
                    processing--;
                    document.getElementById('batchFailed').textContent = failed;
                    document.getElementById('batchProcessing').textContent = processing;

                    const statusEl = document.querySelector(`#${itemId} .batch-item-status`);
                    if (statusEl) {
                        statusEl.className = 'batch-item-status failed';
                        statusEl.textContent = '❌ Failed';
                    }
                });
        }, index * 1000);
    });
};

App.processSingleBatchUrl = function (url, itemId) {
    return new Promise((resolve, reject) => {
        if (url.startsWith('magnet:')) {
            if (this.torrentClient) {
                this.torrentClient.add(url, () => resolve());
            } else {
                reject();
            }
        } else if (url.includes('youtube.com') || url.includes('youtu.be') ||
            url.includes('instagram.com') || url.includes('tiktok.com')) {
            this.fetchVideoData(url)
                .then(() => resolve())
                .catch(() => reject());
        } else {
            fetch(url, { method: 'HEAD' })
                .then(response => response.ok ? resolve() : reject())
                .catch(() => reject());
        }
    });
};

App.truncateUrl = function (url, maxLength = 50) {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
};

/*******************************
 * Download History
 *******************************/

App.setupHistory = function () {
    const clearBtn = document.getElementById('clearHistory');
    const exportBtn = document.getElementById('exportHistory');

    if (clearBtn) clearBtn.addEventListener('click', () => this.clearHistory());
    if (exportBtn) exportBtn.addEventListener('click', () => this.exportHistory());

    this.renderHistory();
};

App.renderHistory = function () {
    const container = document.getElementById('historyList');

    if (this.downloadHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <h3>No download history yet</h3>
                <p>Your downloads will appear here</p>
            </div>
        `;
        return;
    }

    let html = '';
    this.downloadHistory.forEach(item => {
        const date = new Date(item.timestamp).toLocaleString();
        const icon = this.getTypeIcon(item.type);

        html += `
            <div class="history-item">
                <div class="history-item-title">${icon} ${DOMPurify.sanitize(item.title || 'Download')}</div>
                <div class="history-item-meta">
                    <span>${item.type}</span>
                    <span>${date}</span>
                    ${item.size ? `<span>${item.size}</span>` : ''}
                    <span class="badge">${item.status}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

App.getTypeIcon = function (type) {
    const icons = {
        video: '🎥',
        torrent: '🧲',
        direct: '📥',
        batch: '📝'
    };
    return icons[type] || '📄';
};

App.clearHistory = function () {
    if (confirm('Clear all download history?')) {
        this.downloadHistory = [];
        this.saveHistory();
        this.renderHistory();
        this.showFlash('✅ Cleared', 'History cleared');
    }
};

App.exportHistory = function () {
    const dataStr = JSON.stringify(this.downloadHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `download-history-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.showFlash('✅ Exported', 'History exported');
};

/*******************************
 * Theme Toggle
 *******************************/

App.setupThemeToggle = function () {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        this.showFlash('🎨 Theme', 'Theme toggled');
    });
};

/*******************************
 * Flash Popup
 *******************************/

App.showFlash = function (title, message) {
    const popup = document.getElementById('flashPopup');
    const titleEl = document.getElementById('flashTitle');
    const messageEl = document.getElementById('flashMessage');

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    popup.style.display = 'flex';

    setTimeout(() => {
        popup.style.display = 'none';
    }, 3000);
};

/*******************************
 * Utility Functions
 *******************************/

App.formatBytes = function (bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/*******************************
 * New Downloader Features
 *******************************/

// Image Bulk Downloader
App.setupImageDownloader = function () {
    const btn = document.getElementById('imageDownloadBtn');
    if (btn) btn.addEventListener('click', () => {
        this.showFlash('🚀 Coming Soon', 'Image bulk downloader is under development!');
    });
};

// Audio Downloader
App.setupAudioDownloader = function () {
    const btn = document.getElementById('audioDownloadBtn');
    if (btn) btn.addEventListener('click', () => {
        this.showFlash('🚀 Coming Soon', 'Audio downloader is under development!');
    });
};

// Playlist Downloader
App.setupPlaylistDownloader = function () {
    const btn = document.getElementById('playlistDownloadBtn');
    if (btn) btn.addEventListener('click', () => {
        this.showFlash('🚀 Coming Soon', 'Playlist downloader is under development!');
    });
};

// Document Downloader
App.setupDocumentDownloader = function () {
    const btn = document.getElementById('docDownloadBtn');
    if (btn) btn.addEventListener('click', () => {
        this.showFlash('🚀 Coming Soon', 'Document downloader is under development!');
    });
};

// Subtitle Downloader
App.setupSubtitleDownloader = function () {
    const btn = document.getElementById('subtitleDownloadBtn');
    if (btn) btn.addEventListener('click', () => {
        this.showFlash('🚀 Coming Soon', 'Subtitle downloader is under development!');
    });
};

// Story Downloader
App.setupStoryDownloader = function () {
    const btn = document.getElementById('storyDownloadBtn');
    if (btn) btn.addEventListener('click', () => {
        this.showFlash('🚀 Coming Soon', 'Story downloader is under development!');
    });
};

// Website Cloner
App.setupWebsiteCloner = function () {
    const btn = document.getElementById('websiteDownloadBtn');
    if (btn) btn.addEventListener('click', () => {
        this.showFlash('🚀 Coming Soon', 'Website cloner is under development!');
    });
};

// GitHub Downloader
App.setupGithubDownloader = function () {
    const btn = document.getElementById('githubDownloadBtn');
    if (btn) btn.addEventListener('click', () => {
        this.showFlash('🚀 Coming Soon', 'GitHub downloader is under development!');
    });
};

// Stream Recorder
App.setupStreamRecorder = function () {
    const btn = document.getElementById('streamDownloadBtn');
    if (btn) btn.addEventListener('click', () => {
        this.showFlash('🚀 Coming Soon', 'Stream recorder is under development!');
    });
};

// Cloud File Manager
App.setupCloudDownloader = function () {
    const btn = document.getElementById('cloudDownloadBtn');
    if (btn) btn.addEventListener('click', () => {
        this.showFlash('🚀 Coming Soon', 'Cloud downloader is under development!');
    });
};

/*******************************
 * Initialize App
 *******************************/

document.addEventListener('DOMContentLoaded', () => {
    // Initialize core app
    App.init();

    // Initialize new downloaders
    App.setupImageDownloader();
    App.setupAudioDownloader();
    App.setupPlaylistDownloader();
    App.setupDocumentDownloader();
    App.setupSubtitleDownloader();
    App.setupStoryDownloader();
    App.setupWebsiteCloner();
    App.setupGithubDownloader();
    App.setupStreamRecorder();
    App.setupCloudDownloader();

    console.log('✨ All 15 downloaders initialized!');
});

// Expose App to window
window.App = App;
