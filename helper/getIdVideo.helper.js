const getIdVideo = (url) => {
    const matching = url.includes("/video/");
    if (!matching) {
        console.log("[X] Error: URL not found");
        return;
    }
    const idVideo = url.substring(url.indexOf("/video/") + 7, url.length);
    return idVideo.length > 19
        ? idVideo.substring(0, idVideo.indexOf("?"))
        : idVideo;
};

module.exports = getIdVideo;
