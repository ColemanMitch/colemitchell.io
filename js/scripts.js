/*!
 * Start Bootstrap - Resume v6.0.0 (https://startbootstrap.com/template-overviews/resume)
 * Copyright 2013-2020 Start Bootstrap
 * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap-resume/blob/master/LICENSE)
 */
(function ($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
    if (
      location.pathname.replace(/^\//, "") ==
        this.pathname.replace(/^\//, "") &&
      location.hostname == this.hostname
    ) {
      var target = $(this.hash);
      target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
      if (target.length) {
        $("html, body").animate(
          {
            scrollTop: target.offset().top,
          },
          400,
          "easeInOutExpo"
        );
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $(".js-scroll-trigger").click(function () {
    $(".navbar-collapse").collapse("hide");
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $("body").scrollspy({
    target: "#sideNav",
  });

  // ===== MODERN ENHANCEMENTS =====

  // Add scroll progress indicator
  function createScrollIndicator() {
    const scrollIndicator = $('<div class="scroll-indicator"></div>');
    $("body").prepend(scrollIndicator);

    $(window).on("scroll", function () {
      const scrollTop = $(window).scrollTop();
      const documentHeight = $(document).height();
      const windowHeight = $(window).height();
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;

      scrollIndicator.css(
        "background",
        `linear-gradient(90deg, #333333 ${scrollPercent}%, rgba(0,0,0,0.1) ${scrollPercent}%)`
      );
    });
  }

  // Enhanced navigation highlighting
  function enhanceNavigation() {
    const navItems = $("#sideNav .nav-item");

    navItems.each(function (index) {
      $(this).css("animation-delay", `${(index + 1) * 0.1}s`);
    });

    // Add active state styling
    navItems.on("click", function () {
      navItems.removeClass("active");
      $(this).addClass("active");
    });
  }

  // Animate elements on scroll
  function animateOnScroll() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    $(".resume-section-content").each(function () {
      this.style.opacity = "0";
      this.style.transform = "translateY(30px)";
      this.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
      observer.observe(this);
    });
  }

  // Enhanced skill icons interaction
  function enhanceSkillIcons() {
    $(".dev-icons .list-inline-item").on("mouseenter", function () {
      const $this = $(this);
      $this.find("i").addClass("animated-icon");

      // Add ripple effect
      const ripple = $('<span class="ripple"></span>');
      $this.append(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }

  // Enhanced social icons
  function enhanceSocialIcons() {
    $(".social-icons .social-icon").on("mouseenter", function () {
      $(this).addClass("pulse");
      setTimeout(() => {
        $(this).removeClass("pulse");
      }, 300);
    });
  }

  // Mobile menu enhancements
  function enhanceMobileMenu() {
    const navbar = $("#sideNav");
    const navbarToggler = $(".navbar-toggler");

    // Add mobile menu animation
    navbarToggler.on("click", function () {
      navbar.toggleClass("mobile-menu-open");
    });

    // Close mobile menu when clicking outside
    $(document).on("click", function (e) {
      if (!navbar.is(e.target) && navbar.has(e.target).length === 0) {
        navbar.removeClass("mobile-menu-open");
        $(".navbar-collapse").collapse("hide");
      }
    });
  }

  // Enhanced typing effect for main heading
  function typingEffect() {
    const heading = $("h1").first();
    if (heading.length) {
      const text = heading.text();
      heading.text("");

      let i = 0;
      const typeWriter = () => {
        if (i < text.length) {
          heading.text(heading.text() + text.charAt(i));
          i++;
          setTimeout(typeWriter, 100);
        }
      };

      // Start typing after a short delay
      setTimeout(typeWriter, 500);
    }
  }

  // Parallax effect for background
  function addParallaxEffect() {
    $(window).on("scroll", function () {
      const scrolled = $(window).scrollTop();
      const parallaxElements = $(".resume-section");

      parallaxElements.each(function () {
        const rate = scrolled * -0.5;
        $(this).css("transform", `translateY(${rate}px)`);
      });
    });
  }

  // Enhanced tooltips
  function enhanceTooltips() {
    $('[data-toggle="tooltip"]').tooltip({
      trigger: "hover",
      animation: true,
      delay: { show: 300, hide: 100 },
    });
  }

  // Add floating action button for scroll to top
  function addScrollToTop() {
    const scrollToTopBtn = $(
      '<button class="scroll-to-top"><i class="fas fa-chevron-up"></i></button>'
    );
    $("body").append(scrollToTopBtn);

    // Add CSS styles for the button
    scrollToTopBtn.css({
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "50px",
      height: "50px",
      backgroundColor: "#333333",
      color: "white",
      border: "none",
      borderRadius: "50%",
      cursor: "pointer",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      transition: "all 0.3s ease",
      zIndex: 1000,
      display: "none",
    });

    // Show/hide button based on scroll position
    $(window).on("scroll", function () {
      if ($(window).scrollTop() > 300) {
        scrollToTopBtn.fadeIn();
      } else {
        scrollToTopBtn.fadeOut();
      }
    });

    // Scroll to top on click
    scrollToTopBtn.on("click", function () {
      $("html, body").animate(
        {
          scrollTop: 0,
        },
        400,
        "easeInOutExpo"
      );
    });

    // Hover effects
    scrollToTopBtn.hover(
      function () {
        $(this).css({
          backgroundColor: "#555555",
          transform: "translateY(-2px)",
          boxShadow: "0 6px 25px rgba(0,0,0,0.2)",
        });
      },
      function () {
        $(this).css({
          backgroundColor: "#333333",
          transform: "translateY(0)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        });
      }
    );
  }

  // Add loading animation
  function addLoadingAnimation() {
    const loader = $(
      '<div class="page-loader"><div class="loader-spinner"></div></div>'
    );
    $("body").prepend(loader);

    loader.css({
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(255,255,255,0.9)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    });

    const spinner = loader.find(".loader-spinner");
    spinner.css({
      width: "40px",
      height: "40px",
      border: "4px solid #f3f3f3",
      borderTop: "4px solid #333333",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    });

    // Add spin animation
    $("<style>")
      .text(
        "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }"
      )
      .appendTo("head");

    // Hide loader after page load
    $(window).on("load", function () {
      loader.fadeOut(500, function () {
        $(this).remove();
      });
    });
  }

  // Enhanced form interactions (if any forms exist)
  function enhanceFormInteractions() {
    $("input, textarea")
      .on("focus", function () {
        $(this).parent().addClass("input-focused");
      })
      .on("blur", function () {
        $(this).parent().removeClass("input-focused");
      });
  }

  // Add easter egg - Konami code
  function addEasterEgg() {
    let konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let konamiIndex = 0;

    $(document).keydown(function (e) {
      if (e.keyCode === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          // Easter egg activated!
          $("body").addClass("rainbow-mode");
          setTimeout(() => {
            $("body").removeClass("rainbow-mode");
          }, 5000);
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    });
  }

  // Initialize all enhancements
  function initializeEnhancements() {
    createScrollIndicator();
    enhanceNavigation();
    enhanceSkillIcons();
    enhanceSocialIcons();
    enhanceMobileMenu();
    enhanceTooltips();
    addScrollToTop();
    addLoadingAnimation();
    enhanceFormInteractions();
    addEasterEgg();

    // Initialize animations after a short delay
    setTimeout(() => {
      animateOnScroll();
    }, 100);
  }

  // Run enhancements when document is ready
  $(document).ready(function () {
    initializeEnhancements();
  });
})(jQuery); // End of use strict
