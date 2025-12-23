// api/download.js - Vercel Serverless Function
// Handle download image (bypass CORS)

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        // Fetch image from URL
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }

        // Get image as buffer
        const imageBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(imageBuffer);

        // Generate filename
        const timestamp = Date.now();
        const filename = `ustadz-quote-${timestamp}.jpg`;

        // Set headers for download
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        return res.status(200).send(buffer);

    } catch (error) {
        console.error('Download error:', error);
        return res.status(500).json({ 
            error: 'Failed to download image',
            details: error.message 
        });
    }
}