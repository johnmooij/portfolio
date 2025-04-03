document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.querySelector('.gallery-grid');
    const categoryTitleElement = document.querySelector('.category-header h2');

    if (!galleryGrid || !categoryTitleElement) {
        console.error("Essential elements (gallery grid or category header) not found.");
        return;
    }

    // --- Determine Category ---
    const fullTitle = categoryTitleElement.textContent.trim();
    const categoryKey = fullTitle.split(' ')[0].toLowerCase();
    
    console.log("Detected category key:", categoryKey);

    if (!categoryKey) {
        displayMessage("Kon categorie niet bepalen.", true);
        return;
    }

    // --- Fetch Gallery Data ---
    fetch('../gallery-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const imagePaths = data[categoryKey];

            if (!imagePaths) {
                displayMessage(`Geen data gevonden voor categorie: ${categoryKey}`, true);
                console.warn(`Category key "${categoryKey}" not found in gallery-data.json`);
                return;
            }

            if (imagePaths.length === 0) {
                displayMessage("Er zijn nog geen afbeeldingen in deze categorie.");
                return;
            }

            populateGallery(imagePaths, categoryKey, fullTitle.split(' Fotografie')[0]);
        })
        .catch(error => {
            console.error('Error loading gallery data:', error);
            displayMessage("Fout bij het laden van de galerij afbeeldingen.", true);
        });

    // --- Populate Gallery Grid ---
    function populateGallery(paths, key, baseTitle) {
        galleryGrid.innerHTML = ''; // Clear any existing content or loading message
        
        // Important: Use the same data-lightbox value for all images to group them
        const lightboxGroupName = key;
        
        paths.forEach((path, index) => {
            const item = document.createElement('div');
            item.classList.add('gallery-item');

            const link = document.createElement('a');
            link.href = path;
            // This is the key part - all images must have the same data-lightbox attribute value
            link.dataset.lightbox = lightboxGroupName;
            // Remove the title to prevent captions from showing
            // link.dataset.title = `${baseTitle} foto ${index + 1}`;
                
            const img = document.createElement('img');
            img.src = path;
            img.alt = `${baseTitle} foto ${index + 1}`;
            img.loading = 'lazy';

            link.appendChild(img);
            item.appendChild(link);
            galleryGrid.appendChild(item);
        });

        // Initialize Lightbox after all images are added
        setTimeout(() => {
            if (typeof lightbox !== 'undefined') {
                lightbox.option({
                    'resizeDuration': 300,
                    'fadeDuration': 300,
                    'imageFadeDuration': 300,
                    'wrapAround': true, // This enables circular navigation
                    'albumLabel': '', // Empty string to hide the album label
                    'positionFromTop': 50,
                    'alwaysShowNavOnTouchDevices': true,
                    'disableScrolling': true,
                    'fitImagesInViewport': true, // Ensure images fit in viewport
                    'maxWidth': window.innerWidth * 0.95, // 95% of window width
                    'maxHeight': window.innerHeight * 0.9, // 90% of window height
                    'showImageNumberLabel': false // Hide image number
                });
            } else {
                console.warn("Lightbox script not loaded or initialized.");
                // Try to load Lightbox dynamically if it's not available
                const script = document.createElement('script');
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/js/lightbox.min.js";
                script.onload = function() {
                    console.log("Lightbox loaded dynamically");
                    if (typeof lightbox !== 'undefined') {
                        lightbox.option({
                            'wrapAround': true,
                            'albumLabel': '',
                            'showImageNumberLabel': false,
                            'fitImagesInViewport': true,
                            'maxWidth': window.innerWidth * 0.95,
                            'maxHeight': window.innerHeight * 0.9
                        });
                    }
                };
                document.body.appendChild(script);
            }
        }, 100); // Small delay to ensure DOM is ready
    }

    // --- Display Loading/Error Messages ---
    function displayMessage(message, isError = false) {
        galleryGrid.innerHTML = '';
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('gallery-message');
        if (isError) {
            messageDiv.classList.add('error');
        }
        messageDiv.textContent = message;
        galleryGrid.appendChild(messageDiv);
    }
});