document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.querySelector('.gallery-grid');
    const categoryTitleElement = document.querySelector('.category-header h2');

    if (!galleryGrid || !categoryTitleElement) {
        console.error("Essential elements (gallery grid or category header) not found.");
        return;
    }

    // --- Determine Category ---
    // Simple approach: derive from the H2 text. Assumes H2 text starts with the category name.
    // Example H2: "Architectuur Fotografie" -> categoryKey = "architectuur"
    const fullTitle = categoryTitleElement.textContent.trim();
    // Extract the first word and convert to lowercase
    const categoryKey = fullTitle.split(' ')[0].toLowerCase();
    
    console.log("Detected category key:", categoryKey); // Add this for debugging

    if (!categoryKey) {
        displayMessage("Kon categorie niet bepalen.", true);
        return;
    }

    // --- Fetch Gallery Data ---
    fetch('../gallery-data.json') // Fetch from the root directory
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

            populateGallery(imagePaths, categoryKey, fullTitle.split(' Fotografie')[0]); // Pass base title for lightbox
        })
        .catch(error => {
            console.error('Error loading gallery data:', error);
            displayMessage("Fout bij het laden van de galerij afbeeldingen.", true);
        });

    // --- Populate Gallery Grid ---
    function populateGallery(paths, key, baseTitle) {
        galleryGrid.innerHTML = ''; // Clear any existing content or loading message
        paths.forEach((path, index) => {
            const item = document.createElement('div');
            item.classList.add('gallery-item');

            const link = document.createElement('a');
            link.href = path;
            link.dataset.lightbox = key; // Group images by category for Lightbox
            link.dataset.title = `${baseTitle} foto ${index + 1}`; // Generate a title

            const img = document.createElement('img');
            img.src = path;
            img.alt = `${baseTitle} foto ${index + 1}`;
            img.loading = 'lazy'; // Lazy load images for better performance

            link.appendChild(img);
            item.appendChild(link);
            galleryGrid.appendChild(item);
        });

        // --- Initialize Lightbox ---
        // Ensure lightbox is initialized *after* images are added to the DOM
        if (typeof lightbox !== 'undefined') {
             lightbox.option({
                'resizeDuration': 300,
                'fadeDuration': 300,
                'imageFadeDuration': 300,
                'wrapAround': true,
                'albumLabel': `${baseTitle} - Afbeelding %1 van %2`, // Customized label
                'positionFromTop': 50 // Adjust vertical position if needed
            });
            // Refresh lightbox to detect new items, just in case
            // lightbox.init(); // Usually not needed if attributes are correct from start
        } else {
            console.warn("Lightbox script not loaded or initialized.");
        }
    }

    // --- Display Loading/Error Messages ---
    function displayMessage(message, isError = false) {
        galleryGrid.innerHTML = ''; // Clear grid
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('gallery-message');
        if (isError) {
            messageDiv.classList.add('error');
        }
        messageDiv.textContent = message;
        galleryGrid.appendChild(messageDiv);
    }

    // Initial loading message (optional)
    // displayMessage("Galerij laden...");

});