// api/generate.js - Vercel Serverless Function
// Proxy untuk API ustadz (bypass CORS) + Global Cooldown

// Global cooldown state (1 minute)
let lastGenerateTime = 0;
const COOLDOWN_MS = 60000; // 1 minute in milliseconds

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

    // Check global cooldown
    const now = Date.now();
    const timeSinceLastGenerate = now - lastGenerateTime;
    
    if (timeSinceLastGenerate < COOLDOWN_MS) {
        const remainingTime = Math.ceil((COOLDOWN_MS - timeSinceLastGenerate) / 1000);
        return res.status(429).json({ 
            error: 'Cooldown active',
            message: `Tunggu ${remainingTime} detik lagi untuk generate`,
            remainingSeconds: remainingTime
        });
    }

    const { text } = req.query;

    if (!text) {
        return res.status(400).json({ error: 'Text parameter is required' });
    }

    try {
        const apiUrl = `https://api.zenzxz.my.id/api/maker/ustadz?text=${encodeURIComponent(text)}`;
        
        // Fetch from external API
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch from API');
        }

        // Update last generate time (global cooldown starts)
        lastGenerateTime = Date.now();

        // Get image as buffer
        const imageBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(imageBuffer);

        // Set headers for image
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        
        return res.status(200).send(buffer);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Failed to generate image',
            details: error.message 
        });
    }
}
