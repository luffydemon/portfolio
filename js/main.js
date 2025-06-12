/**
 * MAIN.JS - Fonctionnalités principales du portfolio
 * Version optimisée avec gestion d'erreurs et performance améliorée
 */

// Configuration et constantes
const CONFIG = {
    SCROLL_THRESHOLD: 50,
    HEADER_PADDING_SCROLLED: '1rem 0',
    HEADER_PADDING_DEFAULT: '1.5rem 0',
    ANIMATION_DELAY: 300,
    SECTION_OFFSET: 200
};

// State management
const AppState = {
    isMenuOpen: false,
    currentSection: '',
    isScrolling: false
};

// Utilitaires
const Utils = {
    // Throttle pour optimiser les performances
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Debounce pour les événements fréquents
    debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },

    // Vérification sécurisée des éléments DOM
    safeQuerySelector(selector, context = document) {
        try {
            return context.querySelector(selector);
        } catch (error) {
            console.warn(`Sélecteur invalide: ${selector}`, error);
            return null;
        }
    },

    safeQuerySelectorAll(selector, context = document) {
        try {
            return context.querySelectorAll(selector);
        } catch (error) {
            console.warn(`Sélecteur invalide: ${selector}`, error);
            return [];
        }
    }
};

// Gestionnaire principal de l'application
class PortfolioApp {
    constructor() {
        this.elements = {};
        this.isInitialized = false;
    }

