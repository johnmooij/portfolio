document.addEventListener('DOMContentLoaded', () => {
    // --- Slideshow ---
    const slideshowItems = document.querySelectorAll('.slideshow-item');
    let currentSlide = 0;
    const slideInterval = 5000; // Time per slide in milliseconds (5 seconds)

    function showSlide(index) {
        slideshowItems.forEach((item, i) => {
            item.classList.remove('active');
            if (i === index) {
                item.classList.add('active');
            }
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideshowItems.length;
        showSlide(currentSlide);
    }

    if (slideshowItems.length > 1) {
        showSlide(currentSlide); // Show the first slide initially
        setInterval(nextSlide, slideInterval);
    } else if (slideshowItems.length === 1) {
        showSlide(0); // Ensure the single slide is active
    }

    // --- Smooth Scrolling for Nav Links ---
    const navLinks = document.querySelectorAll('header nav ul li a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor jump
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Calculate scroll position, accounting for sticky header height if necessary
                const headerHeight = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth" // Smooth scroll animation
                });
            }
        });
    });

     // --- Smooth Scroll for Logo Link to Top ---
     const logoLink = document.querySelector('.logo h1 a[href="#top"]');
     if (logoLink) {
        logoLink.addEventListener('click', function(e) {
             e.preventDefault();
             window.scrollTo({
                 top: 0,
                 behavior: "smooth"
             });
         });
     }


    // --- Basic Form Placeholder (Does not actually send email) ---
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent actual submission
            alert("Bedankt voor uw bericht! (Dit is een demo - er is geen e-mail verzonden).");
            contactForm.reset(); // Clear the form
        });
    }
});