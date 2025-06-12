/**
 * ANIMATIONS.JS - Animations et effets visuels
 * Module dédié aux animations, transitions et effets visuels
 */

class AnimationManager {
    constructor() {
        this.observers = new Map();
        this.animatedElements = new Set();
        this.config = {
            thresholds: [0.1, 0.25, 0.5, 0.75],
            rootMargin: '0px 0px -50px 0px',
            animationDelay: 100,
            staggerDelay: 200
        };
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Initialisation
    init() {
        this.setupIntersectionObservers();
        this.initScrollAnimations();
        this.initProgressBars();
        this.initCounterAnimations();
        this.initParallaxEffects();
        this.setupReducedMotionSupport();
        this.injectAnimationCSS();
        
        console.log('Animation Manager initialisé');
    }

    // Configuration des observers
    setupIntersectionObservers() {
        // Observer pour les animations de base
        this.createObserver('fadeIn', {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        }, this.handleFadeInAnimation.bind(this));

        // Observer pour les cartes de compétences
        this.createObserver('competences', {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        }, this.handleCompetenceAnimation.bind(this));

        // Observer pour la timeline
        this.createObserver('timeline', {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        }, this.handleTimelineAnimation.bind(this));

        // Observer pour les projets
        this.createObserver('projects', {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }, this.handleProjectAnimation.bind(this));

        // Observer pour les skills
        this.createObserver('skills', {
            threshold: 0.2,
            rootMargin: '0px 0px -75px 0px'
        }, this.handleSkillAnimation.bind(this));
    }

    // Créer un observer
    createObserver(name, options, callback) {
        const observer = new IntersectionObserver(callback, options);
        this.observers.set(name, observer);
        return observer;
    }

    // Initialiser les animations au scroll
    initScrollAnimations() {
        // Éléments avec fade-in
        const fadeElements = document.querySelectorAll('.fade-in, .skill-card, .about-image, .about-text, .contact-form, .contact-info');
        fadeElements.forEach(el => {
            if (!this.isReducedMotion) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            }
            el.classList.add('fade-in');
            this.observers.get('fadeIn')?.observe(el);
        });

        // Cartes de compétences
        const competenceCards = document.querySelectorAll('.competence-card');
        competenceCards.forEach(el => {
            this.observers.get('competences')?.observe(el);
        });

        // Éléments de timeline
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(el => {
            this.observers.get('timeline')?.observe(el);
        });

        // Cartes de projets
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(el => {
            this.observers.get('projects')?.observe(el);
        });

        // Cartes de skills
        const skillCards = document.querySelectorAll('.skill-card');
        skillCards.forEach(el => {
            this.observers.get('skills')?.observe(el);
        });
    }

