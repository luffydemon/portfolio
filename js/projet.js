/**
 * PROJET.JS - Gestion des pages de détail de projet
 * Version corrigée et optimisée
 */

class ProjectDetailManager {
    constructor() {
        this.elements = {};
        this.state = {
            currentImageIndex: 0,
            images: [],
            isInitialized: false
        };
    }

    // Initialisation
    init() {
        if (this.state.isInitialized) return;

        try {
            this.cacheElements();
            this.setupImageGallery();
            this.bindEvents();
            this.initAnimations();
            this.state.isInitialized = true;
            
            console.log('Gestionnaire de projet initialisé');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du projet:', error);
        }
    }

    // Cache des éléments DOM
    cacheElements() {
        this.elements = {
            mainImage: document.querySelector('.main-image img'),
            thumbnails: document.querySelectorAll('.thumbnail'),
            galleryContainer: document.querySelector('.project-gallery'),
            projectContent: document.querySelector('.project-content'),
            techItems: document.querySelectorAll('.tech-item'),
            featureCards: document.querySelectorAll('.feature-card'),
            navButtons: {
                prev: document.querySelector('.nav-prev'),
                next: document.querySelector('.nav-next'),
                all: document.querySelector('.nav-all')
            }
        };

        // Validation des éléments critiques
        if (!this.elements.mainImage) {
            console.warn('Image principale non trouvée');
        }

        if (this.elements.thumbnails.length === 0) {
            console.warn('Aucune miniature trouvée');
        }
    }

    // Configuration de la galerie d'images
    setupImageGallery() {
        if (!this.elements.mainImage || this.elements.thumbnails.length === 0) {
            return;
        }

        // Collecter toutes les images
        this.state.images = Array.from(this.elements.thumbnails).map(thumb => ({
            src: thumb.getAttribute('src'),
            alt: thumb.getAttribute('alt') || 'Image du projet'
        }));

        // Ajouter l'image principale si elle n'est pas dans les miniatures
        const mainSrc = this.elements.mainImage.getAttribute('src');
        if (!this.state.images.some(img => img.src === mainSrc)) {
            this.state.images.unshift({
                src: mainSrc,
                alt: this.elements.mainImage.getAttribute('alt') || 'Image principale'
            });
        }

        // Marquer la première miniature comme active
        if (this.elements.thumbnails.length > 0) {
            this.setActiveThumbnail(0);
        }

        console.log(`Galerie configurée avec ${this.state.images.length} images`);
    }

