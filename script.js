document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('generate-form');
    const promptInput = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const btnText = generateBtn.querySelector('.btn-text');
    const loader = generateBtn.querySelector('.loader');
    const errorMessage = document.getElementById('error-message');
    
    const imageBox = document.getElementById('image-container');
    const emptyState = document.querySelector('.empty-state');
    const resultImage = document.getElementById('result-image');
    
    const WEBHOOK_URL = 'http://localhost:5678/webhook-test/texttoimage';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const promptText = promptInput.value.trim();
        if (!promptText) return;

        // Reset state
        hideError();
        setLoadingState(true);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: promptText })
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.image_url) {
                displayImage(data.image_url);
            } else {
                throw new Error('Invalid response format: Missing image_url in response');
            }

        } catch (error) {
            console.error('Generation Error:', error);
            showError(error.message || 'Failed to generate image. Please try again.');
            setLoadingState(false);
        }
    });

    function setLoadingState(isLoading) {
        if (isLoading) {
            generateBtn.disabled = true;
            promptInput.disabled = true;
            btnText.classList.add('hidden');
            loader.classList.remove('hidden');
            
            imageBox.classList.add('loading');
            resultImage.classList.add('hidden');
            resultImage.classList.remove('loaded');
            emptyState.classList.remove('hidden');
            imageBox.classList.add('empty');
            imageBox.classList.remove('has-image');
            
        } else {
            generateBtn.disabled = false;
            promptInput.disabled = false;
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            
            imageBox.classList.remove('loading');
        }
    }

    function displayImage(url) {
        // Preload image to ensure smooth transition
        const img = new Image();
        img.onload = () => {
            resultImage.src = url;
            
            // Update UI blocks
            emptyState.classList.add('hidden');
            resultImage.classList.remove('hidden');
            
            // Small delay to allow CSS transition to catch the rendering
            setTimeout(() => {
                resultImage.classList.add('loaded');
                imageBox.classList.remove('empty');
                imageBox.classList.add('has-image');
            }, 50);

            setLoadingState(false);
        };
        
        img.onerror = () => {
            showError('Failed to load the generated image from the URL provided.');
            setLoadingState(false);
        };

        img.src = url;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';
    }
});
