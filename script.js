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
            // Special handling for training contact form - treat as regular Netlify form
            if (formId === 'training-contact-form') {
                // Just use regular Netlify form handling, no payment integration
            }
            
            // For Netlify forms, we do basic validation but allow natural submission
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
            
            if (!isValid) {
                e.preventDefault();
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            // If validation passes, let Netlify handle the form submission
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Envoi en cours...';
                submitBtn.disabled = true;
                
                // Re-enable button after a delay in case submission fails
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 5000);
            }
        });
    }
}

// Handle donor information form submission
function handleDonorInfoSubmit(form) {
    // Validate required fields
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
    
    // Validate amount
    const amountField = form.querySelector('[name="amount"]');
    const amount = parseFloat(amountField ? amountField.value : 0);
    
    if (!amount || amount < 1) {
        isValid = false;
        if (amountField) {
            amountField.style.borderColor = '#ff6b35';
        }
        alert('Veuillez saisir un montant valide (minimum 1€).');
        return;
    }
    
    if (!isValid) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    // Prepare donor data
    const formData = new FormData(form);
    const donorData = {
        firstname: formData.get('firstname'),
        lastname: formData.get('lastname'),
        email: formData.get('email'),
        phone: formData.get('phone') || '',
        address: formData.get('address'),
        postal: formData.get('postal'),
        city: formData.get('city'),
        amount: amount,
        newsletter: formData.get('newsletter') === 'on',
        message: formData.get('message') || ''
    };
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;
    
    // Send to donor info handler
    fetch('donor_info_handler.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(donorData)
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Erreur réseau ${response.status}: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            alert('Votre demande de reçu fiscal a été enregistrée ! Vous recevrez votre reçu par email dans les 30 jours.');
            form.reset();
        } else {
            throw new Error(data.error || 'Erreur lors de l\'enregistrement de votre demande');
        }
    })
    .catch(error => {
        console.error('Donor info error:', error);
        let errorMessage = 'Erreur lors de l\'enregistrement de votre demande. Veuillez réessayer.';
        
        if (error.message.includes('fetch')) {
            errorMessage = 'Problème de connexion. Vérifiez votre connexion internet et réessayez.';
        } else if (error.message.includes('JSON')) {
            errorMessage = 'Erreur de communication avec le serveur. Veuillez réessayer.';
        } else if (error.message.includes('réseau')) {
            errorMessage = `Erreur du serveur: ${error.message}`;
        }
        
        alert(errorMessage);
    })
    .finally(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// Handle training form submission with payment integration
function handleTrainingSubmit(form) {
    // Validate required fields
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
    
    if (!isValid) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    // Prepare training data
    const formData = new FormData(form);
    const trainingData = {
        formation: formData.get('formation'),
        name: formData.get('name'),
        firstname: formData.get('firstname'),
        email: formData.get('email'),
        experience: formData.get('experience') || '',
        motivation: formData.get('motivation') || ''
    };
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Traitement en cours...';
    submitBtn.disabled = true;
    
    // Send to training handler
    fetch('training_handler.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur réseau: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            if (data.method === 'free_registration') {
                // Free training (insertion) - show success message
                alert('Votre inscription a été enregistrée ! Vous recevrez bientôt un email de confirmation.');
                window.location.href = 'training-success.html';
            } else if (data.method === 'mollie' && data.payment_url) {
                // Redirect to Mollie payment page
                window.location.href = data.payment_url;
            } else {
                throw new Error('Réponse inattendue du serveur');
            }
        } else {
            throw new Error(data.error || 'Erreur lors du traitement de l\'inscription');
        }
    })
    .catch(error => {
        console.error('Training registration error:', error);
        let errorMessage = 'Erreur lors du traitement de votre inscription. Veuillez réessayer.';
        
        // Provide more specific error messages
        if (error.message.includes('fetch')) {
            errorMessage = 'Problème de connexion. Vérifiez votre connexion internet et réessayez.';
        } else if (error.message.includes('JSON')) {
            errorMessage = 'Erreur de communication avec le serveur. Veuillez réessayer.';
        }
        
        alert(errorMessage);
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// Initialisation des formulaires
handleFormSubmit('volunteer-form', 'Merci pour votre inscription ! Nous vous contacterons bientôt.');
handleFormSubmit('training-contact-form', 'Votre demande d\'information a été envoyée ! Nous vous contacterons bientôt.');
handleFormSubmit('donor-info-form', 'Votre demande de reçu fiscal a été enregistrée !');
handleFormSubmit('contact-form', 'Votre message a été envoyé. Nous vous répondrons dans les 48h.');
handleFormSubmit('partner-form', 'Votre demande de partenariat a été reçue. Nous vous contacterons prochainement.');
handleFormSubmit('newsletter-form', 'Merci pour votre inscription à la newsletter ! Vous recevrez nos actualités par email.');

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

// Previous donation amount selection code removed - now using direct payment links

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

// ===========================
// Future Farm Video Player
// ===========================

function playFutureVideo() {
    const videoContainer = document.getElementById('future-farm-video');
    const videoElement = document.getElementById('future-video-element');
    const placeholder = videoContainer.querySelector('div[style*="padding-bottom"]');
    
    if (!videoElement || !placeholder) return;
    
    // Check if video source exists
    const videoSource = videoElement.querySelector('source[src*=".mp4"]');
    if (videoSource && videoSource.src && !videoSource.src.includes('videos/ferme-futur-cultures-hors-sols.mp4')) {
        // If we have a real video source, play it
        placeholder.style.display = 'none';
        videoElement.style.display = 'block';
        videoElement.play().catch(e => {
            console.log('Video autoplay blocked:', e);
            showVideoMessage('Cliquez sur le bouton de lecture pour démarrer la vidéo');
        });
    } else {
        // Show a placeholder message when no video is available
        showVideoPlaceholder();
    }
}

function showVideoPlaceholder() {
    const videoContainer = document.getElementById('future-farm-video');
    const placeholder = videoContainer.querySelector('div[style*="padding-bottom"]');
    
    // Create a more engaging placeholder
    const placeholderContent = `
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #0D47A1 0%, #1976D2 50%, #42A5F5 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: white;">
            <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; animation: pulse 2s infinite;">
                <span style="font-size: 3rem;">🎬</span>
            </div>
            <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">Vidéo : Cultures Hors Sols Futuristes</h3>
            <p style="opacity: 0.9; font-size: 1rem; max-width: 400px; margin-bottom: 1.5rem;">
                Découvrez notre vision révolutionnaire de l'agriculture hydroponique et aéroponique automatisée
            </p>
            <div style="background: rgba(255,255,255,0.2); padding: 0.8rem 1.5rem; border-radius: 25px; font-size: 0.9rem;">
                📹 Vidéo en cours d'intégration - Prochainement disponible
            </div>
            <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
                <a href="formations.html" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 0.6rem 1.2rem; border-radius: 20px; text-decoration: none; font-size: 0.9rem; transition: all 0.3s ease;">
                    🎓 Formations Disponibles
                </a>
                <a href="contact.html" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 0.6rem 1.2rem; border-radius: 20px; text-decoration: none; font-size: 0.9rem; transition: all 0.3s ease;">
                    📍 Visiter Dozulé
                </a>
            </div>
        </div>
        <style>
            @keyframes pulse {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
                50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
            }
        </style>
    `;
    
    placeholder.innerHTML = placeholderContent;
}

function showVideoMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: #2E7D32; color: white; padding: 1rem 1.5rem;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-size: 0.9rem; max-width: 300px;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Video Analytics and Engagement
function trackVideoEvent(event, videoId) {
    // Track video engagement for analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', event, {
            'event_category': 'Video',
            'event_label': videoId,
            'value': 1
        });
    }
    console.log(`Video event: ${event} for ${videoId}`);
}

