// Wait for DOM to be ready first, then preload background
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('mainContent');
    const bgUrl = 'https://files.catbox.moe/5ujqk7.jpeg';

    /* ===============================
       PRELOAD BACKGROUND
    =============================== */
    const bgImage = new Image();
    bgImage.onload = bgImage.onerror = () => {
        setTimeout(() => {
            mainContent.classList.add('loaded');
        }, 100);
    };
    bgImage.src = bgUrl;

    /* ===============================
       DOM ELEMENTS
    =============================== */
    const quoteText = document.getElementById('quoteText');
    const charCount = document.getElementById('charCount');

    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoader = generateBtn.querySelector('.btn-loader');

    const resultContainer = document.getElementById('resultContainer');
    const resultImage = document.getElementById('resultImage');

    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');

    let cooldownInterval = null;

    /* ===============================
       CHARACTER COUNTER
    =============================== */
    quoteText.addEventListener('input', (e) => {
        const length = e.target.value.length;
        charCount.textContent = length;
        charCount.style.color =
            length > 180 ? '#ff6b6b' : 'rgba(255, 255, 255, 0.7)';
    });

    /* ===============================
       GENERATE QUOTE
    =============================== */
    generateBtn.addEventListener('click', async () => {
        const text = quoteText.value.trim();

        if (!text) {
            alert('Silakan masukkan quote terlebih dahulu!');
            return;
        }

        generateBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        resultContainer.style.display = 'none';

        try {
            const apiUrl = `/api/generate?text=${encodeURIComponent(text)}`;
            const res = await fetch(apiUrl);

            /* ===== COOLDOWN ===== */
            if (res.status === 429) {
                const data = await res.json();
                let remaining = data.remainingSeconds || 60;

                btnLoader.style.display = 'none';
                btnText.style.display = 'block';
                generateBtn.disabled = true;
                btnText.textContent = `Tunggu ${remaining} detik`;

                cooldownInterval = setInterval(() => {
                    remaining--;
                    btnText.textContent = `Tunggu ${remaining} detik`;

                    if (remaining <= 0) {
                        clearInterval(cooldownInterval);
                        cooldownInterval = null;
                        generateBtn.disabled = false;
                        btnText.textContent = 'Generate';
                    }
                }, 1000);

                return;
            }

            if (!res.ok) {
                throw new Error('Generate gagal');
            }

            const data = await res.json();

            if (!data.imageUrl) {
                throw new Error('Image URL tidak ditemukan');
            }

            /* ===== TAMPILKAN GAMBAR ===== */
            resultImage.src = data.imageUrl;
            resultImage.dataset.imageUrl = data.imageUrl;
            resultContainer.style.display = 'block';

        } catch (error) {
            console.error('Generate error:', error);
            alert('Terjadi kesalahan saat generate quote.');
        } finally {
            if (!cooldownInterval) {
                generateBtn.disabled = false;
                btnText.style.display = 'block';
                btnText.textContent = 'Generate';
                btnLoader.style.display = 'none';
            }
        }
    });

    /* ===============================
       DOWNLOAD IMAGE
    =============================== */
    downloadBtn.addEventListener('click', () => {
        const imageUrl = resultImage.dataset.imageUrl;

        if (!imageUrl) {
            alert('Gambar belum tersedia');
            return;
        }

        window.open(
            `/api/download?url=${encodeURIComponent(imageUrl)}`,
            '_blank'
        );
    });

    /* ===============================
       RESET
    =============================== */
    resetBtn.addEventListener('click', () => {
        quoteText.value = '';
        charCount.textContent = '0';

        resultContainer.style.display = 'none';
        resultImage.src = '';
        resultImage.dataset.imageUrl = '';

        if (cooldownInterval) {
            clearInterval(cooldownInterval);
            cooldownInterval = null;
        }

        generateBtn.disabled = false;
        btnText.textContent = 'Generate';
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';

        quoteText.focus();
    });

    /* ===============================
       CTRL / CMD + ENTER
    =============================== */
    quoteText.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            generateBtn.click();
        }
    });
});
