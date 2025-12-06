/*******************************
 * Configuration for Colors
 *******************************/
const formatColors = {
    greenFormats: ["17", "18", "22"],
    blueFormats: ["139", "140", "141", "249", "250", "251", "599", "600"],
    defaultColor: "#6c5ce7"
};

/*******************************
 * Utility Functions
 *******************************/

function getBackgroundColor(downloadUrlItag) {
    if (formatColors.greenFormats.includes(downloadUrlItag)) {
        return "#00b894"; // Green
    } else if (formatColors.blueFormats.includes(downloadUrlItag)) {
        return "#0984e3"; // Blue
    } else {
        return formatColors.defaultColor;
    }
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function getYouTubeVideoIds(url) {
    if (!url || typeof url !== 'string') return null;
    try {
        const urlObj = new URL(url);
        const validHosts = ['www.youtube.com', 'youtube.com', 'youtu.be'];
        if (!validHosts.includes(urlObj.hostname)) return null;
        if (urlObj.hostname === 'youtu.be') {
            const videoId = urlObj.pathname.slice(1);
            return videoId.length === 11 ? videoId : null;
        }
        if (urlObj.hostname.includes('youtube.com')) {
            if (urlObj.pathname.startsWith('/shorts/')) {
                return urlObj.pathname.split('/')[2];
            }
            const videoId = urlObj.searchParams.get('v');
            return videoId && videoId.length === 11 ? videoId : null;
        }
        return null;
    } catch (error) {
        return null;
    }
}

function sanitizeContent(content) {
    return DOMPurify.sanitize(content);
}

function updateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = content;
    }
}

/*******************************
 * AJAX Request with Retry Logic
 *******************************/

function makeRequest(inputUrl, retries = 1) {
    const requestUrl = `https://vkrdownloader.org/server?api_key=vkrdownloader&vkr=${encodeURIComponent(inputUrl)}`;
    const retryDelay = 3000;
    const maxRetries = retries;

    $.ajax({
        url: requestUrl,
        type: "GET",
        cache: true,
        async: true,
        crossDomain: true,
        dataType: 'json',
        timeout: 45000, // 45 Seconds Timeout
        success: function (data) {
            handleSuccessResponse(data, inputUrl);
        },
        error: function (xhr, status, error) {
            if (retries > 0) {
                // Update loading text
                const loadingElement = document.getElementById("loading");
                if (loadingElement) loadingElement.innerText = `Request taking time... Retrying (${retries} left)`;

                let delay = retryDelay * Math.pow(2, maxRetries - retries);
                setTimeout(() => makeRequest(inputUrl, retries - 1), delay);
            } else {
                const errorMessage = getErrorMessage(xhr, status, error);
                console.error(`Error Details: ${errorMessage}`);
                displayError("Unable to fetch data. The server might be busy, please try again.");
                document.getElementById("loading").style.display = "none";
            }
        },
        complete: function () {
            document.getElementById("downloadBtn").disabled = false;
        }
    });
}

function getErrorMessage(xhr, status, error) {
    const statusCode = xhr.status;
    let message = `Status: ${status}, Error: ${error}`;
    if (xhr.responseText) {
        try {
            const response = JSON.parse(xhr.responseText);
            if (response && response.error) {
                message += `, Server Error: ${response.error}`;
            }
        } catch (e) {
            message += `, Unable to parse server response.`;
        }
    }
    return message;
}

function displayError(message) {
    const errorElement = document.getElementById("errorMessage");
    const errorContainer = document.getElementById("error");
    if (errorContainer) {
        errorContainer.innerHTML = sanitizeContent(message);
        errorContainer.style.display = "block";
    } else if (errorElement) {
        errorElement.innerText = message;
        errorElement.style.display = "block";
    } else {
        alert(message);
    }
}

/*******************************
 * Event Handlers
 *******************************/

document.getElementById("downloadBtn").addEventListener("click", debounce(function () {
    document.getElementById("loading").style.display = "initial";
    document.getElementById("downloadBtn").disabled = true;

    const inputUrl = document.getElementById("inputUrl").value.trim();
    if (!inputUrl) {
        displayError("Please enter a valid YouTube URL.");
        document.getElementById("loading").style.display = "none";
        document.getElementById("downloadBtn").disabled = false;
        return;
    }

    // Reset loading text
    const loadingElement = document.getElementById("loading");
    if (loadingElement) loadingElement.innerText = "Loading... Please Wait";

    makeRequest(inputUrl);
}, 300));