// Enhanced video player with custom controls
function setupVideoPlayer() {
    const videoElement = document.getElementById('future-video-element');
    if (!videoElement) return;
    
    videoElement.addEventListener('loadstart', () => trackVideoEvent('load_start', 'future_farm_video'));
    videoElement.addEventListener('play', () => trackVideoEvent('play', 'future_farm_video'));
    videoElement.addEventListener('pause', () => trackVideoEvent('pause', 'future_farm_video'));
    videoElement.addEventListener('ended', () => {
        trackVideoEvent('complete', 'future_farm_video');
        showVideoCompletionMessage();
    });
}

function showVideoCompletionMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #2E7D32, #66BB6A); color: white;
        padding: 2rem; border-radius: 15px; text-align: center; z-index: 1000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-width: 400px;
    `;
    
    message.innerHTML = `
        <h3 style="margin-bottom: 1rem;">🌱 Merci d'avoir découvert la ferme du futur !</h3>
        <p style="margin-bottom: 1.5rem; opacity: 0.9;">Intéressé par nos formations en agriculture innovante ?</p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <a href="formations.html" style="background: rgba(255,255,255,0.2); color: white; padding: 0.8rem 1.5rem; border-radius: 25px; text-decoration: none; font-weight: bold;">
                🎓 Nos Formations
            </a>
            <a href="contact.html" style="background: rgba(255,255,255,0.2); color: white; padding: 0.8rem 1.5rem; border-radius: 25px; text-decoration: none; font-weight: bold;">
                📞 Nous Contacter
            </a>
        </div>
        <button onclick="this.parentElement.remove()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">×</button>
    `;
    
    document.body.appendChild(message);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (message.parentElement) {
            message.remove();
        }
    }, 10000);
}

// Initialize video functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupVideoPlayer();
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