    // Initialisation principale
    init() {
        if (this.isInitialized) return;

        try {
            this.cacheElements();
            this.bindEvents();
            this.setupIntersectionObserver();
            this.initAnimations();
            this.isInitialized = true;
            console.log('Portfolio initialisé avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
    }

    // Cache des éléments DOM
    cacheElements() {
        const selectors = {
            header: '.header',
            mobileMenuToggle: '.mobile-menu-toggle',
            navList: '.nav-list',
            navLinks: '.nav-link',
            filterBtns: '.filter-btn',
            projectCards: '.project-card',
            contactForm: '#contact-form',
            sections: 'section[id]',
            fadeElements: '.fade-in',
            competenceCards: '.competence-card',
            timelineItems: '.timeline-item'
        };

        Object.keys(selectors).forEach(key => {
            if (key.endsWith('s') || key === 'navLinks' || key === 'filterBtns') {
                this.elements[key] = Utils.safeQuerySelectorAll(selectors[key]);
            } else {
                this.elements[key] = Utils.safeQuerySelector(selectors[key]);
            }
        });

        // Vérification des éléments critiques
        if (!this.elements.header) {
            console.warn('Header non trouvé - certaines fonctionnalités peuvent être indisponibles');
        }
    }

    // Liaison des événements
    bindEvents() {
        // Événement de scroll optimisé
        const throttledScrollHandler = Utils.throttle(() => {
            this.handleScroll();
        }, 16); // 60fps

        window.addEventListener('scroll', throttledScrollHandler, { passive: true });

        // Menu mobile
        if (this.elements.mobileMenuToggle) {
            this.elements.mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        // Navigation links
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e, link);
            });
        });

        // Filtres de projets
        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterClick(e, btn);
            });
        });

        // Formulaire de contact
        if (this.elements.contactForm) {
            this.elements.contactForm.addEventListener('submit', (e) => {
                this.handleContactSubmit(e);
            });
        }

        // Redimensionnement de fenêtre
        const debouncedResizeHandler = Utils.debounce(() => {
            this.handleResize();
        }, 250);

        window.addEventListener('resize', debouncedResizeHandler);

        // Fermeture du menu mobile sur clic externe
        document.addEventListener('click', (e) => {
            if (AppState.isMenuOpen && !this.elements.mobileMenuToggle?.contains(e.target) && !this.elements.navList?.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    // Gestion du scroll
    handleScroll() {
        if (!this.elements.header) return;

        const scrollY = window.pageYOffset;
        
        // Animation du header
        if (scrollY > CONFIG.SCROLL_THRESHOLD) {
            this.elements.header.classList.add('scrolled');
        } else {
            this.elements.header.classList.remove('scrolled');
        }

        // Navigation active
        this.updateActiveNavigation();
    }

    // Mise à jour de la navigation active
    updateActiveNavigation() {
        let current = '';
        
        this.elements.sections.forEach(section => {
            if (!section.id) return;
            
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            
            if (sectionTop <= CONFIG.SECTION_OFFSET && sectionTop + sectionHeight > CONFIG.SECTION_OFFSET) {
                current = section.id;
            }
        });

        if (current && current !== AppState.currentSection) {
            AppState.currentSection = current;
            
            this.elements.navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href && href.substring(1) === current) {
                    link.classList.add('active');
                }
            });
        }
    }

    // Gestion du menu mobile
    toggleMobileMenu() {
        AppState.isMenuOpen = !AppState.isMenuOpen;
        
        if (this.elements.navList) {
            this.elements.navList.classList.toggle('show', AppState.isMenuOpen);
        }
        
        this.animateHamburger(AppState.isMenuOpen);
        
        // Prévenir le scroll en arrière-plan
        document.body.style.overflow = AppState.isMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu() {
        if (!AppState.isMenuOpen) return;
        
        AppState.isMenuOpen = false;
        
        if (this.elements.navList) {
            this.elements.navList.classList.remove('show');
        }
        
        this.animateHamburger(false);
        document.body.style.overflow = '';
    }

    // Animation du hamburger
    animateHamburger(isOpen) {
        if (!this.elements.mobileMenuToggle) return;
        
        const spans = this.elements.mobileMenuToggle.querySelectorAll('span');
        
        if (spans.length >= 3) {
            if (isOpen) {
                spans[0].style.transform = 'translateY(8px) rotate(45deg)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'translateY(-8px) rotate(-45deg)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    }

    // Gestion des clics de navigation
    handleNavClick(e, link) {
        const href = link.getAttribute('href');
        
        // Si c'est un lien interne (commence par #)
        if (href && href.startsWith('#')) {
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                this.smoothScrollTo(targetElement);
            }
            
            // Fermer le menu mobile si ouvert
            if (AppState.isMenuOpen) {
                this.closeMobileMenu();
            }
        }
    }

    // Scroll fluide vers un élément
    smoothScrollTo(element) {
        const headerHeight = this.elements.header ? this.elements.header.offsetHeight : 0;
        const targetPosition = element.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    // Gestion des filtres de projets
    handleFilterClick(e, btn) {
        e.preventDefault();
        
        // Mettre à jour l'état actif
        this.elements.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        this.filterProjects(filter);
    }

    // Filtrage des projets avec animation
    filterProjects(filter) {
        this.elements.projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                card.style.display = 'block';
                // Animation d'apparition retardée
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                // Masquer après l'animation
                setTimeout(() => {
                    card.style.display = 'none';
                }, CONFIG.ANIMATION_DELAY);
            }
        });
    }

    // Gestion du formulaire de contact
    handleContactSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.elements.contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        // Validation simple
        if (!this.validateContactForm(data)) {
            return;
        }
        
        // Simulation d'envoi
        this.submitContactForm(data);
    }

    // Validation du formulaire
    validateContactForm(data) {
        const required = ['name', 'email', 'subject', 'message'];
        const missing = required.filter(field => !data[field] || data[field].trim() === '');
        
        if (missing.length > 0) {
            alert(`Veuillez remplir tous les champs requis: ${missing.join(', ')}`);
            return false;
        }
        
        // Validation email simple
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Veuillez entrer une adresse email valide');
            return false;
        }
        
        return true;
    }

    // Soumission du formulaire
    submitContactForm(data) {
        // Afficher un état de chargement
        const submitBtn = this.elements.contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';
        
        if (submitBtn) {
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;
        }
        
        // Simulation d'envoi avec délai
        setTimeout(() => {
            this.showSuccessMessage();
            console.log('Données du formulaire:', data);
            
            // Réinitialiser le bouton
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }, 1500);
    }

    // Message de succès
    showSuccessMessage() {
        if (!this.elements.contactForm) return;
        
        this.elements.contactForm.innerHTML = `
            <div class="success-message">
                <h3>Merci pour votre message!</h3>
                <p>Je vous répondrai dans les plus brefs délais.</p>
                <button type="button" class="btn btn-primary" onclick="location.reload()">
                    Envoyer un autre message
                </button>
            </div>
        `;
    }

    // Gestion du redimensionnement
    handleResize() {
        // Fermer le menu mobile si la fenêtre devient trop large
        if (window.innerWidth > 768 && AppState.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Recalculer les positions pour l'intersection observer
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.setupIntersectionObserver();
        }
    }

    // Configuration de l'Intersection Observer
    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible', 'scrolled-in-view');
                    
                    // Animation spéciale pour les barres de progression
                    if (entry.target.classList.contains('competence-card')) {
                        this.animateProgressBars(entry.target);
                    }
                }
            });
        }, options);

        // Observer tous les éléments animables
        const elementsToObserve = [
            ...this.elements.fadeElements,
            ...this.elements.competenceCards,
            ...this.elements.timelineItems
        ];

        elementsToObserve.forEach(element => {
            if (element && !element.classList.contains('visible')) {
                this.intersectionObserver.observe(element);
            }
        });
    }

    // Animation des barres de progression
    animateProgressBars(competenceCard) {
        const progressBar = competenceCard.querySelector('.progress');
        if (!progressBar) return;

        const targetWidth = progressBar.style.width || progressBar.getAttribute('data-width') || '0%';
        
        // Stocker la largeur cible
        progressBar.style.setProperty('--target-width', targetWidth);
        progressBar.style.width = '0%';
        
        // Animer vers la largeur cible
        setTimeout(() => {
            progressBar.style.width = targetWidth;
            progressBar.classList.add('animated');
        }, 500);
    }

    // Initialisation des animations
    initAnimations() {
        // Ajouter la classe fade-in aux éléments qui n'en ont pas
        const animatableSelectors = [
            '.skill-card',
            '.project-card', 
            '.about-image', 
            '.about-text',
            '.contact-form',
            '.contact-info'
        ];

        animatableSelectors.forEach(selector => {
            const elements = Utils.safeQuerySelectorAll(selector);
            elements.forEach(element => {
                if (!element.classList.contains('fade-in')) {
                    element.classList.add('fade-in');
                }
            });
        });

        // Animation initiale pour les éléments déjà visibles
        this.animateVisibleElements();
    }

    // Animer les éléments déjà visibles
    animateVisibleElements() {
        const viewportHeight = window.innerHeight;
        
        this.elements.fadeElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < viewportHeight - 100) {
                element.classList.add('visible');
            }
        });
    }

    // Nettoyage des ressources
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        // Retirer les event listeners si nécessaire
        document.body.style.overflow = '';
        AppState.isMenuOpen = false;
        this.isInitialized = false;
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    // Vérification de la compatibilité du navigateur
    if (typeof IntersectionObserver === 'undefined') {
        console.warn('IntersectionObserver non supporté - animations limitées');
    }

    // Créer et initialiser l'application
    window.portfolioApp = new PortfolioApp();
    window.portfolioApp.init();
});

// Gestion des erreurs globales
window.addEventListener('error', (e) => {
    console.error('Erreur JavaScript:', e.error);
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PortfolioApp, Utils, CONFIG };
}