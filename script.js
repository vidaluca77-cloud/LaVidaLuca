// ===========================
// La Vida Luca - JavaScript
// ===========================

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animation du bouton hamburger
            const spans = navToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translateY(10px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
    }
    
    // Fermer le menu mobile lors du clic sur un lien
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form Validation et Submission
function handleFormSubmit(formId, successMessage) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validation basique
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ff6b35';
                } else {
                    field.style.borderColor = '';
                }
            });
            
            if (isValid) {
                // Simulation d'envoi
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Envoi en cours...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    alert(successMessage || 'Formulaire envoyé avec succès !');
                    form.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 1500);
            } else {
                alert('Veuillez remplir tous les champs obligatoires.');
            }
        });
    }
}

// Initialisation des formulaires
handleFormSubmit('volunteer-form', 'Merci pour votre inscription ! Nous vous contacterons bientôt.');
handleFormSubmit('training-form', 'Votre inscription à la formation a été enregistrée !');
handleFormSubmit('donation-form', 'Merci pour votre don ! Vous allez être redirigé vers la page de paiement.');
handleFormSubmit('contact-form', 'Votre message a été envoyé. Nous vous répondrons dans les 48h.');
handleFormSubmit('partner-form', 'Votre demande de partenariat a été reçue. Nous vous contacterons prochainement.');

// Animation on Scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s';
            entry.target.style.opacity = '1';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observer les éléments à animer
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.mission-card, .project-card, .stat-card, .form-section');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
});

// Countdown Timer pour événements
function updateCountdown(elementId, targetDate) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const target = new Date(targetDate).getTime();
    
    setInterval(() => {
        const now = new Date().getTime();
        const distance = target - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        if (distance > 0) {
            element.innerHTML = `${days}j ${hours}h ${minutes}min`;
        } else {
            element.innerHTML = "Événement en cours !";
        }
    }, 60000);
}

// Donation Amount Selection
document.addEventListener('DOMContentLoaded', () => {
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmount = document.getElementById('custom-amount');
    
    amountButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            amountButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (customAmount) {
                customAmount.value = this.dataset.amount || '';
            }
        });
    });
    
    if (customAmount) {
        customAmount.addEventListener('input', function() {
            amountButtons.forEach(b => b.classList.remove('active'));
        });
    }
});

// Newsletter Subscription
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        if (email) {
            alert('Merci pour votre inscription à notre newsletter !');
            this.reset();
        }
    });
}

// Gallery/Carousel simple
function initGallery(galleryId) {
    const gallery = document.getElementById(galleryId);
    if (!gallery) return;
    
    let currentIndex = 0;
    const items = gallery.querySelectorAll('.gallery-item');
    const prevBtn = gallery.querySelector('.gallery-prev');
    const nextBtn = gallery.querySelector('.gallery-next');
    
    function showItem(index) {
        items.forEach((item, i) => {
            item.style.display = i === index ? 'block' : 'none';
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            showItem(currentIndex);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % items.length;
            showItem(currentIndex);
        });
    }
    
    showItem(0);
}

// Initialize gallery if exists
initGallery('project-gallery');

// Stats Counter Animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Animate stats on scroll
document.addEventListener('DOMContentLoaded', () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target || entry.target.textContent);
                animateCounter(entry.target, target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
});

// Active Page Highlighting
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
});

// Copy to Clipboard (for sharing, IBAN, etc.)
function copyToClipboard(text, buttonId) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    button.addEventListener('click', () => {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copié !';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        });
    });
}

// Map Initialization (placeholder)
function initMap() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
        // Ici vous pouvez intégrer Google Maps ou OpenStreetMap
        mapElement.innerHTML = `
            <div style="background: #e0e0e0; height: 400px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                <div style="text-align: center;">
                    <p style="font-size: 2rem;">📍</p>
                    <p>Souleuvre-en-Bocage</p>
                    <p>14350 Calvados</p>
                </div>
            </div>
        `;
    }
}

// Initialize map on page load
document.addEventListener('DOMContentLoaded', initMap);

// Print functionality for documents
function printSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>La Vida Luca</title>');
    printWindow.document.write('<link rel="stylesheet" href="styles.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(section.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// Accessibility: Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    }
});

// Service Worker Registration (for PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed (normal if file doesn't exist)
        });
    });
}

// Export functions for external use
window.LaVidaLuca = {
    handleFormSubmit,
    updateCountdown,
    initGallery,
    copyToClipboard,
    printSection
};