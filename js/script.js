document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Sticky Header
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    animatedElements.forEach(el => observer.observe(el));

    // 3. Counter Animation for Stats
    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps
                
                let current = 0;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.innerText = Math.ceil(current).toLocaleString();
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target.toLocaleString();
                        if (target >= 1000000) {
                             counter.innerText += '+';
                        }
                    }
                };
                
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => statsObserver.observe(counter));

    // 4. Form Submission Prevention (for demo)
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = emailForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "System Joined!";
            btn.style.backgroundColor = "#fff";
            btn.style.color = "#000";
            
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = "";
                btn.style.color = "";
                emailForm.reset();
            }, 3000);
        });
    }

    // 5. Initialize Premium 3D Background with Three.js
    function init3DBackground() {
        const canvas = document.getElementById('webgl-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x040404, 0.015); // Dark fog to hide edges

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create particles
        const geometry = new THREE.BufferGeometry();
        const count = 4000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const color1 = new THREE.Color(0xc5a880); // Gold
        const color2 = new THREE.Color(0x333333); // Dark Gray

        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 150;
            positions[i+1] = (Math.random() - 0.5) * 150;
            positions[i+2] = (Math.random() - 0.5) * 150;

            // Mix colors
            const mixedColor = color1.clone().lerp(color2, Math.random() * 0.8 + 0.2);
            colors[i] = mixedColor.r;
            colors[i+1] = mixedColor.g;
            colors[i+2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Use circular points if possible, or basic PointsMaterial
        const material = new THREE.PointsMaterial({
            size: 0.18,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // Lightning effect setup
        const lightningFlash = new THREE.PointLight(0xc5a880, 0, 500, 1.7);
        lightningFlash.position.set(0, 100, -50);
        scene.add(lightningFlash);

        // Scroll interaction variables
        let scrollY = window.scrollY;
        let targetScrollY = scrollY;
        
        window.addEventListener('scroll', () => {
            targetScrollY = window.scrollY;
        });

        // Mouse interaction variables
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX) * 0.0005;
            mouseY = (event.clientY - windowHalfY) * 0.0005;
        });

        // Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Animation Loop
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            
            // Premium Lightning flash logic (biddut chomkano)
            if (Math.random() > 0.995) { // Occasional strike trigger
                lightningFlash.intensity = 150 + Math.random() * 200;
                scene.fog.color.setHex(0xc5a880); // Bright gold/white flash
                
                // Realistic stuttering secondary flashes
                if (Math.random() > 0.3) {
                    setTimeout(() => { lightningFlash.intensity = 200; scene.fog.color.setHex(0xffffff); }, 50);
                    setTimeout(() => { lightningFlash.intensity = 0; }, 100);
                    setTimeout(() => { lightningFlash.intensity = 150; }, 150);
                }
            } else {
                // Rapid decay for sharp drop-off
                lightningFlash.intensity = Math.max(0, lightningFlash.intensity - (10 + Math.random() * 15));
                if (lightningFlash.intensity < 5) {
                    scene.fog.color.lerp(new THREE.Color(0x040404), 0.1); // Smooth fade back to dark
                }
            }
            
            const elapsedTime = clock.getElapsedTime();

            // Smooth interpolation
            scrollY += (targetScrollY - scrollY) * 0.05;
            targetX = mouseX * 0.5;
            targetY = mouseY * 0.5;

            // Slowly rotate the entire particle field
            particles.rotation.y = elapsedTime * 0.03 + scrollY * 0.0005;
            particles.rotation.x = elapsedTime * 0.01 + scrollY * 0.0002;

            // Camera movement based on scroll (moves through the field)
            camera.position.y = -scrollY * 0.015;
            
            // Subtle camera movement from mouse
            camera.position.x += (targetX * 10 - camera.position.x) * 0.05;
            camera.position.z += (30 - targetY * 10 - camera.position.z) * 0.05;
            
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        }

        animate();
    }

    if (typeof THREE !== 'undefined') {
        init3DBackground();
    }

    // Custom Cursor Logic
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline && !window.matchMedia("(max-width: 768px)").matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });
        
        document.querySelectorAll('a, button, .video-card, .blueprint-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.backgroundColor = 'rgba(197, 168, 128, 0.1)';
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.width = '30px';
                cursorOutline.style.height = '30px';
                cursorOutline.style.backgroundColor = 'transparent';
            });
        });
    } else if (cursorDot) {
        cursorDot.style.display = 'none';
        cursorOutline.style.display = 'none';
        document.body.style.cursor = 'auto';
    }

    // Initialize VanillaTilt if available
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".video-card"), {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.2
        });
        VanillaTilt.init(document.querySelectorAll(".blueprint-card"), {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.1
        });
        VanillaTilt.init(document.querySelectorAll(".image-wrapper"), {
            max: 5,
            speed: 400,
            glare: true,
            "max-glare": 0.1
        });
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // Global Lightning Flash Effect & Visual Cracks
    const lightningOverlay = document.createElement('div');
    lightningOverlay.id = 'lightning-overlay';
    document.body.appendChild(lightningOverlay);

    function triggerFlashOverlay() {
        lightningOverlay.style.opacity = '0.3';
        setTimeout(() => { lightningOverlay.style.opacity = '0'; }, 40);
        setTimeout(() => { lightningOverlay.style.opacity = '0.6'; }, 100);
        setTimeout(() => { lightningOverlay.style.opacity = '0'; }, 160);
        
        if (Math.random() > 0.5) {
            setTimeout(() => { lightningOverlay.style.opacity = '0.2'; }, 250);
            setTimeout(() => { lightningOverlay.style.opacity = '0'; }, 300);
        }

        const positions = ['top right', 'top left', 'top center'];
        const randomPos = positions[Math.floor(Math.random() * positions.length)];
        lightningOverlay.style.background = `radial-gradient(circle at ${randomPos}, #ffffff, transparent 70%)`;
    }

    function createLightningCrack(x, y, isClick) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.style.position = 'fixed';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100vw';
        svg.style.height = '100vh';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '9999';
        
        // Add glow filter
        const defs = document.createElementNS(svgNS, "defs");
        defs.innerHTML = `
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        `;
        svg.appendChild(defs);

        function createBranch(startX, startY, angle, length, branchWidth) {
            if (length < 10 || branchWidth < 0.5) return;
            
            let currX = startX;
            let currY = startY;
            let pathString = `M ${currX} ${currY}`;
            
            const segments = Math.floor(length / 10);
            for(let i=0; i<segments; i++) {
                const jitterAngle = angle + (Math.random() - 0.5) * 1.5; 
                const stepLength = 10 + Math.random() * 20;
                
                currX += Math.cos(jitterAngle) * stepLength;
                currY += Math.sin(jitterAngle) * stepLength;
                pathString += ` L ${currX} ${currY}`;
                
                // Random chance to split
                if (Math.random() > 0.85) {
                    const splitAngle = angle + (Math.random() > 0.5 ? 0.6 : -0.6);
                    createBranch(currX, currY, splitAngle, length * (0.4 + Math.random() * 0.3), branchWidth * 0.6);
                }
            }
            
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", pathString);
            path.setAttribute("stroke", "#ffffff");
            path.setAttribute("stroke-width", branchWidth);
            path.setAttribute("fill", "none");
            path.setAttribute("filter", "url(#glow)");
            path.style.opacity = '0.9';
            svg.appendChild(path);
            
            // Inner gold core
            if (branchWidth > 1.5) {
                const corePath = document.createElementNS(svgNS, "path");
                corePath.setAttribute("d", pathString);
                corePath.setAttribute("stroke", "#c5a880");
                corePath.setAttribute("stroke-width", branchWidth * 0.3);
                corePath.setAttribute("fill", "none");
                svg.appendChild(corePath);
            }
        }
        
        if (isClick) {
            // Generate multiple cracks originating from the click
            const numBranches = 2 + Math.floor(Math.random() * 3);
            for(let i=0; i<numBranches; i++) {
                const randomAngle = Math.random() * Math.PI * 2;
                createBranch(x, y, randomAngle, window.innerHeight * (0.3 + Math.random() * 0.4), 3);
            }
        } else {
            // Natural strike from top to bottom
            const startAngle = Math.PI / 2 + (Math.random() - 0.5) * 0.5; // Mostly down
            createBranch(x, y, startAngle, window.innerHeight * (0.6 + Math.random() * 0.4), 4);
        }
        
        document.body.appendChild(svg);
        
        // Stutter animation for the visual crack
        setTimeout(() => { svg.style.opacity = '0'; }, 40);
        setTimeout(() => { svg.style.opacity = '1'; }, 100);
        setTimeout(() => { svg.style.opacity = '0'; }, 160);
        if(Math.random() > 0.5) {
            setTimeout(() => { svg.style.opacity = '0.5'; }, 250);
            setTimeout(() => { svg.remove(); }, 300);
        } else {
            setTimeout(() => { svg.remove(); }, 200);
        }
    }

    function triggerRandomLightning() {
        triggerFlashOverlay();
        const randomX = Math.random() * window.innerWidth;
        createLightningCrack(randomX, 0, false);
        const nextStrike = Math.random() * 7000 + 3000;
        setTimeout(triggerRandomLightning, nextStrike);
    }
    
    // Start random lightning after a short delay
    setTimeout(triggerRandomLightning, 2000);

    // Trigger on user click
    document.addEventListener('click', (e) => {
        triggerFlashOverlay();
        createLightningCrack(e.clientX, e.clientY, true);
    });

});
