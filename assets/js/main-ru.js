
// 1. Force the browser to ignore the previous scroll position
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// 2. Snap to top immediately on refresh
window.scrollTo(0, 0);

/* --- 1. DEVICE ANIMATION LOGIC --- */
const revealBtn = document.querySelector("#reveal-btn");
const startBtn = document.querySelector("#start-btn");
const mainDevice = document.querySelector(".oud-container");
const stick = document.querySelector(".oud-stick");
const flame = document.querySelector("#main-flame");
const oudTip = document.querySelector(".oud-tip");
const smokeContainer = document.querySelector("#luxury-smoke");
const subtitle = document.querySelector(".subtitle");
let state = 0;
let flameTween, pulseTween, smokeTweens = [];

function updateSubtitle(newText) {
    gsap.to(subtitle, {
        opacity: 0, y: -10, duration: 0.4,
        onComplete: () => {
            subtitle.innerText = newText;
            gsap.to(subtitle, { opacity: 0.8, y: 0, duration: 0.6, ease: "power2.out" });
        }
    });
}

revealBtn.addEventListener("click", () => {
    gsap.timeline()
        .to(revealBtn, { opacity: 0, y: -20, duration: 0.5, onComplete: () => revealBtn.style.display = "none" })
        .to([mainDevice, startBtn], { autoAlpha: 1, y: 0, duration: 1, stagger: 0.2, ease: "back.out(1.7)" });
});

startBtn.addEventListener("click", () => {
    if (gsap.isTweening(stick)) return;
    if (state === 0) handleIgnition();
    else if (state === 1) handleBlow();
    else if (state === 2) handleReset();
});

function handleIgnition() {
    state = 1;
    startBtn.innerText = "Подождите 30 секунд...";
    updateSubtitle("Дайте кончику равномерно разгореться до образования тлеющего уголька. Это поможет аромату раскрыться максимально эффективно. Затем аккуратно потушите пламя, слегка подув на него.");
    if (pulseTween) pulseTween.kill();
    gsap.killTweensOf([flame, oudTip]);
    gsap.set(flame, { scale: 0, autoAlpha: 0 });
    gsap.set(oudTip, { backgroundColor: "#2b1d16", boxShadow: "none" });
    const tl = gsap.timeline();
    tl.to(startBtn, { pointerEvents: "none", opacity: 0.8, duration: 0.1 })
        .to(flame, { autoAlpha: 1, scale: 1.1, duration: 0.8, ease: "back.out(1.7)", overwrite: "auto" })
        .add(() => { flameTween = gsap.to(".flame-outer", { scaleY: 1.1, scaleX: 0.9, duration: 0.1, yoyo: true, repeat: -1 }); })
        .fromTo(startBtn,
            { background: "linear-gradient(90deg, #d4af37 0%, transparent 0%)" },
            { background: "linear-gradient(90deg, #d4af37 100%, transparent 100%)", duration: 3, ease: "none" }
        )
        .to(startBtn, {
            pointerEvents: "auto", opacity: 1, background: "transparent",
            onStart: () => { startBtn.innerText = "Подуйте"; }
        });
}

