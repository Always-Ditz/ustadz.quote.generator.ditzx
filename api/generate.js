// api/generate.js
let lastGenerateTime = 0;
const COOLDOWN_MS = 60000;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).end();

    const now = Date.now();
    if (now - lastGenerateTime < COOLDOWN_MS) {
        const sisa = Math.ceil((COOLDOWN_MS - (now - lastGenerateTime)) / 1000);
        return res.status(429).json({
            error: 'Cooldown',
            message: `Tunggu ${sisa} detik`,
            remainingSeconds: sisa
        });
    }

    const { text } = req.query;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const apiUrl =
            `https://api.zenzxz.my.id/api/maker/ustadz?text=${encodeURIComponent(text)}`;

        const imgRes = await fetch(apiUrl);
        if (!imgRes.ok) throw new Error('Failed generate image');

        const buffer = Buffer.from(await imgRes.arrayBuffer());

        // Upload ke Catbox
        const form = new FormData();
        form.append('fileToUpload', new Blob([buffer]), 'ustadz.jpg');
        form.append('reqtype', 'fileupload');

        const upload = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: form
        });

        const imageUrl = await upload.text();

        lastGenerateTime = Date.now();

        return res.status(200).json({
            success: true,
            imageUrl
        });

    } catch (err) {
        console.error('[GENERATE ERROR]', err);
        return res.status(500).json({
            error: 'Generate failed',
            message: err.message
        });
    }
}
