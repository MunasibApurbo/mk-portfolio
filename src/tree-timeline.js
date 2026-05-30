
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initTiltEffect } from './tilt-effect.js';

import { journeyData } from './data.js';

gsap.registerPlugin(ScrollTrigger);

// Sort Descending (Newest First)
const timelineData = journeyData.sort((a, b) => new Date(b.date) - new Date(a.date));

export function initTreeTimeline() {
    const container = document.getElementById('timeline-container');
    const wrapper = document.getElementById('journey-wrapper');
    const canvas = document.getElementById('tree-canvas');
    if (!container || !wrapper || !canvas) return;

    const ctx = canvas.getContext('2d');

    // Render HTML Items
    let html = '';
    timelineData.forEach((item, index) => {
        // Correct Side Logic: Even = Left, Odd = Right
        const isLeft = index % 2 === 0;

        const cleanInstitution = item.institution.replace(/\s*\(.*?\)\s*/g, '').trim();

        // Standardize to match Awards Section
        const fromColor = 'md:from-white/10';
        const hoverBorder = 'md:hover:border-neon/50';
        const hoverShadow = 'md:hover:shadow-neon/20';
        const ringColor = 'md:ring-white/5';
        const textColor = 'text-neon'; // Keep subtitle neon like Awards
        const hoverText = 'group-hover:text-neon';

        // Premium Card HTML
        const cardHtml = `
       <div class="timeline-card cursor-pointer group tilt-card hoverable 
            journey-card-mobile 
            p-6 border border-[#E5F9C9]/10 md:border-[#E5F9C9]/10 
            transition-all duration-500 transition-shadow 
            ${hoverBorder} hover:bg-[#E5F9C9]/10 hover:shadow-lg ${hoverShadow} 
            ring-1 ring-[#E5F9C9]/5 ${ringColor} opacity-0 translate-y-8 w-full shape-parallelogram">
          
          <!-- Header -->
          <div class="flex flex-col ${isLeft ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} items-center text-center">
              <h3 class="text-2xl md:text-4xl font-sans font-extrabold text-[#E5F9C9] mb-1 leading-tight ${hoverText} transition-colors uppercase tracking-wide">${item.title}</h3>
              <p class="${textColor} font-sans font-bold text-sm md:text-base uppercase tracking-wide">${cleanInstitution}</p>
              
              <!-- Mobile Hint (Bar Line) -->
              <div class="md:hidden mt-3 flex justify-center opacity-50">
                  <div class="w-8 h-1 bg-[#E5F9C9]/30 rounded-full"></div>
              </div>
          </div>

          <!-- Details -->
          <div class="details-wrapper grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out mt-0 md:group-hover:grid-rows-[1fr] group-[.expanded]:grid-rows-[1fr]">
              <div class="overflow-hidden">
                  <div class="pt-4 border-t border-[#E5F9C9]/10 mt-4">
                    <p class="text-[#E5F9C9]/60 text-sm md:text-base leading-relaxed mb-4 uppercase ${isLeft ? 'md:text-right' : 'md:text-left'} text-center">${item.description}</p>
                    ${item.tags.length ? `
                    <div class="flex flex-wrap gap-2 ${isLeft ? 'md:justify-end' : 'md:justify-start'} justify-center">
                        ${item.tags.map(tag => `<span class="px-1.5 py-px md:px-2 md:py-1 bg-[#E5F9C9]/5 text-xs md:text-sm text-[#E5F9C9]/60 border border-[#E5F9C9]/20 shape-parallelogram inline-block"><span class="block">${tag}</span></span>`).join('')}
                    </div>
                    ` : ''}
                  </div>
              </div>
          </div>
       </div>
    `;

        // Wrapper: pl-8 on mobile to shift content right of the tree
        html += `
            <div class="timeline-item relative flex flex-col md:flex-row items-center justify-between md:justify-center w-full mb-12 md:mb-24 z-10 pointer-events-none md:pl-0" data-index="${index}">
                ${isLeft ?
                // LEFT ITEM Layout
                `
            <!-- Content on Left -->
            <div class="order-2 md:order-1 w-full md:w-5/12 md:pr-12 pointer-events-auto">
                ${cardHtml}
            </div>
            <!-- Spacer on Right -->
            <div class="order-1 md:order-2 w-full md:w-5/12 hidden md:block"></div>
            `
                :
                // RIGHT ITEM Layout
                `
            <!-- Spacer on Left -->
            <div class="order-1 w-full md:w-5/12 hidden md:block"></div>
            <!-- Content on Right -->
            <div class="order-2 w-full md:w-5/12 md:pl-12 pointer-events-auto">
                ${cardHtml}
            </div>
            `
            }
      </div>
            `;
    });
    container.innerHTML = html;

    // Add Click Interaction
    const cards = document.querySelectorAll('.timeline-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
    });

    // Initialize Tilt Effect for these new cards
    initTiltEffect();

    // Animation State
    let progress = 0;

    function drawTree() {
        if (!ctx) return;
        const w = wrapper.offsetWidth; // Use WRAPPER measurements (covers full area)
        const h = wrapper.offsetHeight;

        // Sync canvas size if changed
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }

        const isDesktop = window.innerWidth >= 768;
        const centerX = isDesktop ? w / 2 : 20 + (isDesktop ? 0 : 32); // Adjust for padding if needed

        // Calculate Start Y from Green Bar
        const startBar = document.getElementById('timeline-start-bar');
        let startY = 0;
        if (startBar) {
            // Calculate relative position of the bar bottom within the wrapper
            const wrapperRect = wrapper.getBoundingClientRect();
            const barRect = startBar.getBoundingClientRect();
            startY = (barRect.bottom - wrapperRect.top);
        }

        if (window.matchMedia('(max-width: 768px)').matches) {
            ctx.clearRect(0, 0, w, h);
            return;
        }

        ctx.clearRect(0, 0, w, h);

        // Draw Trunk Base
        ctx.beginPath();
        ctx.moveTo(centerX, startY);

        ctx.shadowBlur = 0;
        ctx.save();
        ctx.strokeStyle = 'rgba(229, 249, 201, 0.03)';
        ctx.lineWidth = 1;
        ctx.lineTo(centerX, h);
        ctx.stroke();
        ctx.restore();

        // Draw Active Trunk
        ctx.beginPath();
        ctx.moveTo(centerX, startY);
        // Start drawing active trunk only if progress has reached startY visual proportion?
        // Actually, trunkHeight should be mapped from startY to h.
        // Simple linear interpolation: startY + (h - startY) * progress
        const trunkHeight = startY + ((h - startY) * progress);

        ctx.lineTo(centerX, trunkHeight);

        // Glow
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#22d3ee';
        ctx.strokeStyle = 'rgba(22, 211, 238, 0.3)';
        ctx.lineWidth = isDesktop ? 2 : 1.5;
        ctx.stroke();

        // Draw Branches
        const items = document.querySelectorAll('.timeline-item');
        const wrapperRect = wrapper.getBoundingClientRect(); // Canvas is relative to this

        items.forEach((item, i) => {
            const rect = item.getBoundingClientRect();

            // Dynamic center: item center relative to WRAPPER
            const itemCenterY = (rect.top - wrapperRect.top) + (rect.height / 2);

            const card = item.querySelector('.timeline-card');
            if (itemCenterY < trunkHeight + 100 && card) { // Allow slight overdraw for smooth reveal
                const cardRect = card.getBoundingClientRect();

                ctx.beginPath();
                ctx.moveTo(centerX, itemCenterY);

                const isLeft = i % 2 === 0;
                let targetX = centerX;

                if (isDesktop) {
                    // Connect exactly to the card's edge (relative to wrapper)
                    if (isLeft) {
                        targetX = (cardRect.right - wrapperRect.left) + 16;
                    } else {
                        targetX = (cardRect.left - wrapperRect.left) - 16;
                    }
                } else {
                    targetX = centerX + 24;
                }

                ctx.lineTo(targetX, itemCenterY);

                ctx.shadowBlur = 5;
                ctx.shadowColor = '#22d3ee';
                ctx.strokeStyle = 'rgba(22, 211, 238, 0.4)';
                ctx.stroke();

                // Node
                ctx.fillStyle = '#22d3ee';
                ctx.beginPath();
                ctx.arc(targetX, itemCenterY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    // Scroll Trigger
    ScrollTrigger.create({
        trigger: container,
        start: "top center",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
            progress = self.progress;
            // drawTree() is now called by ticker
        }
    });

    // VISIBILITY CULLING
    let isVisible = false;
    const observer = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
    }, { rootMargin: "200px" });
    observer.observe(container);

    // CONTINUOUS UPDATE LOOP
    // Optimized: Only draw if visible
    gsap.ticker.add(() => {
        if (isVisible && document.contains(container)) {
            drawTree();
        }
    });

    // Stagger Animations (Responsive)
    ScrollTrigger.matchMedia({
        // DESKTOP: Slide from LEFT (Synced with Header)
        "(min-width: 768px)": function () {
            const timelineItems = document.querySelectorAll('.timeline-card');

            // Individual Blur Reveal (User Request: "blur effect will be active for each cards(only that blur animation)")
            timelineItems.forEach(item => {
                // Ensure no conflicting transforms, only filters
                gsap.set(item, { filter: "blur(10px)", opacity: 0 });

                gsap.to(item, {
                    scrollTrigger: {
                        trigger: item,
                        start: "top 90%", // Individual trigger
                        end: "top 70%",
                        scrub: 0.5,
                        toggleActions: "play none none reverse"
                    },
                    opacity: 1,
                    filter: "blur(0px)",
                    duration: 1,
                    ease: "power2.out"
                });
            });
        },
        // MOBILE: Slide from BOTTOM (Standard)
        "(max-width: 767px)": function () {
            const timelineItems = document.querySelectorAll('.timeline-card');
            timelineItems.forEach(item => {
                // Ensure clear props
                gsap.set(item, { x: 0, rotationX: 10 });

                gsap.fromTo(item,
                    {
                        y: 50,
                        opacity: 0,
                        filter: "blur(10px)",
                        rotationX: 10
                    },
                    {
                        scrollTrigger: {
                            trigger: item,
                            start: "top 85%",
                            end: "top 65%",
                            toggleActions: "play none none reverse",
                            scrub: 0.5
                        },
                        y: 0,
                        opacity: 1,
                        filter: "blur(0px)",
                        rotationX: 0,
                        duration: 1,
                        ease: "power2.out"
                    }
                );
            });
        }
    });
}
