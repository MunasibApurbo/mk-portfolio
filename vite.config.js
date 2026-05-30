import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
    base: './',
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'S M Monowar Kayser | Multimedia Designer',
                short_name: 'MK Portfolio',
                description: 'Portfolio of S M Monowar Kayser',
                theme_color: '#020617',
                icons: [
                    {
                        src: 'logo.webp',
                        sizes: '192x192',
                        type: 'image/webp'
                    },
                    {
                        src: 'logo.webp',
                        sizes: '512x512',
                        type: 'image/webp'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,webmanifest}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts',
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },

                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif)$/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'images',
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            }
        })
    ],
    server: {
        host: true,
        allowedHosts: [
            'localhost',
            '127.0.0.1'
        ]
    },
    build: {
        minify: 'esbuild',
        target: 'esnext',
        chunkSizeWarningLimit: 1000,
        esbuild: {
            drop: ['console', 'debugger'],
        },
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                not_found: resolve(__dirname, '404.html')
            },
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/three')) {
                        return 'vendor-three';
                    }
                    if (id.includes('node_modules/gsap')) {
                        return 'vendor-gsap';
                    }
                    if (id.includes('@studio-freight/lenis')) {
                        return 'vendor-lenis';
                    }
                    // Heavy 3D scenes as separate chunks
                    if (id.includes('rover-scene')) {
                        return 'scene-rover';
                    }
                    if (id.includes('teaching-areas')) {
                        return 'scene-teaching';
                    }
                    if (id.includes('awards-particles')) {
                        return 'scene-awards';
                    }
                }
            }
        }
    }
});
