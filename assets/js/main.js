/* ============================================
   TourGuide Speakers - Main Scripts
   File: assets/js/main.js
   Reusable UI interactions and animations
   ============================================ */

(function() {
  'use strict';

  /**
   * Scroll Reveal Animation
   * Reveals elements with the .fade-up class when they enter the viewport
   */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.fade-up');
    
    if (!revealElements.length) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // If reduced motion is preferred, show all elements immediately
      revealElements.forEach(el => el.classList.add('visible'));
      return;
    }

    // Use Intersection Observer for scroll-triggered animations
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add staggered delay for elements in the same section
            const siblings = entry.target.parentElement.querySelectorAll('.fade-up');
            const index = Array.from(siblings).indexOf(entry.target);
            
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, index * 100);
            
            obs.unobserve(entry.target);
          }
        });
      }, observerOptions);

      revealElements.forEach(el => observer.observe(el));
    } else {
      // Fallback for browsers without IntersectionObserver
      revealElements.forEach(el => el.classList.add('visible'));
    }
  }

  /**
   * Smooth Scroll for Anchor Links
   * Handles smooth scrolling for in-page navigation
   */
  function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        
        // Skip if it's just "#"
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          e.preventDefault();
          
          // Get header height for offset
          const header = document.querySelector('.header');
          const headerHeight = header ? header.offsetHeight : 0;
          
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update focus for accessibility
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus({ preventScroll: true });
        }
      });
    });
  }

  /**
   * Header Scroll Effect
   * Adds a class to header when scrolled for visual feedback
   */
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    
    if (!header) return;

    let ticking = false;

    function updateHeader() {
      if (window.scrollY > 10) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
      
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * Button Ripple Effect
   * Adds a subtle ripple effect on button clicks
   */
  function initButtonRipple() {
    const buttons = document.querySelectorAll('.btn');
    
    // Check if reduced motion is preferred
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.className = 'btn-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        this.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });

    // Add ripple styles dynamically
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        .btn {
          position: relative;
          overflow: hidden;
        }
        .btn-ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        }
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Mobile Menu Toggle
   */
  function initMobileMenu() {
    const menuBtn = document.querySelector('.header__menu-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeBtn = document.querySelector('.mobile-menu__close');
    const overlay = document.querySelector('.mobile-menu__overlay');
    const menuItems = document.querySelectorAll('.mobile-menu__item, .mobile-menu__btn');
    const langBtns = document.querySelectorAll('.mobile-menu__lang');
    
    if (!menuBtn || !mobileMenu) return;
    
    function openMenu() {
      mobileMenu.classList.add('is-open');
      menuBtn.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
      mobileMenu.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    
    // Toggle menu
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
    
    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeMenu);
    }
    
    // Close on overlay click
    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }
    
    // Close menu when clicking a link
    menuItems.forEach(item => {
      item.addEventListener('click', closeMenu);
    });
    
    // Handle language buttons
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        
        // Update active state
        langBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        
        // Store preference
        localStorage.setItem('preferredLanguage', lang);
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('languageChange', { detail: { lang } }));
      });
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  /**
   * Language Switcher
   * Handles language dropdown and selection
   */
  function initLanguageSwitcher() {
    const switchers = document.querySelectorAll('.lang-switcher');
    
    switchers.forEach(switcher => {
      const toggle = switcher.querySelector('.lang-switcher__toggle');
      const menu = switcher.querySelector('.lang-switcher__menu');
      const items = switcher.querySelectorAll('.lang-switcher__item');
      const currentLabel = switcher.querySelector('.lang-switcher__current');
      
      if (!toggle || !menu) return;
      
      // Toggle dropdown
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = switcher.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen);
        
        if (isOpen) {
          // Focus first item for keyboard navigation
          const firstItem = menu.querySelector('.lang-switcher__item');
          if (firstItem) firstItem.focus();
        }
      });
      
      // Handle item selection
      items.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          
          const lang = item.dataset.lang;
          const label = item.dataset.label;
          
          // Update current label
          if (currentLabel) {
            currentLabel.textContent = label;
          }
          
          // Update active state
          items.forEach(i => i.classList.remove('is-active'));
          item.classList.add('is-active');
          
          // Store preference
          localStorage.setItem('preferredLanguage', lang);
          
          // Close dropdown
          switcher.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          
          // Dispatch custom event for language change
          const event = new CustomEvent('languageChange', {
            detail: { lang, label }
          });
          document.dispatchEvent(event);
          
          // Optional: Handle RTL for Arabic
          if (lang === 'ar-EG') {
            document.documentElement.setAttribute('dir', 'rtl');
          } else {
            document.documentElement.setAttribute('dir', 'ltr');
          }
        });
      });
      
      // Keyboard navigation
      menu.addEventListener('keydown', (e) => {
        const focusedItem = document.activeElement;
        const itemsArray = Array.from(items);
        const currentIndex = itemsArray.indexOf(focusedItem);
        
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % itemsArray.length;
            itemsArray[nextIndex].focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + itemsArray.length) % itemsArray.length;
            itemsArray[prevIndex].focus();
            break;
          case 'Escape':
            switcher.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.focus();
            break;
          case 'Tab':
            switcher.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            break;
        }
      });
      
      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!switcher.contains(e.target)) {
          switcher.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Restore saved language preference
      const savedLang = localStorage.getItem('preferredLanguage');
      if (savedLang) {
        const savedItem = switcher.querySelector(`[data-lang="${savedLang}"]`);
        if (savedItem) {
          const label = savedItem.dataset.label;
          if (currentLabel) currentLabel.textContent = label;
          items.forEach(i => i.classList.remove('is-active'));
          savedItem.classList.add('is-active');
          
          // Apply RTL if Arabic
          if (savedLang === 'ar-EG') {
            document.documentElement.setAttribute('dir', 'rtl');
          }
        }
      } else {
        // Set first item as active by default
        if (items.length > 0) {
          items[0].classList.add('is-active');
        }
      }
    });
  }

  /**
   * Video Player
   * Handles HTML5 video and iframe lazy loading
   */
  function initVideoPlayer() {
    const videoWrappers = document.querySelectorAll('.video-wrapper');
    
    videoWrappers.forEach(wrapper => {
      const playBtn = wrapper.querySelector('.video-play-btn');
      const thumbnail = wrapper.querySelector('.video-thumbnail');
      const video = wrapper.querySelector('.video-player');
      const iframe = wrapper.querySelector('.video-iframe');
      
      if (!playBtn) return;
      
      const playVideo = () => {
        // For HTML5 video
        if (video) {
          wrapper.classList.add('is-playing');
          video.controls = true;
          video.play().catch(err => console.log('Video play error:', err));
          return;
        }
        
        // For iframe (YouTube, etc.)
        if (iframe) {
          const videoSrc = iframe.dataset.src;
          if (videoSrc && !iframe.src) {
            iframe.src = videoSrc;
          }
          wrapper.classList.add('is-playing');
        }
      };
      
      playBtn.addEventListener('click', playVideo);
      
      // Also allow clicking on thumbnail
      if (thumbnail) {
        thumbnail.addEventListener('click', playVideo);
      }
      
      // Keyboard support
      playBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playVideo();
        }
      });
      
      // Reset when video ends (HTML5 video only)
      if (video) {
        video.addEventListener('ended', () => {
          wrapper.classList.remove('is-playing');
          video.controls = false;
          video.currentTime = 0;
        });
      }
    });
  }

  /**
   * Form Validation Helper
   */
  function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        let isValid = true;
        const requiredFields = this.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
          } else {
            field.classList.remove('is-invalid');
          }
        });
        
        if (!isValid) {
          e.preventDefault();
        }
      });
    });
  }

  /**
   * Listener Page - Trouble Toggle
   * Show/hide the trouble tips section
   */
  function initTroubleToggle() {
    const toggleBtn = document.getElementById('troubleToggle');
    const tipsPanel = document.getElementById('troubleTips');
    
    if (!toggleBtn || !tipsPanel) return;
    
    toggleBtn.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      this.setAttribute('aria-expanded', !isExpanded);
      
      if (isExpanded) {
        tipsPanel.setAttribute('hidden', '');
      } else {
        tipsPanel.removeAttribute('hidden');
      }
    });
  }

  /**
   * Initialize all scripts when DOM is ready
   */
  function init() {
    initScrollReveal();
    initSmoothScroll();
    initHeaderScroll();
    initButtonRipple();
    initMobileMenu();
    initLanguageSwitcher();
    initVideoPlayer();
    initFormValidation();
    initTroubleToggle();
  }

  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for use in other scripts if needed
  window.TourGuide = {
    initScrollReveal,
    initSmoothScroll,
    initHeaderScroll,
    initButtonRipple,
    initMobileMenu,
    initLanguageSwitcher,
    initVideoPlayer,
    initFormValidation,
    initTroubleToggle
  };

})();
