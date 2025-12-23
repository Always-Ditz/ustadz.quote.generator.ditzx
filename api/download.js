// api/download.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).end();

    const rawUrl = req.query.url;
    if (!rawUrl) {
        return res.status(400).json({ error: 'URL required' });
    }

    try {
        const imageUrl = decodeURIComponent(rawUrl);

        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'image/*'
            }
        });

        if (!response.ok) {
            throw new Error(`Fetch failed ${response.status}`);
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.startsWith('image/')) {
            throw new Error('Not an image');
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const ext = contentType.split('/')[1] || 'jpg';

        res.setHeader('Content-Type', contentType);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="ustadz-quote-${Date.now()}.${ext}"`
        );

        return res.status(200).send(buffer);

    } catch (err) {
        console.error('[DOWNLOAD ERROR]', err);
        return res.status(500).json({
            error: 'Download failed',
            message: err.message
        });
    }
    }
