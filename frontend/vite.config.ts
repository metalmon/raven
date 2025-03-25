import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react"
import proxyOptions from "./proxyOptions";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa"

/// <reference types="vite-plugin-svgr/client" />
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), "")
	return {
		plugins: [react(), svgr(), VitePWA({
			registerType: "autoUpdate",
			strategies: "generateSW",
			injectRegister: "auto",
			devOptions: {
				enabled: true,
				type: "module"
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,json}'],
				navigateFallbackDenylist: [/^\/assets\/.*$/, /^\/api/, /^\/raven/],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif)$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'raven-images-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
							}
						}
					},
					{
						urlPattern: /^https:\/\/.*\.(css|js)$/,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'raven-assets-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
							}
						}
					},
					{
						urlPattern: /^https:\/\/.*\/(api|raven)/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'raven-api-cache',
							networkTimeoutSeconds: 10,
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 24 * 60 * 60 // 24 hours
							}
						}
					}
				],
				navigateFallback: `/${env.VITE_BASE_NAME}/`,
				skipWaiting: true,
				clientsClaim: true,
				cleanupOutdatedCaches: true
			},
			manifest: {
				name: "Raven",
				short_name: "Raven",
				start_url: `/${env.VITE_BASE_NAME}/`,
				display: "standalone",
				background_color: "#ffffff",
				theme_color: "#ffffff",
				description: "Simple, work messaging tool.",
				lang: "en",
				scope: `/${env.VITE_BASE_NAME}/`,
				orientation: "any",
				categories: ["productivity", "communication"],
				icons: [
					{
						src: "/assets/raven/manifest/android-chrome-192x192.png",
						sizes: "192x192",
						type: "image/png"
					},
					{
						src: "/assets/raven/manifest/android-chrome-512x512.png",
						sizes: "512x512",
						type: "image/png"
					},
					{
						src: "/assets/raven/manifest/apple-touch-icon.png",
						sizes: "180x180",
						type: "image/png"
					},
					{
						src: "/assets/raven/manifest/favicon-16x16.png",
						sizes: "16x16",
						type: "image/png"
					},
					{
						src: "/assets/raven/manifest/favicon-32x32.png",
						sizes: "32x32",
						type: "image/png"
					},
					{
						src: "/assets/raven/manifest/favicon.ico",
						sizes: "64x64 32x32 24x24 16x16",
						type: "image/x-icon"
					}
				],
				id: `/${env.VITE_BASE_NAME}/`,
				dir: "ltr",
				prefer_related_applications: false,
				display_override: ["window-controls-overlay"]
			},
			includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
			manifestFilename: 'manifest.json'
		})],
		server: {
			port: 8080,
			proxy: proxyOptions
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src")
			}
		},
		build: {
			outDir: "../raven/public/raven",
			emptyOutDir: true,
			target: "es2015",
			sourcemap: true,
			commonjsOptions: {
				include: [/tailwind.config.js/, /node_modules/],
			},
			rollupOptions: {
				onwarn(warning, warn) {
					if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
						return
					}
					warn(warning)
				}
			}
		},
		optimizeDeps: {
			include: [
				'react',
				'react-dom',
				'@emotion/react',
				'@emotion/styled',
				'@mui/material',
				'@mui/icons-material'
			]
		}
	};
});
