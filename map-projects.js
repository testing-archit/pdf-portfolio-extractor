import slugify from 'slugify';

/**
 * Maps pages and images to projects based on heuristics.
 * @param {Array} pages - Extracted text pages with metadata.
 * @param {Array} images - Extracted images with page info.
 * @returns {Array} - Array of project objects.
 */
export function mapProjects(pages, images) {
    const projects = [];
    let currentProject = null;

    // Heuristics Configuration
    const TITLE_HEIGHT_THRESHOLD = 15; // Example threshold, depends on PDF
    const KNOWN_CATEGORIES = ['Logos', 'Events', 'Posters', 'Social Media', 'Branding', 'App Design', 'UI/UX'];

    // Helper to infer category
    const inferCategory = (text) => {
        for (const cat of KNOWN_CATEGORIES) {
            if (text.includes(cat) || text.toUpperCase().includes(cat.toUpperCase())) return cat;
        }
        return 'Other';
    };

    pages.forEach((page, index) => {
        // Analyze page content to detecting start of new project
        // 1. Check for prominent heading (large font or CAPS) at the start

        // Grab the first few lines
        const headerLines = page.lines.slice(0, 3);
        let potentialTitle = null;
        let category = null;

        // Strategy: Look for the largest text on the page, or the first distinct heading
        // If we find a "Category" page (e.g. just says "LOGOS"), we might treat it as a section or skip.
        // The user wants "Category pages" to potentially be recognized.
        // But normalized output has "category" field in each project.

        // Let's assume a project starts when we see a Title.
        // Heuristic: Line is CAPS and length < 50 chars, or Height > threshold.

        const candidate = headerLines.find(l => (l.isCaps || l.height > TITLE_HEIGHT_THRESHOLD) && l.str.length < 50);

        if (candidate) {
            // It's a candidate for a new project.
            // Avoid false positives (like "PORTFOLIO 2024").
            if (!['PORTFOLIO', 'WORKS', 'CONTACT'].includes(candidate.str.toUpperCase())) {
                potentialTitle = candidate.str;

                // Try to find category in same or subsequent lines
                const combinedText = page.lines.map(l => l.str).join(' ');
                category = inferCategory(combinedText);
            }
        }

        if (potentialTitle) {
            // Start new project
            if (currentProject) {
                projects.push(currentProject);
            }

            currentProject = {
                id: slugify(potentialTitle, { lower: true, strict: true }),
                title: potentialTitle,
                category: category || 'Design', // Default
                tags: [], // Could extract from loose keywords
                description: '',
                images: [],
                sourcePage: page.page
            };

            // Extract description (remaining text)
            // currentProject.description = ...
        }

        // Add images from this page to current project
        const pageImages = images.filter(img => img.page === page.page);
        if (currentProject) {
            // Add image paths (relative to output?)
            // The user wants "assets result path". 
            // We will move images later or just record them.
            // For now, record the *source* path so index.js can move them.

            pageImages.forEach(img => {
                currentProject.images.push(img.path); // Absolute path for now
            });
        } else if (pageImages.length > 0) {
            // Orphaned images (before first project).
            // Maybe create a "Intro" project or ignore.
            // keeping mostly empty for now.
        }
    });

    if (currentProject) {
        projects.push(currentProject);
    }

    return projects;
}