    // Animation fade-in
    handleFadeInAnimation(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                this.animatedElements.add(entry.target);
                
                if (this.isReducedMotion) {
                    entry.target.classList.add('visible');
                } else {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.classList.add('visible');
                    }, this.config.animationDelay);
                }
            }
        });
    }

    // Animation des compétences
    handleCompetenceAnimation(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                this.animatedElements.add(entry.target);
                
                // Animer la carte
                entry.target.classList.add('visible', 'scrolled-in-view');
                
                // Animer la barre de progression
                setTimeout(() => {
                    this.animateProgressBar(entry.target);
                }, 300);
            }
        });
    }

    // Animation de la timeline
    handleTimelineAnimation(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                this.animatedElements.add(entry.target);
                
                const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                
                setTimeout(() => {
                    entry.target.classList.add('scrolled-in-view');
                    
                    // Effet de type machine à écrire pour le contenu
                    const title = entry.target.querySelector('h3');
                    if (title) {
                        this.typewriterEffect(title);
                    }
                }, index * this.config.staggerDelay);
            }
        });
    }

    // Animation des projets
    handleProjectAnimation(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                this.animatedElements.add(entry.target);
                
                const cards = Array.from(entry.target.parentNode.querySelectorAll('.project-card'));
                const index = cards.indexOf(entry.target);
                
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    if (!this.isReducedMotion) {
                        entry.target.style.animation = 'slideInUp 0.6s ease forwards';
                    }
                }, index * 100);
            }
        });
    }

    // Animation des skills
    handleSkillAnimation(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                this.animatedElements.add(entry.target);
                
                const cards = Array.from(entry.target.parentNode.querySelectorAll('.skill-card'));
                const index = cards.indexOf(entry.target);
                
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    if (!this.isReducedMotion) {
                        entry.target.style.animation = 'fadeInScale 0.6s ease forwards';
                    }
                }, index * 150);
            }
        });
    }

    // Animation des barres de progression
    animateProgressBar(competenceCard) {
        const progressBar = competenceCard.querySelector('.progress');
        if (!progressBar || this.isReducedMotion) return;

        const targetWidth = progressBar.getAttribute('data-width') || progressBar.style.width || '0%';
        progressBar.style.setProperty('--target-width', targetWidth);
        progressBar.style.width = '0%';
        
        // Animation avec easing personnalisé
        const startTime = performance.now();
        const duration = 2000;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out-cubic)
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentWidth = parseInt(targetWidth) * easeOutCubic;
            
            progressBar.style.width = `${currentWidth}%`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                progressBar.classList.add('completed');
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Initialiser les barres de progression
    initProgressBars() {
        const progressBars = document.querySelectorAll('.progress');
        progressBars.forEach(bar => {
            // Stocker la valeur cible
            const targetWidth = bar.style.width || bar.getAttribute('data-width') || '0%';
            bar.setAttribute('data-target-width', targetWidth);
            if (!this.isReducedMotion) {
                bar.style.width = '0%';
            }
        });
    }

    // Animation de compteur
    initCounterAnimations() {
        const counters = document.querySelectorAll('[data-count]');
        if (counters.length === 0) return;

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animatedElements.add(entry.target);
                    this.animateCounter(entry.target);
                }
            });
        }, { threshold: 0.7 });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    // Animer un compteur
    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const startTime = performance.now();
        const startValue = 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        if (!this.isReducedMotion) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = target.toLocaleString();
        }
    }

    // Effet machine à écrire
    typewriterEffect(element) {
        if (!element || this.isReducedMotion) return;

        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid var(--primary-color)';
        
        let index = 0;
        const speed = 50;
        
        const type = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                // Faire clignoter le curseur puis le supprimer
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 500);
            }
        };

        setTimeout(type, 300);
    }

    // Effets parallax
    initParallaxEffects() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (parallaxElements.length === 0 || this.isReducedMotion) return;

        let ticking = false;
        
        const updateParallax = () => {
            const scrollY = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;
                const yPos = -(scrollY * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // Animation des filtres de projets
    animateProjectFilter(container, filter) {
        const cards = container.querySelectorAll('.project-card');
        
        cards.forEach((card, index) => {
            const category = card.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                card.style.display = 'block';
                
                if (!this.isReducedMotion) {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8) translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1) translateY(0)';
                    }, index * 100);
                } else {
                    card.style.opacity = '1';
                    card.style.transform = 'none';
                }
            } else {
                if (!this.isReducedMotion) {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                } else {
                    card.style.display = 'none';
                }
            }
        });
    }

    // Animation de changement d'image dans la galerie
    animateImageChange(mainImage, newSrc) {
        if (this.isReducedMotion) {
            mainImage.src = newSrc;
            return;
        }

        // Effet de fondu
        mainImage.style.opacity = '0';
        
        setTimeout(() => {
            mainImage.src = newSrc;
            mainImage.onload = () => {
                mainImage.style.opacity = '1';
            };
        }, 150);
    }

    // Animation de pulsation pour les boutons
    pulseAnimation(element) {
        if (this.isReducedMotion) return;

        element.style.animation = 'pulse 0.6s ease-in-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    // Animation de secousse pour les erreurs
    shakeAnimation(element) {
        if (this.isReducedMotion) return;

        element.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    // Animation de succès
    successAnimation(element) {
        if (this.isReducedMotion) return;

        element.style.animation = 'bounceIn 0.6s ease-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    // Animation au hover des éléments
    initHoverAnimations() {
        // Cards hover effects
        document.querySelectorAll('.skill-card, .project-card, .competence-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    card.style.transform = 'translateY(-5px) scale(1.02)';
                }
            });

            card.addEventListener('mouseleave', () => {
                if (!this.isReducedMotion) {
                    card.style.transform = '';
                }
            });
        });

        // Button hover effects
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    btn.style.transform = 'translateY(-2px)';
                }
            });

            btn.addEventListener('mouseleave', () => {
                if (!this.isReducedMotion) {
                    btn.style.transform = '';
                }
            });
        });
    }

    // Animation des liens sociaux
    initSocialLinksAnimation() {
        const socialLinks = document.querySelectorAll('.social-links a');
        
        socialLinks.forEach((link, index) => {
            link.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    link.style.animation = `socialPulse 0.6s ease-in-out`;
                }
            });

            link.addEventListener('mouseleave', () => {
                link.style.animation = '';
            });

            // Animation d'apparition échelonnée
            if (!this.isReducedMotion) {
                link.style.opacity = '0';
                link.style.transform = 'scale(0)';
                
                setTimeout(() => {
                    link.style.opacity = '1';
                    link.style.transform = 'scale(1)';
                    link.style.transition = 'all 0.3s ease';
                }, index * 200 + 1000);
            }
        });
    }

    // Support pour prefers-reduced-motion
    setupReducedMotionSupport() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleMotionChange = (e) => {
            this.isReducedMotion = e.matches;
            
            if (this.isReducedMotion) {
                // Désactiver toutes les animations
                document.documentElement.style.setProperty('--animation-duration', '0.01ms');
                document.documentElement.style.setProperty('--transition-duration', '0.01ms');
                
                // Rendre tous les éléments visibles immédiatement
                document.querySelectorAll('.fade-in').forEach(el => {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                });
            } else {
                // Réactiver les animations
                document.documentElement.style.removeProperty('--animation-duration');
                document.documentElement.style.removeProperty('--transition-duration');
            }
        };

        mediaQuery.addListener(handleMotionChange);
        handleMotionChange(mediaQuery);
    }

    // Ajouter les animations CSS dynamiquement
    injectAnimationCSS() {
        const css = `
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            @keyframes bounceIn {
                0% { 
                    opacity: 0;
                    transform: scale(0.3);
                }
                50% { 
                    opacity: 1;
                    transform: scale(1.05);
                }
                70% { 
                    transform: scale(0.9);
                }
                100% { 
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes socialPulse {
                0% { transform: scale(1) rotate(0deg); }
                50% { transform: scale(1.2) rotate(5deg); }
                100% { transform: scale(1) rotate(0deg); }
            }
            
            @keyframes progressFill {
                from { width: 0%; }
                to { width: var(--target-width, 100%); }
            }
            
            /* Animation pour les éléments de timeline */
            .timeline-item {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.8s ease, transform 0.8s ease;
            }
            
            .timeline-item.scrolled-in-view {
                opacity: 1;
                transform: translateY(0);
            }
            
            .timeline-item:nth-child(even) {
                transform: translateY(30px) translateX(30px);
            }
            
            .timeline-item:nth-child(even).scrolled-in-view {
                transform: translateY(0) translateX(0);
            }
            
            .timeline-item:nth-child(odd) {
                transform: translateY(30px) translateX(-30px);
            }
            
            .timeline-item:nth-child(odd).scrolled-in-view {
                transform: translateY(0) translateX(0);
            }
            
            /* Animation pour les barres de progression */
            .progress {
                transition: width 2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .progress.completed {
                animation: progressComplete 0.3s ease;
            }
            
            @keyframes progressComplete {
                0% { background: var(--primary-color); }
                50% { background: var(--accent-color); }
                100% { background: var(--primary-color); }
            }
            
            /* Animations hover */
            .skill-card, .project-card, .competence-card {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .btn {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            /* Animations responsives */
            @media (max-width: 768px) {
                .timeline-item:nth-child(even),
                .timeline-item:nth-child(odd) {
                    transform: translateY(30px) !important;
                }
                
                .timeline-item:nth-child(even).scrolled-in-view,
                .timeline-item:nth-child(odd).scrolled-in-view {
                    transform: translateY(0) !important;
                }
            }
            
            /* Support pour reduced motion */
            @media (prefers-reduced-motion: reduce) {
                *,
                *::before,
                *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
                
                .timeline-item,
                .competence-card,
                .skill-card,
                .project-card {
                    opacity: 1 !important;
                    transform: none !important;
                }
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Méthodes utilitaires
    isElementInViewport(element, threshold = 0.1) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;

        const vertInView = (rect.top <= windowHeight * (1 - threshold)) && 
                          ((rect.top + rect.height) >= windowHeight * threshold);
        const horInView = (rect.left <= windowWidth * (1 - threshold)) && 
                         ((rect.left + rect.width) >= windowWidth * threshold);

        return vertInView && horInView;
    }

    // Animation de révélation de texte
    revealText(element, options = {}) {
        if (this.isReducedMotion) return;

        const {
            delay = 0,
            duration = 1000,
            direction = 'up'
        } = options;

        const words = element.textContent.split(' ');
        element.innerHTML = '';

        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = word + ' ';
            span.style.opacity = '0';
            span.style.transform = direction === 'up' ? 'translateY(20px)' : 'translateY(-20px)';
            span.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            element.appendChild(span);

            setTimeout(() => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            }, delay + index * 100);
        });
    }

    // Nettoyage des observers
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        this.animatedElements.clear();
    }

    // Initialisation automatique
    static autoInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                const animationManager = new AnimationManager();
                animationManager.init();
                animationManager.initHoverAnimations();
                animationManager.initSocialLinksAnimation();
                window.animationManager = animationManager;
            });
        } else {
            const animationManager = new AnimationManager();
            animationManager.init();
            animationManager.initHoverAnimations();
            animationManager.initSocialLinksAnimation();
            window.animationManager = animationManager;
        }
    }
}

// Auto-initialisation
AnimationManager.autoInit();

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}