function handleBlow() {
    state = 2;
    startBtn.innerText = "Потушить и погасить";
    updateSubtitle("Дайте палочке тлеть от 20 до 30 минут, мягко направляя аромат рукой. Затем погасите кончик, перевернув его и вставив в подставку");
    if (flameTween) flameTween.kill();
    gsap.to(flame, { scale: 0, autoAlpha: 0, duration: 0.4, overwrite: "auto" });
    pulseTween = gsap.fromTo(oudTip,
        { backgroundColor: "#2b1d16", boxShadow: "0 0 0px rgba(0,0,0,0)" },
        {
            backgroundColor: "#ff4500", boxShadow: "0 -8px 40px 12px rgba(255, 69, 0, 0.7)",
            duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut"
        }
    );
    gsap.to(smokeContainer, { opacity: 1, duration: 1 });

    document.querySelectorAll(".smoke-layer").forEach((layer, i) => {
        smokeTweens.push(gsap.fromTo(layer,
            { y: 0, opacity: 0, scale: 1.5 },
            { y: -350, x: "random(-15, 15)", opacity: 0.8, scale: 6, duration: 4 + i, repeat: -1, delay: i * 0.4, ease: "power1.out" }
        ));
    });
    document.querySelectorAll(".smoke-wisp").forEach((wisp, i) => {
        gsap.set(wisp, { opacity: 0, scaleY: 0, xPercent: -50, x: 0 });
        smokeTweens.push(gsap.fromTo(wisp,
            { scaleY: 0, opacity: 0, y: 0 },
            {
                scaleY: 2.5, opacity: 0.7, y: -250, duration: 5 + (i * 1), repeat: -1, delay: i * 1.5, ease: "power1.out",
                onRepeat: () => { gsap.to(wisp, { x: gsap.utils.random(-30, 30), duration: 4, ease: "sine.inOut" }); }
            }
        ));
        smokeTweens.push(gsap.to(wisp, { rotation: i % 2 === 0 ? 5 : -5, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" }));
    });
}

function handleReset() {
    state = 0;
    startBtn.innerText = "Переворачивание...";
    updateSubtitle("Образующийся шлейф будет сохраняться в течение дня и дольше.");
    startBtn.style.pointerEvents = "none";
    if (pulseTween) pulseTween.kill();
    const flipTL = gsap.timeline({
        onComplete: () => {
            startBtn.innerText = "Зажечь";
            startBtn.style.pointerEvents = "auto";
            gsap.set(stick, { rotation: 0 });
            gsap.set(oudTip, { backgroundColor: "#2b1d16", boxShadow: "none", clearProps: "all" });
            smokeTweens.forEach(t => t.kill());
            smokeTweens = [];
            gsap.to([".smoke-layer", ".smoke-wisp", smokeContainer], { opacity: 0, duration: 0.5 });
        }
    });
    flipTL.to(stick, { y: -120, duration: 0.8, ease: "power2.inOut" })
        .to(stick, { rotation: "+=180", duration: 1, ease: "sine.inOut" }, "-=0.4")
        .to(stick, { y: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.2")
        .to(oudTip, { backgroundColor: "#2b1d16", boxShadow: "none", duration: 1 }, 0);
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
}, { threshold: 0.1 });
document.querySelectorAll('.feature-item').forEach(item => observer.observe(item));


/* --- 2. UPDATED SCENT SCROLL ANIMATION (10 SCENTS) --- */
gsap.registerPlugin(ScrollTrigger);

const scentTL = gsap.timeline({
    scrollTrigger: {
        trigger: "#scents-pin-wrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        snap: "labels"
    }
});

const configs = [
    { id: 'azraq', color: '#001a33' }, { id: 'leather', color: '#0a2e14' },
    { id: 'ocean', color: '#253341' }, { id: 'royal', color: '#5e4900' },
    { id: 'taifi', color: '#7a1b3c' }, { id: 'lavender', color: '#330066' },
    { id: 'saffron', color: '#8b4513' }, { id: 'maroki', color: '#4a0404' },
    { id: 'cuban', color: '#3e2723' }, { id: 'kalimantan', color: '#1a1a1a' }
];

configs.forEach((cfg, i) => {
    const panel = `#panel-${cfg.id}`;
    const box = `#box-${cfg.id}`;
    const ings = `#ing-${cfg.id} .ingredient-item`;

    scentTL.to(".scents-pinned-stage", { backgroundColor: cfg.color, duration: 1 }, i === 0 ? undefined : "<");
    if (i === 0) scentTL.to("#box-cover", { opacity: 0, duration: 0.5 }, "<");

    scentTL.to(panel, { opacity: 1, duration: 1 }, "<");
    scentTL.to(box, { opacity: 1, duration: 1 }, "<");

    /* --- UPDATED INGREDIENT TWEEN --- */

    scentTL.to(ings, {
        opacity: 1,
        duration: 2,
        ease: "back.out(1.2)",
        x: (index, target, targets) => {
            const isLeft = index < targets.length / 2;
            const spacing = 150;
            return isLeft ? -spacing : spacing;
        },
        y: (index, target, targets) => {
            const itemsPerSide = Math.ceil(targets.length / 2);
            const row = index % itemsPerSide;
            return (row * 120) - 60;
        },
        scale: 1.5,
        stagger: 0.1,
        startAt: { scale: 0, zIndex: -1, rotation: 0 },

        // --- TARGET THE CHILD FOR THE FLOAT ---
        onComplete: (index, target) => {
            // We find the inner image/content so ScrollTrigger doesn't fight it
            const child = target.querySelector('img') || target.children[0];

            if (child) {
                gsap.to(child, {
                    y: 15,               // The float happens locally inside the parent
                    duration: 2 + Math.random(),
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: Math.random()
                });
            }
        }
    }, "<");

    scentTL.addLabel("snap" + i);
    scentTL.to({}, { duration: 1.5 });

    if (i < configs.length - 1) {
        scentTL.to([panel, box, ings], {
            opacity: 0,
            duration: 1,
            onStart: () => {
                // This stops the floating animations for these specific ingredients 
                // once they start fading out to save CPU/Battery.
                gsap.killTweensOf(document.querySelectorAll(`${ings} img`));
            }
        });
    }
});

