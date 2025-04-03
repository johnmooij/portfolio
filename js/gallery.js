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
            // No title to avoid captions
                
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
            if (typeof lightbox !== 'undefined' && typeof jQuery !== 'undefined') {
                try {
                    // Configure Lightbox
                    lightbox.option({
                        'resizeDuration': 300,
                        'fadeDuration': 300,
                        'imageFadeDuration': 300,
                        'wrapAround': true,
                        'albumLabel': '',
                        'positionFromTop': 50,
                        'alwaysShowNavOnTouchDevices': true,
                        'disableScrolling': true,
                        'showImageNumberLabel': false
                    });
                    console.log("Lightbox configured successfully");
                } catch (e) {
                    console.error("Error configuring lightbox:", e);
                }
            } else {
                console.warn("Lightbox or jQuery not loaded, attempting to load dynamically");
                
                // First load jQuery if needed
                if (typeof jQuery === 'undefined') {
                    const jQueryScript = document.createElement('script');
                    jQueryScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js";
                    jQueryScript.onload = function() {
                        console.log("jQuery loaded dynamically");
                        
                        // Now load Lightbox
                        const lightboxScript = document.createElement('script');
                        lightboxScript.src = "https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/js/lightbox.min.js";
                        lightboxScript.onload = function() {
                            console.log("Lightbox loaded dynamically");
                            // Wait a moment for initialization
                            setTimeout(() => {
                                if (typeof lightbox !== 'undefined') {
                                    lightbox.option({
                                        'wrapAround': true,
                                        'albumLabel': '',
                                        'showImageNumberLabel': false
                                    });
                                }
                            }, 500);
                        };
                        document.body.appendChild(lightboxScript);
                    };
                    document.body.appendChild(jQueryScript);
                } else {
                    // Just load Lightbox if jQuery is already available
                    const lightboxScript = document.createElement('script');
                    lightboxScript.src = "https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/js/lightbox.min.js";
                    lightboxScript.onload = function() {
                        console.log("Lightbox loaded dynamically");
                        setTimeout(() => {
                            if (typeof lightbox !== 'undefined') {
                                lightbox.option({
                                    'wrapAround': true,
                                    'albumLabel': '',
                                    'showImageNumberLabel': false
                                });
                            }
                        }, 500);
                    };
                    document.body.appendChild(lightboxScript);
                }
            }
        }, 100);
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