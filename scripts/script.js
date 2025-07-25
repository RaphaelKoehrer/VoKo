document.addEventListener('DOMContentLoaded', () => {
    // Check if GSAP and ScrollTrigger are available
    if (typeof gsap === 'undefined') {
        console.error('GSAP is not loaded');
        return;
    }

    // Register ScrollTrigger plugin early
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    } else {
        console.warn('ScrollTrigger plugin is not loaded');
    }

    // Page fade in animation on load - set initial opacity properly
    gsap.set(document.body, { opacity: 0 });
    gsap.to(document.body, { opacity: 1, duration: 0.4, ease: 'power2.out' });

    // Page transition function
    function fadeToPage(url) {
        gsap.to(document.body, { 
            opacity: 0, 
            duration: 0.3, 
            ease: 'power2.in',
            onComplete: () => {
                window.location.href = url;
            }
        });
    }

    // Add fade transition to all navigation links
    const navLinks = document.querySelectorAll('#navDropdown a, .nav-item a, .service-learn-more, .contact-cta-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                e.preventDefault();
                fadeToPage(href);
            }
        });
    });

    // WelcomeText Animation: Container einblenden
    gsap.fromTo('#welcomeText', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    // Einzelne Elemente nacheinander einblenden
    gsap.from('#mainText h1', { opacity: 0, y: 30, duration: 0.5, delay: 0.3 });
    gsap.from('#mainText hr', { opacity: 0, scaleX: 0, duration: 0.4, delay: 0.6 });
    gsap.from('#mainText h3', { opacity: 0, y: 20, duration: 0.5, delay: 0.9 });
    // Navigation einblenden
    gsap.from('#nav', { opacity: 0, y: -30, duration: 0.5, delay: 0.1 });
    gsap.from('.nav-item, .nav-logo', { opacity: 0, y: -10, stagger: 0.1, duration: 0.4, delay: 0.2 });

    // --- NEU: Animation für Service- und Bundle-Boxen auf der Startseite ---
    // Service-Boxen (neues flexibles Layout) - Schnellere Animation
    const serviceRows = document.querySelectorAll('#servicesAltWrapper .service-row');
    serviceRows.forEach((row, i) => {
        const fromX = i % 2 === 0 ? -60 : 60; // Noch weniger Distanz
        
        // Set initial state
        gsap.set(row, { opacity: 0, x: fromX });
        
        gsap.to(row, {
            opacity: 1,
            x: 0,
            duration: 0.5, // Schnellere Animation
            ease: 'power2.out', // Schnellerer Easing
            scrollTrigger: {
                trigger: row,
                start: 'top 80%', // Viel früher starten
                toggleActions: 'play none none none',
                once: true
            }
        });
    });

    // Bundle-Boxen: Noch früheres Pop-in (scale, y, opacity)
    const bundleBoxes = document.querySelectorAll('.bundle-box');
    bundleBoxes.forEach((box, i) => {
        gsap.fromTo(
            box,
            { opacity: 0, scale: 0.95, y: 30 }, // Noch sanftere Ausgangswerte
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.6, // Schnellere Duration
                delay: 0.1 + i * 0.08, // Kürzere Verzögerung
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: box,
                    start: 'top 95%', // Früher starten
                    toggleActions: 'play none none none',
                    once: true
                }
            }
        );
    });

    // CTA-Bereich (Interesse? Kontaktiere uns!) animieren (früher und unabhängig von delay)
    const cta = document.querySelector('div[style*="Interesse? Kontaktiere uns!"]');
    if (cta) {
        gsap.fromTo(
            cta,
            { opacity: 0, scale: 0.92, y: 60 },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.7,
                delay: 0.1,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: cta,
                    start: 'top 98%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    // --- INFINITE HORIZONTAL SLIDER IMPLEMENTATION ---
    function setupInfiniteSlider() {
        const sliderTrack = document.querySelector('.slider-track');
        const sliderBoxes = document.querySelectorAll('.slider-box');
        
        if (!sliderTrack || sliderBoxes.length === 0) return;
        
        // First animate in the original boxes with staggered effect
        gsap.from(sliderBoxes, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.1,
            delay: 0.3,
            ease: 'power2.out',
            onComplete: initInfiniteScroll // Start infinite scroll after initial animation
        });
        
        function initInfiniteScroll() {
            // Clone slider boxes and append them to create the infinite effect
            const boxesToClone = Array.from(sliderBoxes);
            boxesToClone.forEach(box => {
                const clone = box.cloneNode(true);
                sliderTrack.appendChild(clone);
            });
            
            // Calculate the width of one complete set of boxes
            const boxWidth = sliderBoxes[0].offsetWidth;
            const gap = parseFloat(getComputedStyle(sliderTrack).columnGap || '1.5rem');
            const totalWidth = sliderBoxes.length * (boxWidth + gap);
            
            // Create the infinite scrolling animation
            const scrollTween = gsap.timeline({repeat: -1, paused: false});
            
            // Animate to the end of the original boxes
            scrollTween.to(sliderTrack, {
                x: -totalWidth, // Move exactly one set width
                duration: 30, // Duration in seconds - adjust for speed
                ease: "linear",
                onComplete: () => {
                    // Reset position to start for seamless loop
                    gsap.set(sliderTrack, { x: 0 });
                }
            });
            
            // Set initial timeScale
            scrollTween.timeScale(1);
            
            // Track if any box is currently being hovered
            let boxHoverCount = 0;
            
            // Add event listeners to all slider boxes (original and cloned)
            const allSliderBoxes = document.querySelectorAll('.slider-box');
            allSliderBoxes.forEach(box => {
                box.addEventListener('mouseenter', () => {
                    boxHoverCount++;
                    // Slow down animation when hovering over any box
                    gsap.to(scrollTween, {
                        timeScale: 0.1, // Slow to 10% speed
                        duration: 0.8,
                        ease: "power2.out"
                    });
                });
                
                box.addEventListener('mouseleave', () => {
                    boxHoverCount--;
                    // Only speed up if no boxes are being hovered
                    if (boxHoverCount <= 0) {
                        boxHoverCount = 0; // Ensure counter never goes negative
                        gsap.to(scrollTween, {
                            timeScale: 1, // Back to normal speed
                            duration: 0.4,
                            ease: "power2.in"
                        });
                    }
                });
            });
        }
    }
    
    // Call the infinite slider setup
    setupInfiniteSlider();
    

    // --- ENDE NEU ---

    // --- Service Detail Boxes Animation (Leistungen page) ---
    const servicesDetailWrapper = document.getElementById('servicesDetailWrapper');
    if (servicesDetailWrapper) {
        // Animate the entire wrapper container
        gsap.fromTo(
            servicesDetailWrapper,
            { 
                opacity: 0,
                y: 60 
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: typeof ScrollTrigger !== 'undefined' ? {
                    trigger: servicesDetailWrapper,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                } : undefined
            }
        );

        // Animate individual service detail boxes when they come into view
        const serviceDetailBoxes = servicesDetailWrapper.querySelectorAll('.service-detail-box');
        serviceDetailBoxes.forEach((box, boxIndex) => {
            // Animate the box container when it comes into view
            gsap.fromTo(
                box,
                { 
                    opacity: 0,
                    y: 80 
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: typeof ScrollTrigger !== 'undefined' ? {
                        trigger: box,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    } : undefined
                }
            );

            // Animate individual text elements within each box with stagger
            const textElements = box.querySelectorAll('h2, p, ul, li');
            gsap.fromTo(
                textElements,
                { 
                    opacity: 0,
                    y: 30 
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    delay: 0.2,
                    ease: 'power2.out',
                    scrollTrigger: typeof ScrollTrigger !== 'undefined' ? {
                        trigger: box,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    } : undefined
                }
            );
        });
    }

    // --- AboutWrapper Animation (Leistungen page) ---
    const aboutWrapper = document.getElementById('aboutWrapper');
    if (aboutWrapper) {
        // Animate the entire wrapper container
        gsap.fromTo(
            aboutWrapper,
            { 
                opacity: 0,
                y: 60 
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: typeof ScrollTrigger !== 'undefined' ? {
                    trigger: aboutWrapper,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                } : undefined
            }
        );

        // Animate individual elements with stagger
        const aboutElements = aboutWrapper.querySelectorAll('h2, p, ul, .bundles-cta');
        gsap.fromTo(
            aboutElements,
            { 
                opacity: 0,
                y: 30 
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                delay: 0.2,
                ease: 'power2.out',
                scrollTrigger: typeof ScrollTrigger !== 'undefined' ? {
                    trigger: aboutWrapper,
                    start: 'top 75%',
                    toggleActions: 'play none none none'
                } : undefined
            }
        );
    }

    // Cookie Popup
    const cookiePopup = document.getElementById('cookiePopup');
    const allowBtn = document.getElementById('cookieAllow');
    const declineBtn = document.getElementById('cookieDecline');

    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        document.cookie = name + "=" + value + ";expires=" + d.toUTCString() + ";path=/";
    }
    function getCookie(name) {
        const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return v ? v.pop() : '';
    }

    if (cookiePopup) {
        if (!getCookie('cookieConsent')) {
            cookiePopup.classList.remove('hide');
        } else {
            cookiePopup.classList.add('hide');
        }

        if (allowBtn) {
            allowBtn.addEventListener('click', () => {
                setCookie('cookieConsent', 'allowed', 365);
                cookiePopup.classList.add('hide');
            });
        }
        if (declineBtn) {
            declineBtn.addEventListener('click', () => {
                setCookie('cookieConsent', 'declined', 365);
                cookiePopup.classList.add('hide');
            });
        }
    }

    // Hamburger Menü Dropdown
    const navHamburger = document.getElementById('navHamburger');
    const navDropdown = document.getElementById('navDropdown');

    navHamburger.addEventListener('click', () => {
        navDropdown.classList.toggle('open');
        navHamburger.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (
            navDropdown.classList.contains('open') &&
            !navDropdown.contains(e.target) &&
            !navHamburger.contains(e.target)
        ) {
            navDropdown.classList.remove('open');
            navHamburger.classList.remove('active');
        }
    });
    const navIcon = document.getElementById('navIcon');

    navIcon.addEventListener('click', (e) => {
        e.preventDefault();
        // Check if we're in a subdirectory by looking for '../' in current links
        const isSubpage = document.querySelector('a[href*="../"]') !== null;
        const indexPath = isSubpage ? '../index.html' : 'index.html';
        fadeToPage(indexPath);
    });
    
    // Kontaktformular: Erfolgsmeldung anzeigen
    const urlParams = new URLSearchParams(window.location.search);
    const formMessage = document.getElementById('formMessage');
    if (formMessage) {
        if (urlParams.get('success') === '1') {
            formMessage.textContent = "Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.";
        } else if (urlParams.get('error') === '1') {
            formMessage.textContent = "Fehler beim Senden. Bitte versuchen Sie es erneut.";
            formMessage.style.color = "red";
        }
    }

    if (document.querySelector('.pricing-info-animate')) {
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.fromTo('.pricing-info-animate', 
        {
            opacity: 0,
            y: 60
        }, 
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: '.pricing-info-animate',
                start: "top 80%",
                toggleClass: {targets: '.pricing-info', className: 'animate'}
            }
        }
    );
}

    // Social Media Icons Wave Animation
    const socialIcons = document.querySelectorAll('.service-social-icons img');
    if (socialIcons.length > 0 && window.gsap) {
        gsap.set(socialIcons, { y: 0 });
        gsap.to(socialIcons, {
            y: -50,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            stagger: {
                each: 0.18,
                repeat: -1,
                yoyo: true
            },
            duration: 0.55
        });
    }

    // --- Hintergrund-Farbverlauf beim Scrollen ---
    (function() {
        const colorStart = [240, 240, 240]; // #f0f0f0
        const colorEnd = [220, 230, 255];   // z.B. ein sehr dezentes Blau (#dce6ff)
        const maxScroll = 1.0;

        function lerp(a, b, t) {
            return Math.round(a + (b - a) * t);
        }

        function updateBgColor() {
            const scrollY = window.scrollY || window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            let progress = docHeight > 0 ? scrollY / docHeight : 0;
            progress = Math.min(progress, maxScroll) / maxScroll; // clamp & normiert auf 0..1

            const r = lerp(colorStart[0], colorEnd[0], progress);
            const g = lerp(colorStart[1], colorEnd[1], progress);
            const b = lerp(colorStart[2], colorEnd[2], progress);

            document.body.style.background = `linear-gradient(to bottom, rgb(${r},${g},${b}) 0%, var(--color-bg-gradient-end) 100%)`;
        }

        window.addEventListener('scroll', updateBgColor, { passive: true });
        window.addEventListener('resize', updateBgColor);
        updateBgColor();
    })();

    // Dynamic Footer Loading
    function loadFooter() {
        try {
            // Footer data directly in JavaScript
            const footerData = {
                title: "Impressum & Kontakt",
                name: "Raphael Köhrer",
                address: "Am Sonnenhang 6, A - 4615 Holzhausen",
                email: "support@kovoo.at",
                phone: "+4367762118898",
                phoneDisplay: "+43 (0) 677 6211 8898",
                copyright: "© 2025 Raphael Köhrer. Alle Rechte vorbehalten."
            };
            
            // Determine the correct path based on current location
            const isSubpage = window.location.pathname.includes('/unterseiten/');
            const datenschutzPath = isSubpage ? '../datenschutz.html' : './datenschutz.html';
            const impressumPath = isSubpage ? '../impressum.html' : './impressum.html';
            
            const footerHTML = `
                <div class="footer-content">
                    <div class="footer-title">${footerData.title}</div>
                    <hr class="footer-hr">
                    <p>
                        ${footerData.name}<br>
                        ${footerData.address}<br>
                        <a href="mailto:${footerData.email}">${footerData.email}</a> | 
                        <a href="tel:${footerData.phone}">${footerData.phoneDisplay}</a>
                    </p>
                    <p>
                        <a href="${datenschutzPath}">Datenschutz</a> &nbsp;|&nbsp; 
                        <a href="${impressumPath}">Impressum</a>
                    </p>
                    <p style="margin-top:1.2em;font-size:0.97em;opacity:0.7;">
                        ${footerData.copyright}
                    </p>
                </div>
            `;
            
            const footerElement = document.querySelector('.footer, #footer');
            if (footerElement) {
                footerElement.innerHTML = footerHTML;
            }
        } catch (error) {
            console.error('Error loading footer:', error);
            // Fallback footer if loading fails
            const footerElement = document.querySelector('.footer, #footer');
            if (footerElement) {
                footerElement.innerHTML = `
                    <div class="footer-content">
                        <div class="footer-title">Kontakt</div>
                        <hr class="footer-hr">
                        <p>Bei Fragen kontaktieren Sie uns per E-Mail.</p>
                    </div>
                `;
            }
        }
    }

    // Load footer dynamically
    loadFooter();
});