    // Liaison des événements
    bindEvents() {
        // Gestion des clics sur les miniatures
        this.elements.thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeMainImage(index, thumbnail.getAttribute('src'));
            });

            // Support du clavier
            thumbnail.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.changeMainImage(index, thumbnail.getAttribute('src'));
                }
            });

            // Ajouter tabindex pour l'accessibilité
            thumbnail.setAttribute('tabindex', '0');
            thumbnail.setAttribute('role', 'button');
            thumbnail.setAttribute('aria-label', `Voir l'image ${index + 1}`);
        });

        // Navigation au clavier pour la galerie
        if (this.elements.mainImage) {
            this.elements.mainImage.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousImage();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextImage();
                        break;
                }
            });
        }

        // Gestion des erreurs d'images
        this.elements.thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('error', (e) => {
                console.warn('Erreur de chargement de miniature:', e.target.src);
                e.target.style.display = 'none';
            });
        });

        if (this.elements.mainImage) {
            this.elements.mainImage.addEventListener('error', (e) => {
                console.warn('Erreur de chargement de l\'image principale:', e.target.src);
                e.target.alt = 'Image non disponible';
            });
        }

        // Animation des éléments tech au survol
        this.elements.techItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (window.animationManager && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    window.animationManager.pulseAnimation(item);
                }
            });
        });

        // Effet sur les cartes de fonctionnalités
        this.elements.featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.highlightFeature(card);
            });

            card.addEventListener('mouseleave', () => {
                this.unhighlightFeature(card);
            });
        });
    }

    // Changer l'image principale
    changeMainImage(index, newImageSrc) {
        if (!this.elements.mainImage || !newImageSrc) return;

        this.state.currentImageIndex = index;

        // Utiliser l'animation manager si disponible
        if (window.animationManager) {
            window.animationManager.animateImageChange(this.elements.mainImage, newImageSrc);
        } else {
            // Fallback simple
            this.elements.mainImage.setAttribute('src', newImageSrc);
        }

        // Mettre à jour les miniatures actives
        this.setActiveThumbnail(index);

        // Mettre à jour l'alt text
        const imageData = this.state.images[index];
        if (imageData) {
            this.elements.mainImage.setAttribute('alt', imageData.alt);
        }
    }

    // Définir la miniature active
    setActiveThumbnail(index) {
        this.elements.thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
            thumb.setAttribute('aria-pressed', i === index ? 'true' : 'false');
        });
    }

    // Image précédente
    previousImage() {
        if (this.state.images.length === 0) return;

        const newIndex = this.state.currentImageIndex > 0 
            ? this.state.currentImageIndex - 1 
            : this.state.images.length - 1;

        const newImage = this.state.images[newIndex];
        if (newImage) {
            this.changeMainImage(newIndex, newImage.src);
        }
    }

    // Image suivante
    nextImage() {
        if (this.state.images.length === 0) return;

        const newIndex = this.state.currentImageIndex < this.state.images.length - 1 
            ? this.state.currentImageIndex + 1 
            : 0;

        const newImage = this.state.images[newIndex];
        if (newImage) {
            this.changeMainImage(newIndex, newImage.src);
        }
    }

    // Mise en évidence d'une fonctionnalité
    highlightFeature(card) {
        if (!card) return;

        card.style.transform = 'translateY(-5px) scale(1.02)';
        card.style.boxShadow = '0 8px 25px rgba(10, 110, 157, 0.3)';
        card.style.transition = 'all 0.3s ease';
    }

    // Suppression de la mise en évidence
    unhighlightFeature(card) {
        if (!card) return;

        card.style.transform = '';
        card.style.boxShadow = '';
    }

    // Initialisation des animations
    initAnimations() {
        // Animer l'apparition du contenu
        if (this.elements.projectContent) {
            this.elements.projectContent.classList.add('fade-in');
        }

        // Animer les cartes de fonctionnalités
        this.elements.featureCards.forEach((card, index) => {
            card.classList.add('fade-in');
            card.style.animationDelay = `${index * 0.1}s`;
        });

        // Animer les éléments de technologie
        this.elements.techItems.forEach((item, index) => {
            item.classList.add('fade-in');
            item.style.animationDelay = `${index * 0.05}s`;
        });

        // Configurer les boutons de navigation
        Object.values(this.elements.navButtons).forEach(button => {
            if (button) {
                button.addEventListener('mouseenter', () => {
                    if (window.animationManager) {
                        window.animationManager.pulseAnimation(button);
                    }
                });
            }
        });
    }

    // Préchargement des images
    preloadImages() {
        this.state.images.forEach(imageData => {
            const img = new Image();
            img.src = imageData.src;
        });
    }

    // Ajout de boutons de navigation pour la galerie
    addGalleryNavigation() {
        if (!this.elements.galleryContainer || this.state.images.length <= 1) return;

        const navHTML = `
            <div class="gallery-navigation">
                <button class="gallery-btn gallery-prev" aria-label="Image précédente">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="gallery-btn gallery-next" aria-label="Image suivante">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="gallery-counter">
                    <span class="current-image">1</span> / <span class="total-images">${this.state.images.length}</span>
                </div>
            </div>
        `;

        this.elements.galleryContainer.insertAdjacentHTML('beforeend', navHTML);

        // Liaison des événements de navigation
        const prevBtn = this.elements.galleryContainer.querySelector('.gallery-prev');
        const nextBtn = this.elements.galleryContainer.querySelector('.gallery-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousImage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextImage());
        }
    }

    // Mise à jour du compteur de galerie
    updateGalleryCounter() {
        const counterElement = document.querySelector('.current-image');
        if (counterElement) {
            counterElement.textContent = this.state.currentImageIndex + 1;
        }
    }

    // Gestion du zoom d'image (optionnel)
    enableImageZoom() {
        if (!this.elements.mainImage) return;

        this.elements.mainImage.style.cursor = 'zoom-in';
        
        this.elements.mainImage.addEventListener('click', () => {
            this.openImageModal(this.elements.mainImage.src);
        });
    }

    // Modal d'image (optionnel)
    openImageModal(imageSrc) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close" aria-label="Fermer">&times;</button>
                    <img src="${imageSrc}" alt="Image agrandie" class="modal-image">
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Fermeture du modal
        const closeModal = () => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    }

    // Validation des données du projet
    validateProjectData() {
        const requiredElements = [
            '.project-title',
            '.project-description',
            '.tech-stack'
        ];

        const missing = requiredElements.filter(selector => 
            !document.querySelector(selector)
        );

        if (missing.length > 0) {
            console.warn('Éléments manquants dans la page projet:', missing);
        }

        return missing.length === 0;
    }

    // Génération automatique de la navigation entre projets
    generateProjectNavigation() {
        const navContainer = document.querySelector('.project-navigation');
        if (!navContainer) return;

        // Exemple de données de projets (à adapter selon votre structure)
        const projects = [
            { id: 'projet1', title: 'Portfolio Personnel', url: 'projet1.html' },
            { id: 'projet2', title: 'Gestionnaire de Tâches', url: 'projet2.html' },
            { id: 'projet3', title: 'Analyseur de Données', url: 'projet3.html' },
            { id: 'projet4', title: 'Système de Gestion Bibliothèque', url: 'projet4.html' }
        ];

        const currentProject = this.getCurrentProjectId();
        const currentIndex = projects.findIndex(p => p.id === currentProject);

        if (currentIndex === -1) return;

        const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
        const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

        // Mise à jour des liens de navigation
        const prevLink = navContainer.querySelector('.nav-prev');
        const nextLink = navContainer.querySelector('.nav-next');

        if (prevLink && prevProject) {
            prevLink.href = prevProject.url;
            prevLink.querySelector('span').textContent = prevProject.title;
            prevLink.style.display = 'flex';
        } else if (prevLink) {
            prevLink.style.display = 'none';
        }

        if (nextLink && nextProject) {
            nextLink.href = nextProject.url;
            nextLink.querySelector('span').textContent = nextProject.title;
            nextLink.style.display = 'flex';
        } else if (nextLink) {
            nextLink.style.display = 'none';
        }
    }

    // Obtenir l'ID du projet actuel
    getCurrentProjectId() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename;
    }

    // Gestion des métadonnées du projet
    updateProjectMetadata() {
        const projectTitle = document.querySelector('.project-title')?.textContent;
        const projectCategory = document.querySelector('.project-category')?.textContent;

        if (projectTitle) {
            document.title = `${projectTitle} - Mon Portfolio`;
            
            // Mise à jour des métadonnées Open Graph
            this.updateMetaTag('og:title', projectTitle);
            this.updateMetaTag('og:type', 'article');
        }

        if (projectCategory) {
            this.updateMetaTag('article:section', projectCategory);
        }

        // Image principale pour les réseaux sociaux
        if (this.elements.mainImage) {
            const imageSrc = this.elements.mainImage.src;
            this.updateMetaTag('og:image', imageSrc);
            this.updateMetaTag('twitter:image', imageSrc);
        }
    }

    // Mise à jour d'une balise meta
    updateMetaTag(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`) ||
                  document.querySelector(`meta[name="${property}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
    }

    // Ajout de fonctionnalités d'accessibilité
    enhanceAccessibility() {
        // Ajouter des landmarks ARIA
        if (this.elements.galleryContainer) {
            this.elements.galleryContainer.setAttribute('role', 'region');
            this.elements.galleryContainer.setAttribute('aria-label', 'Galerie d\'images du projet');
        }

        // Améliorer les miniatures
        this.elements.thumbnails.forEach((thumb, index) => {
            thumb.setAttribute('aria-describedby', `thumb-desc-${index}`);
            
            // Ajouter une description cachée
            const desc = document.createElement('span');
            desc.id = `thumb-desc-${index}`;
            desc.className = 'sr-only';
            desc.textContent = `Miniature ${index + 1} sur ${this.elements.thumbnails.length}`;
            thumb.parentNode.appendChild(desc);
        });

        // Annoncer les changements d'image aux lecteurs d'écran
        if (this.elements.mainImage) {
            this.elements.mainImage.setAttribute('role', 'img');
        }
    }

    // Gestion des erreurs et fallbacks
    setupErrorHandling() {
        // Gestion des images cassées
        const handleImageError = (img, fallbackSrc = 'https://via.placeholder.com/400x300?text=Image+non+disponible') => {
            img.onerror = null; // Éviter la boucle infinie
            img.src = fallbackSrc;
            img.alt = 'Image non disponible';
        };

        // Appliquer aux miniatures
        this.elements.thumbnails.forEach(thumb => {
            thumb.addEventListener('error', () => handleImageError(thumb));
        });

        // Appliquer à l'image principale
        if (this.elements.mainImage) {
            this.elements.mainImage.addEventListener('error', () => 
                handleImageError(this.elements.mainImage, 'https://via.placeholder.com/800x400?text=Image+principale+non+disponible')
            );
        }
    }

    // Optimisation des performances
    optimizePerformance() {
        // Lazy loading pour les images non visibles
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            // Observer les images avec data-src
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Préchargement intelligent des images adjacentes
        this.preloadAdjacentImages();
    }

    // Préchargement des images adjacentes
    preloadAdjacentImages() {
        const currentIndex = this.state.currentImageIndex;
        const imagesToPreload = [
            this.state.images[currentIndex - 1],
            this.state.images[currentIndex + 1]
        ].filter(Boolean);

        imagesToPreload.forEach(imageData => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = imageData.src;
            document.head.appendChild(link);
        });
    }

    // Nettoyage des ressources
    destroy() {
        // Nettoyer les event listeners si nécessaire
        this.elements.thumbnails.forEach(thumb => {
            thumb.removeEventListener('click', this.changeMainImage);
        });

        // Nettoyer les modals ouvertes
        const modals = document.querySelectorAll('.image-modal');
        modals.forEach(modal => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });

        // Restaurer le scroll du body
        document.body.style.overflow = '';

        this.state.isInitialized = false;
    }

    // Initialisation automatique
    static autoInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                const projectManager = new ProjectDetailManager();
                projectManager.init();
                window.projectDetailManager = projectManager;
            });
        } else {
            const projectManager = new ProjectDetailManager();
            projectManager.init();
            window.projectDetailManager = projectManager;
        }
    }
}

