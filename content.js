chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getMediaMetadata") {
    let metadata = null;
    let position = null;
    let duration = null;
    let playing = false;
    if (navigator.mediaSession && navigator.mediaSession.metadata) {
      const m = navigator.mediaSession.metadata;
      metadata = {
        title: m.title,
        artist: m.artist,
        album: m.album,
        artwork: m.artwork
      };
    }
    const mediaElem = document.querySelector('audio,video');
    if (mediaElem) {
      position = mediaElem.currentTime;
      duration = mediaElem.duration;
      playing = !mediaElem.paused && !mediaElem.ended;
    }
    sendResponse({ metadata, position, duration, playing });
  }
  return true;
});
