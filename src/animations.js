
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {


    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loader-text');

    if (loader && loaderText) {
        const tl = gsap.timeline();

        // Animate Text
        tl.to(loaderText, {
            y: 0,
            duration: 1,
            ease: "power4.out",
            delay: 0.5
        })
            .to(loaderText, {
                y: "-110%",
                duration: 1,
                ease: "power4.in",
                delay: 0.5
            })
            // Animate Loader Away
            .to(loader, {
                height: 0,
                duration: 1,
                ease: "power4.inOut",
                onComplete: () => {
                    loader.style.display = 'none';
                }
            });
    } else if (loader) {
        // Fallback if text element is missing
        gsap.to(loader, {
            height: 0,
            duration: 1,
            ease: "power4.inOut",
            delay: 1,
            onComplete: () => {
                loader.style.display = 'none';
            }
        });
    }
}
