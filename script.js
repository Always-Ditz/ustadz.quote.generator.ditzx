// Wait for DOM to be ready first, then preload background
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('mainContent');
    const bgUrl = 'https://files.catbox.moe/5ujqk7.jpeg';

    // Preload background
    const bgImage = new Image();

    bgImage.onload = () => {
        console.log('Background loaded successfully');
        
        // Background is ready, now show content with fade in
        setTimeout(() => {
            mainContent.classList.add('loaded');
        }, 100);
    };

    bgImage.onerror = () => {
        console.error('Background failed to load, showing content anyway');
        
        // Even if failed, show content
        setTimeout(() => {
            mainContent.classList.add('loaded');
        }, 100);
    };

    // Start loading background
    bgImage.src = bgUrl;

    // DOM Elements - Declare after DOM is ready
    const quoteText = document.getElementById('quoteText');
    const charCount = document.getElementById('charCount');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoader = generateBtn.querySelector('.btn-loader');
    const resultContainer = document.getElementById('resultContainer');
    const resultImage = document.getElementById('resultImage');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Character counter
    quoteText.addEventListener('input', (e) => {
        const length = e.target.value.length;
        charCount.textContent = length;
        
        if (length > 180) {
            charCount.style.color = '#ff6b6b';
        } else {
            charCount.style.color = 'rgba(255, 255, 255, 0.7)';
        }
    });

    // Generate Quote - Using Vercel Backend with Global Cooldown
    generateBtn.addEventListener('click', async () => {
        const text = quoteText.value.trim();
        
        if (!text) {
            alert('Silakan masukkan quote terlebih dahulu!');
            return;
        }
        
        // Show loading state
        generateBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        resultContainer.style.display = 'none';
        
        try {
            // Call our Vercel backend API
            const apiUrl = `/api/generate?text=${encodeURIComponent(text)}`;
            
            // Check if there's a cooldown
            const checkResponse = await fetch(apiUrl);
            
            if (checkResponse.status === 429) {
                // Cooldown active
                const data = await checkResponse.json();
                alert(data.message || 'Cooldown active. Tunggu sebentar ya!');
                
                // Reset button state
                generateBtn.disabled = false;
                btnText.style.display = 'block';
                btnLoader.style.display = 'none';
                return;
            }
            
            if (!checkResponse.ok) {
                throw new Error('Failed to generate');
            }
            
            // Load the image
            const img = new Image();
            
            img.onload = () => {
                resultImage.src = apiUrl;
                resultImage.dataset.apiUrl = apiUrl;
                resultContainer.style.display = 'block';
                
                // Reset button state
                generateBtn.disabled = false;
                btnText.style.display = 'block';
                btnLoader.style.display = 'none';
            };
            
            img.onerror = () => {
                throw new Error('Gagal memuat gambar');
            };
            
            img.src = apiUrl;
            
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat generate quote. Silakan coba lagi!');
            
            // Reset button state
            generateBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
        }
    });

    // Download Image - Using Vercel Backend
    downloadBtn.addEventListener('click', async () => {
        try {
            const imageUrl = resultImage.dataset.apiUrl || resultImage.src;
            
            // Use our Vercel download backend
            const downloadUrl = `/api/download?url=${encodeURIComponent(imageUrl)}`;
            
            // Create download link
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `ustadz-quote-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Download error:', error);
            alert('Terjadi kesalahan saat download. Silakan coba lagi!');
        }
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        quoteText.value = '';
        charCount.textContent = '0';
        resultContainer.style.display = 'none';
        resultImage.src = '';
        resultImage.dataset.apiUrl = '';
        quoteText.focus();
    });

    // Enter to generate (Ctrl/Cmd + Enter)
    quoteText.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            generateBtn.click();
        }
    });
});