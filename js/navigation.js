/**
 * NAVIGATION.JS - Gestion de la navigation
 * Module dédié à la navigation, scroll et liens
 */

class NavigationManager {
    constructor() {
        this.elements = {};
        this.state = {
            isMenuOpen: false,
            currentSection: '',
            lastScrollY: 0,
            isScrollingDown: false
        };
        this.config = {
            headerHeight: 70,
            scrollOffset: 100,
            smoothScrollDuration: 800
        };
    }

    // Initialisation
    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateActiveSection();
        console.log('Navigation Manager initialisé');
    }

    // Cache des éléments
    cacheElements() {
        this.elements = {
            header: document.querySelector('.header'),
            nav: document.querySelector('.navigation'),
            navList: document.querySelector('.nav-list'),
            navLinks: document.querySelectorAll('.nav-link'),
            mobileToggle: document.querySelector('.mobile-menu-toggle'),
            sections: document.querySelectorAll('section[id]'),
            backToTop: document.querySelector('.back-to-top a')
        };

        // Vérifications de sécurité
        if (!this.elements.header) {
            console.warn('Header non trouvé');
        }
    }

    // Liaison des événements
    bindEvents() {
        // Scroll optimisé
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Menu mobile
        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        // Liens de navigation
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e, link));
        });

        // Back to top
        if (this.elements.backToTop) {
            this.elements.backToTop.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToTop();
            });
        }

        // Fermeture menu mobile sur échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Fermeture menu mobile sur clic externe
        document.addEventListener('click', (e) => {
            if (this.state.isMenuOpen && 
                !this.elements.mobileToggle?.contains(e.target) && 
                !this.elements.navList?.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Redimensionnement
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    // Gestion du scroll
    handleScroll() {
        const currentScrollY = window.pageYOffset;
        this.state.isScrollingDown = currentScrollY > this.state.lastScrollY;
        this.state.lastScrollY = currentScrollY;

        this.updateHeaderState();
        this.updateActiveSection();
        this.updateBackToTopVisibility();
    }

    // Mise à jour de l'état du header
    updateHeaderState() {
        if (!this.elements.header) return;

        const scrollY = window.pageYOffset;
        
        // Header scrolled state
        if (scrollY > 50) {
            this.elements.header.classList.add('scrolled');
        } else {
            this.elements.header.classList.remove('scrolled');
        }

        // Auto-hide header on mobile when scrolling down
        if (window.innerWidth <= 768) {
            if (this.state.isScrollingDown && scrollY > 200) {
                this.elements.header.style.transform = 'translateY(-100%)';
            } else if (!this.state.isScrollingDown) {
                this.elements.header.style.transform = 'translateY(0)';
            }
        } else {
            this.elements.header.style.transform = 'translateY(0)';
        }
    }

    // Mise à jour de la section active
    updateActiveSection() {
        let currentSection = '';
        const scrollPosition = window.pageYOffset + this.config.scrollOffset;

        this.elements.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        // Si on est tout en bas de la page, activer la dernière section
        if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 10) {
            const lastSection = Array.from(this.elements.sections).pop();
            if (lastSection) {
                currentSection = lastSection.id;
            }
        }

        if (currentSection !== this.state.currentSection) {
            this.state.currentSection = currentSection;
            this.updateActiveNavLink(currentSection);
        }
    }

    // Mise à jour du lien actif
    updateActiveNavLink(sectionId) {
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active');
            
            const href = link.getAttribute('href');
            if (href) {
                const linkSection = href.replace('#', '');
                if (linkSection === sectionId) {
                    link.classList.add('active');
                }
            }
        });
    }

    // Visibilité du bouton back to top
    updateBackToTopVisibility() {
        if (!this.elements.backToTop) return;

        const scrollY = window.pageYOffset;
        const showThreshold = window.innerHeight * 0.5;

        if (scrollY > showThreshold) {
            this.elements.backToTop.style.opacity = '1';
            this.elements.backToTop.style.pointerEvents = 'auto';
        } else {
            this.elements.backToTop.style.opacity = '0';
            this.elements.backToTop.style.pointerEvents = 'none';
        }
    }

    // Gestion des clics de navigation
    handleNavClick(e, link) {
        const href = link.getAttribute('href');

        if (href && href.startsWith('#')) {
            e.preventDefault();
            
            const targetId = href.substring(1);
            const target = document.getElementById(targetId);

            if (target) {
                this.smoothScrollToElement(target);
                
                // Fermer le menu mobile si ouvert
                if (this.state.isMenuOpen) {
                    this.closeMobileMenu();
                }

                // Mettre à jour l'URL sans déclencher de scroll
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            }
        }
    }

    // Scroll fluide vers un élément
    smoothScrollToElement(element) {
        const headerHeight = this.elements.header ? this.elements.header.offsetHeight : this.config.headerHeight;
        const targetPosition = element.offsetTop - headerHeight - 20;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = this.config.smoothScrollDuration;
        let start = null;

        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }

    // Easing function pour smooth scroll
    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    // Scroll vers le haut
    scrollToTop() {
        this.smoothScrollToElement(document.body);
    }

    // Toggle menu mobile
    toggleMobileMenu() {
        this.state.isMenuOpen = !this.state.isMenuOpen;
        
        if (this.elements.navList) {
            this.elements.navList.classList.toggle('show', this.state.isMenuOpen);
        }

        this.animateHamburger(this.state.isMenuOpen);
        
        // Prévenir le scroll du body
        document.body.style.overflow = this.state.isMenuOpen ? 'hidden' : '';
        
        // Ajouter aria-expanded pour l'accessibilité
        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.setAttribute('aria-expanded', this.state.isMenuOpen.toString());
        }

        // Focus management
        if (this.state.isMenuOpen) {
            setTimeout(() => {
                const firstLink = this.elements.navList?.querySelector('.nav-link');
                if (firstLink) {
                    firstLink.focus();
                }
            }, 300);
        }
    }

    // Fermer menu mobile
    closeMobileMenu() {
        if (!this.state.isMenuOpen) return;

        this.state.isMenuOpen = false;
        
        if (this.elements.navList) {
            this.elements.navList.classList.remove('show');
        }

        this.animateHamburger(false);
        document.body.style.overflow = '';

        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.setAttribute('aria-expanded', 'false');
        }
    }

    // Animation du hamburger
    animateHamburger(isOpen) {
        if (!this.elements.mobileToggle) return;

        const spans = this.elements.mobileToggle.querySelectorAll('span');
        
        if (spans.length >= 3) {
            spans.forEach(span => {
                span.style.transition = 'all 0.3s ease';
            });

            if (isOpen) {
                spans[0].style.transform = 'translateY(8px) rotate(45deg)';
                spans[1].style.opacity = '0';
                spans[1].style.transform = 'scale(0)';
                spans[2].style.transform = 'translateY(-8px) rotate(-45deg)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[1].style.transform = 'scale(1)';
                spans[2].style.transform = 'none';
            }
        }
    }

    // Gestion du redimensionnement
    handleResize() {
        // Fermer le menu mobile si on passe en desktop
        if (window.innerWidth > 768 && this.state.isMenuOpen) {
            this.closeMobileMenu();
        }

        // Réinitialiser la transformation du header sur desktop
        if (window.innerWidth > 768 && this.elements.header) {
            this.elements.header.style.transform = 'translateY(0)';
        }

        // Recalculer la hauteur du header
        if (this.elements.header) {
            this.config.headerHeight = this.elements.header.offsetHeight;
        }
    }

    // Navigation par breadcrumb
    generateBreadcrumb() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        
        let breadcrumb = '<nav aria-label="breadcrumb"><ol class="breadcrumb">';
        breadcrumb += '<li><a href="/">Accueil</a></li>';
        
        if (currentHash) {
            const sectionName = this.getSectionName(currentHash);
            breadcrumb += `<li aria-current="page">${sectionName}</li>`;
        }
        
        breadcrumb += '</ol></nav>';
        return breadcrumb;
    }

    // Obtenir le nom de la section
    getSectionName(hash) {
        const sectionNames = {
            '#accueil': 'Accueil',
            '#a-propos': 'À propos',
            '#formation': 'Formation',
            '#competences-but': 'Compétences BUT',
            '#competences-tech': 'Technologies',
            '#projets': 'Projets',
            '#contact': 'Contact'
        };
        return sectionNames[hash] || 'Section';
    }

    // Navigation au clavier
    setupKeyboardNavigation() {
        this.elements.navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                const links = Array.from(this.elements.navLinks);
                
                switch (e.key) {
                    case 'ArrowDown':
                    case 'ArrowRight':
                        e.preventDefault();
                        const nextIndex = (index + 1) % links.length;
                        links[nextIndex].focus();
                        break;
                        
                    case 'ArrowUp':
                    case 'ArrowLeft':
                        e.preventDefault();
                        const prevIndex = (index - 1 + links.length) % links.length;
                        links[prevIndex].focus();
                        break;
                        
                    case 'Home':
                        e.preventDefault();
                        links[0].focus();
                        break;
                        
                    case 'End':
                        e.preventDefault();
                        links[links.length - 1].focus();
                        break;
                }
            });
        });
    }

    // Utilitaire debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialisation automatique au chargement
    static autoInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                new NavigationManager().init();
            });
        } else {
            new NavigationManager().init();
        }
    }

    // Nettoyage
    destroy() {
        this.closeMobileMenu();
        document.body.style.overflow = '';
        
        // Supprimer les event listeners si nécessaire
        // (En pratique, on ne fait généralement pas cela sauf cas spécifiques)
    }
}

// Auto-initialisation
NavigationManager.autoInit();

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}

// Ajout à l'objet global pour debugging
window.NavigationManager = NavigationManager;