// Styles CSS pour le modal et les améliorations
const projectCSS = `
    .image-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-overlay {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }

    .modal-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        background: white;
        border-radius: 8px;
        overflow: hidden;
    }

    .modal-image {
        width: 100%;
        height: auto;
        display: block;
    }

    .modal-close {
        position: absolute;
        top: 10px;
        right: 15px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-close:hover {
        background: rgba(0, 0, 0, 0.9);
    }

    .gallery-navigation {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 1rem;
        padding: 0 1rem;
    }

    .gallery-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition);
    }

    .gallery-btn:hover {
        background: var(--secondary-color);
        transform: scale(1.1);
    }

    .gallery-counter {
        font-weight: 500;
        color: var(--text-color);
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    /* Améliorations pour les miniatures */
    .thumbnail {
        transition: all 0.3s ease;
        cursor: pointer;
        border: 2px solid transparent;
    }

    .thumbnail:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .thumbnail:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
    }

    .thumbnail.active {
        border-color: var(--primary-color);
        transform: scale(1.05);
    }

    /* Animation pour le changement d'image */
    .main-image img {
        transition: opacity 0.3s ease;
    }

    /* Responsive pour le modal */
    @media (max-width: 768px) {
        .modal-content {
            max-width: 95vw;
            max-height: 95vh;
        }
        
        .gallery-navigation {
            flex-direction: column;
            gap: 1rem;
        }
    }
`;

// Injection du CSS
const injectProjectCSS = () => {
    const style = document.createElement('style');
    style.textContent = projectCSS;
    document.head.appendChild(style);
};

// Initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        injectProjectCSS();
        ProjectDetailManager.autoInit();
    });
} else {
    injectProjectCSS();
    ProjectDetailManager.autoInit();
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectDetailManager;
}