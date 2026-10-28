document.addEventListener("DOMContentLoaded", () => {

    // 1. SOUND SYSTEM
    let soundEnabled = localStorage.getItem("uiSoundEnabled") === "true";
    const soundToggleBtn = document.getElementById("soundToggle");
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function updateSoundIcon() {
        if (soundToggleBtn) {
            const icon = soundToggleBtn.querySelector("i");
            if (icon) {
                icon.className = soundEnabled ? "fas fa-volume-up" : "fas fa-volume-mute";
            }
        }
    }
    updateSoundIcon();

    function playHoverSound() {
        if (!soundEnabled) return;
        try {
            if (audioCtx.state === "suspended") audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
        } catch (e) { }
    }

    function playClickSound() {
        if (!soundEnabled) return;
        try {
            if (audioCtx.state === "suspended") audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(300, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
        } catch (e) { }
    }

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener("click", () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem("uiSoundEnabled", soundEnabled);
            updateSoundIcon();
            if (soundEnabled && audioCtx.state === "suspended") {
                audioCtx.resume();
            }
        });
    }

    // 2. PAGE TRANSITIONS
    const pageTransition = document.getElementById("page-transition");

    if (pageTransition) {
        pageTransition.classList.remove("is-entering", "is-leaving");
        pageTransition.style.opacity = "";
        pageTransition.style.pointerEvents = "";
    }

    function navigateTo(targetUrl) {
        const currentUrl = window.location.pathname.split("/").pop() || "index.html";
        if (targetUrl === currentUrl) return;

        if (typeof playClickSound === "function") playClickSound();

        if (pageTransition) {
            sessionStorage.setItem("pageNavigated", "true");
            pageTransition.classList.add("is-entering");

            setTimeout(() => {
                window.location.href = targetUrl;
            }, 300);
        } else {
            window.location.href = targetUrl;
        }
    }

    const navLinks = document.querySelectorAll("a[href$='.html']");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetUrl = link.getAttribute("href");
            navigateTo(targetUrl);
        });
    });

    // 3. KEYBOARD SHORTCUTS
    const keyMap = {
        '1': 'index.html',
        '2': 'works.html',
        '3': 'directors.html',
        '4': 'about.html',
        '5': 'contact.html'
    };

    window.addEventListener("keydown", (e) => {
        if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

        if (keyMap[e.key]) {
            navigateTo(keyMap[e.key]);
        }
    });

    // 4. SCROLL PROGRESS
    const scrollBar = document.getElementById("scrollBar");
    const scrollPercent = document.getElementById("scrollPercent");

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (scrollBar) scrollBar.style.width = `${scrollProgress}%`;
        if (scrollPercent) scrollPercent.textContent = `${String(Math.round(scrollProgress)).padStart(2, '0')}% SCRL`;
    });

    // 5. PRELOADER
    const preloader = document.getElementById("preloader");
    if (preloader) {
        const loadCounter = document.getElementById("loadCounter");
        const loaderBar = document.getElementById("loaderBar");
        const loaderStatus = document.getElementById("loaderStatus");

        let count = 0;
        const interval = setInterval(() => {
            count += Math.floor(Math.random() * 8) + 4;

            if (count >= 100) {
                count = 100;
                clearInterval(interval);
                if (loaderStatus) loaderStatus.textContent = "READY // WELCOME";
                setTimeout(() => {
                    preloader.classList.add("loaded");
                    setTimeout(() => preloader.style.display = "none", 850);
                }, 150);
            }

            if (loadCounter) loadCounter.textContent = String(count).padStart(2, '0');
            if (loaderBar) loaderBar.style.width = `${count}%`;
        }, 25);
    }

    // 6. LIVE CLOCK
    const liveClock = document.getElementById("liveClock");
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        if (liveClock) liveClock.textContent = `${hours}:${minutes}:${seconds} ICT`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 7. CUSTOM CURSOR & SOUND ON HOVER (Đã sửa lỗi cursorText)
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorOutline = document.querySelector(".cursor-outline");
    const cursorText = document.querySelector(".cursor-text");
    const hoverTargets = document.querySelectorAll(".hover-target");

    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        if (cursorDot) {
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
        }

        if (cursorOutline) {
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 300, fill: "forwards" });
        }
    });

    hoverTargets.forEach(target => {
        target.addEventListener("mouseenter", () => {
            if (cursorOutline) cursorOutline.classList.add("hovered");
            
            if (cursorText) {
                if (target.classList.contains("work-slide") || target.closest(".work-slide")) {
                    cursorText.textContent = "watch";
                } else if (target.classList.contains("btn")) {
                    cursorText.textContent = "click";
                } else {
                    cursorText.textContent = "press";
                }
            }
            playHoverSound();
        });

        target.addEventListener("mouseleave", () => {
            if (cursorOutline) cursorOutline.classList.remove("hovered");
            if (cursorText) cursorText.textContent = "";
        });
    });

    // 8. 3D FLOATING CARDS
    const floatCards = document.querySelectorAll(".float-card");
    const heroSection = document.querySelector(".hero");

    if (heroSection) {
        heroSection.addEventListener("mousemove", (e) => {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const moveX = (clientX - centerX) / 30;
            const moveY = (clientY - centerY) / 30;

            floatCards.forEach((card, index) => {
                const depth = (index + 1) * 0.5;
                card.style.transform = `translate(${moveX * depth}px, ${moveY * depth}px) rotate(${(index - 1) * 5}deg)`;
            });
        });
    }

    // 9. DIRECTORS CONTROLLER
    const directorItems = document.querySelectorAll(".director-item");
    const directorMainImg = document.getElementById("directorMainImg");
    const directorRoleText = document.getElementById("directorRoleText");

    directorItems.forEach(item => {
        item.addEventListener("mouseenter", () => {
            directorItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const newImg = item.getAttribute("data-img");
            const newRole = item.getAttribute("data-role");

            if (directorMainImg && newImg) {
                directorMainImg.style.opacity = "0.2";
                directorMainImg.style.transform = "scale(0.96)";
                
                setTimeout(() => {
                    directorMainImg.src = newImg;
                    directorMainImg.style.opacity = "1";
                    directorMainImg.style.transform = "scale(1)";
                }, 150);
            }

            if (directorRoleText && newRole) {
                directorRoleText.textContent = newRole;
            }

            playHoverSound();
        });
    });

    // 10. TYPING EFFECT
    const words = ["VIDEO EDITOR", "CREATIVE CONCEPT", "CAPCUT SPECIALIST", "DAVINCI RESOLVER"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingElement = document.querySelector('.typing-text');

    function type() {
        if (!typingElement) return;
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typingElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            setTimeout(type, 1800);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(type, 400);
        } else {
            setTimeout(type, isDeleting ? 40 : 80);
        }
    }
    type();

    // 11. THEME TOGGLE
    const themeToggleBtn = document.getElementById("themeToggle");
    const body = document.body;
    const savedTheme = localStorage.getItem("uiTheme");

    function applyTheme(theme) {
        const icon = themeToggleBtn ? themeToggleBtn.querySelector("i") : null;
        
        if (theme === "light") {
            body.classList.add("light-mode");
            if (icon) icon.className = "fas fa-moon";
        } else {
            body.classList.remove("light-mode");
            if (icon) icon.className = "fas fa-sun";
        }
    }

    if (savedTheme) applyTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const isLight = body.classList.toggle("light-mode");
            const newTheme = isLight ? "light" : "dark";
            localStorage.setItem("uiTheme", newTheme);
            applyTheme(newTheme);
            playClickSound();
        });
    }

    // 12. PORTFOLIO FILTER
    const filterBtns = document.querySelectorAll(".filter-btn");
    const portfolioItems = document.querySelectorAll(".portfolio-item");

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            playClickSound();

            const filter = btn.getAttribute("data-filter");

            portfolioItems.forEach(item => {
                if (filter === "all" || item.getAttribute("data-category") === filter) {
                    item.classList.remove("hide");
                } else {
                    item.classList.add("hide");
                }
            });
        });
    });

    // 13. MATRIX FORM
    const matrixContactForm = document.getElementById("matrixContactForm");
    const matrixAlert = document.getElementById("matrixAlert");

    if (matrixContactForm) {
        matrixContactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            playClickSound();

            const name = document.getElementById("userName").value;
            
            if (matrixAlert) {
                matrixAlert.style.display = "block";
                matrixAlert.innerHTML = `[SUCCESS] YÊU CẦU DỰ ÁN ĐÃ ĐƯỢC GỬI! CẢM ƠN ${name.toUpperCase()}.`;
                
                setTimeout(() => {
                    matrixAlert.style.display = "none";
                }, 5000);
            }

            matrixContactForm.reset();
        });
    }

    // 14. VIDEO MODAL LIGHTBOX (Đã tối ưu hỗ trợ cả .mp4 lẫn iframe)
    const videoModal = document.getElementById("videoModal");
    const modalOverlay = document.getElementById("modalOverlay");
    const modalClose = document.getElementById("modalClose");
    const modalIframe = document.getElementById("modalIframe");
    const modalVideo = document.getElementById("modalVideo");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const modalSoftware = document.getElementById("modalSoftware");

    if (videoModal && portfolioItems.length > 0) {
        portfolioItems.forEach(item => {
            item.addEventListener("click", () => {
                const videoUrl = item.getAttribute("data-video") || "";
                const title = item.getAttribute("data-title") || "";
                const desc = item.getAttribute("data-desc") || "";
                const software = item.getAttribute("data-software") || "";

                // Kiểm tra định dạng video là .mp4 hay YouTube/Vimeo
                if (videoUrl.endsWith(".mp4") || videoUrl.endsWith(".webm")) {
                    if (modalIframe) modalIframe.style.display = "none";
                    if (modalVideo) {
                        modalVideo.style.display = "block";
                        modalVideo.src = videoUrl;
                        modalVideo.play();
                    }
                } else {
                    if (modalVideo) {
                        modalVideo.pause();
                        modalVideo.style.display = "none";
                    }
                    if (modalIframe) {
                        modalIframe.style.display = "block";
                        modalIframe.src = videoUrl ? `${videoUrl}?autoplay=1` : "";
                    }
                }

                if (modalTitle) modalTitle.textContent = title;
                if (modalDesc) modalDesc.textContent = desc;
                if (modalSoftware) modalSoftware.textContent = software;

                videoModal.classList.add("active");
                playClickSound();
            });
        });

        function closeModal() {
            videoModal.classList.remove("active");
            if (modalIframe) modalIframe.src = "";
            if (modalVideo) {
                modalVideo.pause();
                modalVideo.src = "";
            }
            playClickSound();
        }

        if (modalClose) modalClose.addEventListener("click", closeModal);
        if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && videoModal.classList.contains("active")) {
                closeModal();
            }
        });
    }
});