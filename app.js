/* ===========================
   ONE BIZ OK - app.js
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

    const isMobile = window.innerWidth <= 768;

    // =========================================
    // 1. FOOTER YEAR
    // =========================================
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // =========================================
    // 2. SOURCE PROTECTION
    // =========================================
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) ||
            (e.ctrlKey && e.key === 'U') ||
            (e.ctrlKey && e.key === 'S')
        ) {
            e.preventDefault();
            return false;
        }
    });

    // =========================================
    // 3. HEADER SCROLL + SCROLL-TO-TOP
    // =========================================
    const header = document.getElementById('header');
    const scrollTopBtn = document.getElementById('scrollTop');

    let lastScroll = 0;
    const onScroll = () => {
        const y = window.scrollY;
        if (Math.abs(y - lastScroll) < 4) return;
        lastScroll = y;
        if (header) header.classList.toggle('scrolled', y > 50);
        if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', y > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // =========================================
    // 4. ACTIVE NAV LINK ON SCROLL
    // =========================================
    const navLinks = document.querySelectorAll('.obo-nav a.nav-link');
    const sections = document.querySelectorAll('section[id]');
    if (navLinks.length && sections.length) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    const active = document.querySelector('.obo-nav a[href="#' + entry.target.id + '"]');
                    if (active) active.classList.add('active');
                }
            });
        }, { threshold: 0.3, rootMargin: '-70px 0px 0px 0px' });
        sections.forEach(s => navObserver.observe(s));
    }

    // =========================================
    // 5. SCROLL REVEAL
    // =========================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                revealObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // =========================================
    // 6. COUNTER ANIMATION
    // =========================================
    function animateCount(el, target, isFloat) {
        const dur = 1800, start = performance.now();
        const tick = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 4);
            el.textContent = isFloat
                ? (ease * target).toFixed(1)
                : Math.round(ease * target);
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
    let counted = false;
    const statsEl = document.querySelector('.obo-stats');
    if (statsEl) {
        new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !counted) {
                counted = true;
                document.querySelectorAll('.stat-num').forEach(el => {
                    animateCount(el, parseFloat(el.dataset.count), el.dataset.count.includes('.'));
                });
            }
        }, { threshold: 0.5 }).observe(statsEl);
    }

    // =========================================
    // 7. MOBILE MENU
    // =========================================
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    function closeMobileMenu() {
        if (!mobileMenu || !mobileToggle) return;
        mobileMenu.classList.remove('open');
        mobileToggle.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                mobileMenu.classList.add('open');
                mobileToggle.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    // =========================================
    // 8. FORM - Web3Forms + Checking Animation + Popup
    // =========================================
    const form = document.getElementById('obo-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('.obo-btn-submit');
            const btnText = document.getElementById('btn-text');
            const statusEl = document.getElementById('form-status');
            const nameInput = form.querySelector('input[name="name"]');
            const submittedName = nameInput ? nameInput.value.trim() : '';

            // Phase 1: Checking availability
            btnText.innerHTML = '<span>Checking availability</span><span class="checking-dots"><span></span><span></span><span></span></span>';
            btn.disabled = true;
            btn.style.background = 'linear-gradient(135deg,#4f46e5,#7c3aed)';

            await new Promise(r => setTimeout(r, 1400));

            // Phase 2: Sending
            btnText.innerHTML = '<span>Sending your request</span><span class="checking-dots"><span></span><span></span><span></span></span>';

            const formData = new FormData(form);
            formData.append('access_key', '6293cc47-0847-4d84-be3e-f07dc9a3430b');
            formData.append('subject', 'New Project Request - One Biz Ok');
            formData.append('from_name', 'One Biz Ok Website');

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.success) {
                    btnText.innerHTML = '<i class="fas fa-check"></i> Slot confirmed! We\'ll contact you soon.';
                    btn.style.background = 'linear-gradient(135deg,#06d6a0,#059669)';
                    form.reset();

                    setTimeout(() => showSuccessPopup(submittedName), 500);

                    setTimeout(() => {
                        btnText.innerHTML = 'Lock In ₱2,500 Rate &rarr;';
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 6000);

                } else {
                    throw new Error(result.message || 'Failed');
                }
            } catch (err) {
                btnText.innerHTML = 'Lock In ₱2,500 Rate &rarr;';
                btn.style.background = '';
                btn.disabled = false;
                if (statusEl) {
                    statusEl.textContent = 'Something went wrong. Please email us at hello@onebizok.com';
                    statusEl.className = 'form-status error';
                    setTimeout(() => { statusEl.className = 'form-status'; statusEl.textContent = ''; }, 7000);
                }
            }
        });
    }

    // =========================================
    // 9. FAQ ACCORDION
    // =========================================
    document.querySelectorAll('.faq-item').forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });

    // =========================================
    // 10. PORTFOLIO FILTER
    // =========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.obo-portfolio-item');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            portfolioItems.forEach((item) => {
                const show = filter === 'all' || item.dataset.category === filter;
                item.classList.toggle('hidden', !show);
            });
        });
    });

    // =========================================
    // 11. CUSTOM CURSOR - Desktop only
    // =========================================
    if (!isMobile) {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        if (dot && ring) {
            let mx = 0, my = 0, rx = 0, ry = 0;
            document.addEventListener('mousemove', e => {
                mx = e.clientX; my = e.clientY;
                dot.style.left = mx + 'px';
                dot.style.top = my + 'px';
            });
            (function animRing() {
                rx += (mx - rx) * 0.12;
                ry += (my - ry) * 0.12;
                ring.style.left = rx + 'px';
                ring.style.top = ry + 'px';
                requestAnimationFrame(animRing);
            })();
            document.querySelectorAll('a, button, .obo-portfolio-item, .faq-question, .filter-btn').forEach(el => {
                el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
                el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
            });
            document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
            document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
        }
    }

    // =========================================
    // 12. FLOATING ORBS - Desktop only, low frequency
    // =========================================
    if (!isMobile) {
        const orbColors = ['rgba(79,70,229,0.4)', 'rgba(247,37,133,0.4)', 'rgba(6,214,160,0.4)', 'rgba(124,58,237,0.4)'];
        function spawnOrb() {
            const hero = document.querySelector('.obo-hero');
            if (!hero) return;
            const orb = document.createElement('div');
            const size = Math.random() * 8 + 4;
            orb.className = 'hero-orb';
            orb.style.cssText =
                'width:' + size + 'px;' +
                'height:' + size + 'px;' +
                'left:' + (Math.random() * 100) + '%;' +
                'background:' + orbColors[Math.floor(Math.random() * orbColors.length)] + ';' +
                'animation-duration:' + (8 + Math.random() * 10) + 's;';
            hero.appendChild(orb);
            setTimeout(() => { if (orb.parentNode) orb.remove(); }, 18000);
        }
        setInterval(spawnOrb, 3000);
    }

});

// =========================================
// SUCCESS POPUP
// =========================================
function showSuccessPopup(name) {
    const popup = document.getElementById('successPopup');
    const overlay = document.getElementById('successOverlay');
    if (!popup || !overlay) return;

    const firstName = (name && name.trim()) ? name.trim().split(' ')[0] : 'there';
    document.getElementById('successPopupTitle').textContent = 'Hello, ' + firstName + '!';
    document.getElementById('successPopupMsg').textContent = 'We have received your request. Our team will contact you shortly to confirm your slot and get things started.';
    document.getElementById('successSlotText').textContent = 'Slots are limited. Thank you for securing yours.';

    popup.classList.add('show');
    overlay.classList.add('show');

    function closePopup() {
        popup.classList.remove('show');
        overlay.classList.remove('show');
    }
    document.getElementById('successCloseBtn').onclick = closePopup;
    overlay.onclick = closePopup;
}

// =========================================
// LIGHTBOX
// =========================================
const galleryImages = [
    'images/demo/interior-design-website-template.jpg',
    'images/demo/architecture-html-template.jpg',
    'images/demo/home-repair-website-template.jpg',
    'images/demo/building-construction-website-template.jpg',
    'images/demo/real-estate-html-template.jpg',
    'images/demo/online-shop-website-template.jpg',
    'images/demo/bootstrap-ecommerce-template.jpg',
    'images/demo/ecommerce-html-template.jpg'
];
const galleryLabels = ['Interior Design', 'Architecture', 'Home Repair', 'Construction', 'Real Estate', 'Online Shop', 'Fashion Store', 'Modern Ecommerce'];
let currentImageIndex = 0;

function openLightbox(index) {
    currentImageIndex = index;
    updateLightboxImage();
    const lb = document.getElementById('lightbox');
    if (lb) lb.classList.add('active');
    document.body.style.overflow = 'hidden';
    const t = document.getElementById('lb-total');
    if (t) t.textContent = galleryImages.length;
}
function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) lb.classList.remove('active');
    document.body.style.overflow = '';
}
function changeSlide(dir) {
    currentImageIndex = (currentImageIndex + dir + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
}
function updateLightboxImage() {
    const img = document.getElementById('lightbox-img');
    if (!img) return;
    img.style.opacity = '0';
    const c = document.getElementById('lb-current');
    if (c) c.textContent = currentImageIndex + 1;
    setTimeout(() => {
        img.src = galleryImages[currentImageIndex];
        img.alt = galleryLabels[currentImageIndex] + ' Website Template';
        img.style.opacity = '1';
    }, 150);
}
document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('active')) {
        if (e.key === 'ArrowLeft') changeSlide(-1);
        else if (e.key === 'ArrowRight') changeSlide(1);
        else if (e.key === 'Escape') closeLightbox();
    }
});
let touchX = 0;
document.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('active')) return;
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 44) changeSlide(diff > 0 ? 1 : -1);
}, { passive: true });
