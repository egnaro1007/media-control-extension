function getMediaInfoDiv(metadata, position, duration, tabId) {
    let percent = 0;
    if (duration > 0) {
        percent = (position / duration) * 100;
    }
    return `
        <div id="media-${tabId}" class="media-info-card" tab-id="${tabId}" style="cursor:pointer;">
            <div class="media-content-row">
                <div class="media-details">
                    <div class="media-title">${metadata.title || "N/A"}</div>
                    <div class="media-artist">${metadata.artist || "N/A"}</div>
                    <div class="media-album">${metadata.album ? "Album: " + metadata.album : ""}</div>
                </div>
                <div class="media-artwork">
                    <img src="${metadata.artwork && metadata.artwork[0] ? metadata.artwork[0].src : ''}" alt="Artwork" />
                </div>
            </div>
            <div class="media-progress-bar">
                <div class="media-progress" style="width: ${percent}%;"></div>
            </div>
        </div>
    `;
}

async function updateMediaInfo() {
    const tabs = await browser.tabs.query({ currentWindow: true });
    const mediaPromises = tabs.map(tab =>
        browser.tabs.sendMessage(tab.id, { action: "getMediaMetadata" })
            .then(response => (response && response.metadata && response.metadata.title)
                ? { ...response, tabId: tab.id }
                : null)
            .catch(() => null)
    );
    const mediaList = (await Promise.all(mediaPromises)).filter(Boolean);
    const body = document.body;

    if (mediaList.length > 0) {
        body.innerHTML = mediaList.map(media => {
            const { metadata, position = 0, duration = 0, tabId } = media;
            return getMediaInfoDiv(metadata, position, duration, tabId);
        }).join("");

        // Refresh if any media is playing
        if (mediaList.some(({ duration = 0, position = 0 }) => duration > 0 && position < duration)) {
            setTimeout(updateMediaInfo, 1000);
        }

        document.querySelectorAll(".media-info-card").forEach(card => {
            card.addEventListener("click", function () {
                const tabId = this.getAttribute("tab-id");
                browser.tabs.update(parseInt(tabId), { active: true });
            });
        });
    } else {
        body.innerHTML = "<p>No media playing</p>";
    }
}

document.addEventListener("DOMContentLoaded", updateMediaInfo);