/*******************************
 * Response Handlers
 *******************************/

function handleSuccessResponse(data, inputUrl) {
    document.getElementById("container").style.display = "block";
    document.getElementById("loading").style.display = "none";

    if (data.data) {
        const videoData = data.data;
        const downloadUrls = videoData.downloads.map(download => download.url);
        const videoSource = videoData.source;
        const videoId = getYouTubeVideoIds(videoSource);
        const thumbnailUrl = videoId ?
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` :
            videoData.thumbnail;

        const videoHtml = `
            <video style='background: black url(${thumbnailUrl}) center center/cover no-repeat; width:100%; height:500px; border-radius:20px;' 
                   poster='${thumbnailUrl}' controls playsinline>
                <source src='${videoData.downloads[5]?.url || ''}' type='video/mp4'>
                ${Array.isArray(downloadUrls) ? downloadUrls.map(url => `<source src='${url}' type='video/mp4'>`).join('') : ''}
                <source src='https://vkrdownloader.org/server/dl.php?vkr=${encodeURIComponent(inputUrl)}' type='video/mp4'>
            </video>`;

        const YTvideoHtml = `
            <video style='background: black url(${thumbnailUrl}) center center/cover no-repeat; width:100%; height:500px; border-radius:20px;' 
                   poster='${thumbnailUrl}' controls playsinline>
                 <source src='https://vkrdownloader.org/server/redirect.php?vkr=https://youtu.be/${videoId}' type='video/mp4'>
                 <source src='https://vkrdownloader.org/server/apibtn/dl.php?vkr=${inputUrl}' type='video/mp4'>
                ${downloadUrls.map(url => `<source src='${url}' type='video/mp4'>`).join('')}
            </video>`;

        const titleHtml = videoData.title ? `<h3>${sanitizeContent(videoData.title)}</h3>` : "";
        const descriptionHtml = videoData.description ?
            `<h4><details><summary>View Description</summary>${sanitizeContent(videoData.description)}</details></h4>` : "";
        const durationHtml = videoData.size ? `<h5>${sanitizeContent(videoData.size)}</h5>` : "";

        if (videoId) {
            updateElement("thumb", YTvideoHtml);
        } else {
            updateElement("thumb", videoHtml);
        }
        updateElement("title", titleHtml);
        updateElement("description", descriptionHtml);
        updateElement("duration", durationHtml);

        generateDownloadButtons(data, inputUrl);
    } else {
        displayError("Unable to retrieve download links. Please check the URL.");
        document.getElementById("loading").style.display = "none";
    }
}

/**
 * Generate download buttons with dynamic colors and labels.
 * Separates Audio and Video options.
 */
function generateDownloadButtons(videoData, inputUrl) {
    const downloadContainer = document.getElementById("download");
    downloadContainer.innerHTML = "";

    if (videoData.data) {
        let downloads = videoData.data.downloads;
        const videoSource = videoData.data.source;

        if (!Array.isArray(downloads)) downloads = [];

        let dropdownHtml = `
            <div class="download-group">
                <select id="formatSelect" class="glass-select">
                    <option value="" disabled selected>Select Format / Quality</option>
        `;

        let hasOptions = false;

        // 1. Direct Downloads from API
        if (downloads.length > 0) {
            const generateOption = (d) => {
                const downloadUrl = d.url;
                const videoExt = d.format_id || "Download";
                const videoSize = d.size || "";
                const redirectUrl = `https://vkrdownloader.org/forcedl?forceT=${encodeURIComponent(videoData.data.title || 'video')}&forceD=${encodeURIComponent(downloadUrl)}`;
                return `<option value="${redirectUrl}">${sanitizeContent(videoExt)} ${videoSize ? '- ' + sanitizeContent(videoSize) : ''}</option>`;
            };

            const directAudio = downloads.filter(d =>
                (d.format_id && (d.format_id.toLowerCase().includes('mp3') || d.format_id.toLowerCase().includes('m4a') || d.format_id.toLowerCase().includes('audio'))) ||
                (d.url && (d.url.includes('.mp3') || d.url.includes('.m4a')))
            );
            const directVideo = downloads.filter(d => !directAudio.includes(d));

            if (directVideo.length > 0) {
                dropdownHtml += `<optgroup label="Direct Video (Fastest)">`;
                directVideo.forEach(d => { dropdownHtml += generateOption(d); hasOptions = true; });
                dropdownHtml += `</optgroup>`;
            }

            if (directAudio.length > 0) {
                dropdownHtml += `<optgroup label="Direct Audio (Fastest)">`;
                directAudio.forEach(d => { dropdownHtml += generateOption(d); hasOptions = true; });
                dropdownHtml += `</optgroup>`;
            }
        }

        // 2. Converters for YouTube
        const videoId = getYouTubeVideoIds(videoSource);
        if (videoId || (videoSource && videoSource.includes('youtu'))) {
            dropdownHtml += `<optgroup label="Video Converters (Server 2)">`;
            const videoQualities = [
                { label: "1080p Full HD", q: "1080" },
                { label: "720p HD", q: "720" },
                { label: "480p SD", q: "480" },
                { label: "360p SD", q: "360" },
                { label: "4k Ultra HD", q: "4k" },
                { label: "8k Ultra HD", q: "8k" }
            ];
            videoQualities.forEach(item => {
                const convertUrl = `https://vkrdownloader.org/server/apibtn?q=${item.q}&vkr=${encodeURIComponent(videoSource)}`;
                dropdownHtml += `<option value="${convertUrl}">${item.label}</option>`;
            });
            dropdownHtml += `</optgroup>`;

            dropdownHtml += `<optgroup label="Audio Converters (Server 2)">`;
            const audioQualities = [
                { label: "MP3 Audio (High Quality)", q: "mp3" }
            ];
            audioQualities.forEach(item => {
                const convertUrl = `https://vkrdownloader.org/server/apibtn?q=${item.q}&vkr=${encodeURIComponent(videoSource)}`;
                dropdownHtml += `<option value="${convertUrl}">${item.label}</option>`;
            });
            dropdownHtml += `</optgroup>`;
            hasOptions = true;
        }

        dropdownHtml += `
                </select>
                <button id="triggerDownloadBtn" class="glass-btn-small" onclick="triggerDownload()">Download</button>
            </div>
        `;

        if (hasOptions) {
            downloadContainer.innerHTML = dropdownHtml;
        } else {
            downloadContainer.innerHTML = "<p>No direct download formats available.</p>";
            // Fallback Iframe
            if (videoId) {
                const qualities = ["mp3", "360", "720", "1080"];
                let fallbackHtml = "<div style='display:flex;gap:10px;flex-wrap:wrap;justify-content:center;'>";
                qualities.forEach(quality => {
                    fallbackHtml += `<iframe style="border:0;height:45px;" src="https://vkrdownloader.org/server/apibtn?q=${encodeURIComponent(quality)}&vkr=${encodeURIComponent(videoSource)}"></iframe>`;
                });
                fallbackHtml += "</div>";
                downloadContainer.innerHTML = fallbackHtml;
            }
        }

    } else {
        displayError("No download links found.");
        document.getElementById("loading").style.display = "none";
    }
}

// Global function to trigger the download from the dropdown
window.triggerDownload = function () {
    const select = document.getElementById("formatSelect");
    if (select && select.value) {
        const url = select.value;
        const popup = document.getElementById("flashPopup");

        if (popup) {
            popup.style.display = "flex";
            const text = popup.querySelector('h3');
            if (text) text.innerText = "Processing...";

            // Hide popup quickly as we move to action
            setTimeout(() => {
                popup.style.display = "none";
            }, 2000);
        }

        if (url.includes("apibtn")) {
            // Converter: Open in specific popup window
            const width = 600;
            const height = 400;
            const left = (screen.width - width) / 2;
            const top = (screen.height - height) / 2;
            window.open(url, 'VKrDownload', `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`);
        } else {
            // Direct Download: Use location.href
            window.location.href = url;

            // Re-show popup with different text
            if (popup) {
                const text = popup.querySelector('h3');
                const sub = popup.querySelector('p');
                if (text) text.innerText = "Download Started!";
                if (sub) sub.innerText = "Check your downloads folder.";
                popup.style.display = "flex";
                setTimeout(() => { popup.style.display = "none"; }, 3000);
            }
        }
    } else {
        alert("Please select a format first!");
    }
};
