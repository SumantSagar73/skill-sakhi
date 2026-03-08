/**
 * Extract YouTube video ID from any standard YouTube URL format.
 * Supports: watch?v=, youtu.be/, /embed/
 */
export const extractYouTubeId = (url = '') => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([^"&?\/\s]{11})/);
    return match ? match[1] : null;
};

/** Return the embeddable iframe URL for a YouTube link */
export const getYouTubeEmbed = (url) => {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
};

/** Return the HQ thumbnail URL for a YouTube link */
export const getYouTubeThumbnail = (url) => {
    const id = extractYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};
