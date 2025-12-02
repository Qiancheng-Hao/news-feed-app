export const getThumbnailUrl = (url, width = 300) => {
    if (!url) return '';
    if (!url.includes('.volces.com')) return url;

    try {
        const urlObj = new URL(url);
        urlObj.hostname = 'news-feed-app.tos-accelerate.volces.com';
        return `${urlObj.origin}${urlObj.pathname}?x-tos-process=image/resize,w_${width}`;
    } catch {
        return `${url}?x-tos-process=image/resize,w_${width}`;
    }
};

export const getAcceleratedUrl = (url) => {
    if (!url) return '';
    if (!url.includes('.volces.com')) return url;

    try {
        const urlObj = new URL(url);
        urlObj.hostname = 'news-feed-app.tos-accelerate.volces.com';
        return `${urlObj.origin}${urlObj.pathname}`;
    } catch {
        return url;
    }
};
