document.addEventListener("DOMContentLoaded", () => {
  
  // ========== Smooth Scrolling for Navigation ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ========== Stats Counter Animation ==========
  const statCards = document.querySelectorAll('.stat-card h3');
  let hasAnimated = false;

  const animateCounters = () => {
    if (hasAnimated) return;

    statCards.forEach(stat => {
      const text = stat.textContent;
      const number = parseInt(text.replace(/\D/g, ''));
      const suffix = text.replace(/[0-9]/g, '');
      
      if (!number) return;

      let current = 0;
      const increment = Math.ceil(number / 50);
      const duration = 2000; // 2 seconds
      const stepTime = duration / (number / increment);

      const counter = setInterval(() => {
        current += increment;
        if (current >= number) {
          stat.textContent = number + suffix;
          clearInterval(counter);
        } else {
          stat.textContent = current + suffix;
        }
      }, stepTime);
    });

    hasAnimated = true;
  };

  // Trigger counter animation when stats section is visible
  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
        }
      });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
  }

  // ========== FAQ Accordion ==========
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('h4');
    const answer = item.querySelector('p');
    
    if (question && answer) {
      question.addEventListener('click', () => {
        const isOpen = answer.style.display === 'block';
        
        // Close all FAQ items
        faqItems.forEach(faq => {
          const p = faq.querySelector('p');
          if (p) p.style.display = 'none';
        });
        
        // Toggle current item
        if (!isOpen) {
          answer.style.display = 'block';
        }
      });
    }
  });

  // ========== Scroll Animations ==========
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.section, .feature-box, .doctor-card, .why-us, .doctors, .faq');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  };

  animateOnScroll();

  // ========== Navbar Scroll Effect ==========
  const nav = document.querySelector('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add shadow on scroll
    if (currentScroll > 50) {
      nav.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.1)';
    } else {
      nav.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
    }

    lastScroll = currentScroll;
  });

  // ========== Video Lazy Loading (Performance) ==========
  const video = document.querySelector('.hero video');
  if (video) {
    video.setAttribute('preload', 'metadata');
  }

  // ========== Mobile Menu Toggle (Optional Enhancement) ==========
  // You can add a hamburger menu button in your HTML and uncomment this
  /*
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
  */

});