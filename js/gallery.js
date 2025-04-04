document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.querySelector('.gallery-grid');
    const categoryTitleElement = document.querySelector('.category-header h2');
    
    // Check if we're on the index page
    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname.endsWith('/') ||
                        window.location.pathname.split('/').pop() === '';
    
    if (isIndexPage) {
        // If on index page, update preview images with random selections
        updateRandomCategoryPreviews();
    } else if (!galleryGrid || !categoryTitleElement) {
        // If on category page but elements not found
        console.error("Essential elements (gallery grid or category header) not found.");
        return;
    } else {
        // Normal gallery page processing
        loadGallery();
    }

    // Function to update category preview images on index page with random selections
    function updateRandomCategoryPreviews() {
        fetch('gallery-data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // For each category, update the preview image with a random selection
                Object.keys(data).forEach(category => {
                    if (data[category] && data[category].length > 0) {
                        // Get a random image from the category
                        const randomIndex = Math.floor(Math.random() * data[category].length);
                        const randomImage = data[category][randomIndex];
                        
                        // Find the portfolio item for this category
                        const portfolioItem = document.querySelector(`.portfolio-item a[href="pages/${category}.html"] img`);
                        if (portfolioItem) {
                            portfolioItem.src = randomImage;
                            console.log(`Updated preview for ${category} with random image: ${randomImage}`);
                        }
                    }
                });
                
                // Also update the slideshow with random images
                updateSlideshowImages(data);
            })
            .catch(error => {
                console.error('Error updating category previews:', error);
                // No need to fix paths - index.html already has correct paths as fallbacks
            });
    }
    
    // Function to update slideshow images with random selections
    function updateSlideshowImages(data) {
        const slideshowItems = document.querySelectorAll('.slideshow-item');
        if (slideshowItems.length === 0) return;
        
        // Get all available images from all categories
        const allImages = [];
        Object.keys(data).forEach(category => {
            if (data[category] && data[category].length > 0) {
                // Get up to 3 random images from each category
                const categoryImages = [...data[category]];
                for (let i = 0; i < Math.min(3, categoryImages.length); i++) {
                    const randomIndex = Math.floor(Math.random() * categoryImages.length);
                    allImages.push(categoryImages[randomIndex]);
                    categoryImages.splice(randomIndex, 1); // Remove to avoid duplicates
                }
            }
        });
        
        if (allImages.length === 0) return;
        
        // Update each slideshow item with a random image
        slideshowItems.forEach((item, index) => {
            if (index < allImages.length) {
                // Use images in sequence from our random selection
                const randomImage = allImages[index];
                item.style.backgroundImage = `url('${randomImage}')`;
            } else {
                // If we have more slideshow items than images, cycle through
                const randomIndex = index % allImages.length;
                item.style.backgroundImage = `url('${allImages[randomIndex]}')`;
            }
        });
        
        console.log("Updated slideshow with random images");
    }

    // Function to load the gallery for a specific category page
    function loadGallery() {
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
                let imagePaths = data[categoryKey];

                if (!imagePaths) {
                    displayMessage(`Geen data gevonden voor categorie: ${categoryKey}`, true);
                    console.warn(`Category key "${categoryKey}" not found in gallery-data.json`);
                    return;
                }

                if (imagePaths.length === 0) {
                    displayMessage("Er zijn nog geen afbeeldingen in deze categorie.");
                    return;
                }

                // Custom sorting for architectuur category
                if (categoryKey === 'architectuur') {
                    // Find the indices of the specific files
                    const lastIndex = imagePaths.findIndex(path => path.includes('Architectuur01.jpg'));
                    const firstIndex = imagePaths.findIndex(path => path.includes('Architectuur23.jpg'));
                    
                    if (lastIndex !== -1 && firstIndex !== -1) {
                        // Create a new array with the desired order
                        const reorderedPaths = [...imagePaths];
                        
                        // Remove the items we want to reposition
                        const lastItem = reorderedPaths.splice(lastIndex, 1)[0];
                        // After removing the first item, we need to adjust the index for the second removal
                        const firstItemIndex = reorderedPaths.findIndex(path => path.includes('Architectuur23.jpg'));
                        const firstItem = reorderedPaths.splice(firstItemIndex, 1)[0];
                        
                        // Add them at the desired positions
                        reorderedPaths.unshift(firstItem); // Add at the beginning
                        reorderedPaths.push(lastItem);     // Add at the end
                        
                        imagePaths = reorderedPaths;
                        console.log("Reordered architectuur gallery with custom sorting");
                    }
                }

                populateGallery(imagePaths, categoryKey, fullTitle.split(' Fotografie')[0]);
            })
            .catch(error => {
                console.error('Error loading gallery data:', error);
                displayMessage("Fout bij het laden van de galerij afbeeldingen.", true);
            });
    }

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