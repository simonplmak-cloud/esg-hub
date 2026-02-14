// ESG Hub Main JavaScript
// Navigation, TOC, Search functionality

(function() {
  'use strict';

  // Generate Table of Contents
  function generateTOC() {
    const content = document.querySelector('.content-body');
    const tocList = document.querySelector('.toc-list');
    
    if (!content || !tocList) return;
    
    const headings = content.querySelectorAll('h2, h3');
    const tocItems = [];
    
    headings.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      heading.id = id;
      
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.textContent = heading.textContent;
      a.className = heading.tagName === 'H3' ? 'toc-h3' : '';
      
      li.appendChild(a);
      tocItems.push(li);
    });
    
    tocItems.forEach(item => tocList.appendChild(item));
  }

  // Active TOC highlighting on scroll
  function updateActiveTOC() {
    const headings = document.querySelectorAll('.content-body h2, .content-body h3');
    const tocLinks = document.querySelectorAll('.toc-list a');
    
    let current = '';
    
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 100) {
        current = heading.id;
      }
    });
    
    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  // Sidebar navigation active state
  function updateActiveSidebar() {
    const currentPath = window.location.pathname;
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    
    sidebarLinks.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
        
        // Expand parent if nested
        let parent = link.closest('.has-children');
        if (parent) {
          parent.classList.add('expanded');
        }
      }
    });
  }

  // Collapsible sidebar sections
  function initSidebarCollapse() {
    const hasChildren = document.querySelectorAll('.sidebar-nav .has-children > a');
    
    hasChildren.forEach(link => {
      link.addEventListener('click', function(e) {
        const parent = this.parentElement;
        const isExpanded = parent.classList.contains('expanded');
        
        // Close all siblings
        const siblings = parent.parentElement.querySelectorAll('.has-children');
        siblings.forEach(sibling => {
          if (sibling !== parent) {
            sibling.classList.remove('expanded');
          }
        });
        
        // Toggle current
        parent.classList.toggle('expanded');
        
        // If clicking on parent link itself (not child), prevent navigation
        if (!isExpanded && this.getAttribute('href') === '#') {
          e.preventDefault();
        }
      });
    });
  }

  // Smooth scrolling for anchor links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Mobile menu toggle
  function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open');
        document.body.classList.toggle('sidebar-open');
      });
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    generateTOC();
    updateActiveSidebar();
    initSidebarCollapse();
    initSmoothScroll();
    initMobileMenu();
    
    // Update TOC on scroll
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          updateActiveTOC();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

})();
