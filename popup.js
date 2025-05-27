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

function updateMediaInfo() {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
        let mediaList = [];
        let checked = 0;
        for (const tab of tabs) {
            chrome.tabs.sendMessage(
                tab.id,
                { action: "getMediaMetadata" },
                function (response) {
                    checked++;
                    if (response && response.metadata && response.metadata.title) {
                        mediaList.push({...response, tabId: tab.id});
                    }
                    if (checked === tabs.length) {
                        const body = document.querySelector("body");
                        if (mediaList.length > 0) {
                            // Join all media info HTML
                            let html = "";
                            for (let i = 0; i < mediaList.length; i++) {
                                const media = mediaList[i];
                                const metadata = media.metadata;
                                const position = media.position || 0;
                                const duration = media.duration || 0;
                                const tabId = media.tabId;
                                html += getMediaInfoDiv(metadata, position, duration, tabId);
                            }
                            body.innerHTML = html;
                            // Optionally, refresh if any media is playing
                            let shouldRefresh = mediaList.some(media => {
                                const duration = media.duration || 0;
                                const position = media.position || 0;
                                return duration > 0 && position < duration;
                            });
                            if (shouldRefresh) {
                                setTimeout(updateMediaInfo, 1000);
                            }

                            document.querySelectorAll(".media-info-card").forEach(card => {
                                card.addEventListener("click", function () {
                                    const tabId = this.getAttribute("tab-id");
                                    console.log("Switching to tab:", tabId);
                                    browser.tabs.update(parseInt(tabId), { active: true });
                                });
                            });
                        } else {
                            body.innerHTML = "<p>No media playing</p>";
                        }
                    }
                }
            );
        }
    });
}

document.addEventListener("DOMContentLoaded", updateMediaInfo);
