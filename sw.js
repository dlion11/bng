const cacheName = 'offline-cache-v0.1.4'
const cacheUrls = ['index.html', 'app.js', 'lib.js', 'styles.css', 'favicon.png']

// Installing the Service Worker
self.addEventListener('install', async event => {
	try {
		const cache = await caches.open(cacheName)
		await cache.addAll(cacheUrls)
	} catch (error) {
		console.error('Service Worker installation failed: ', error)
	}
})

// Fetching resources
self.addEventListener('fetch', event => {
	event.respondWith(
		(async () => {
			const cache = await caches.open(cacheName)

			try {
				const cachedResponse = await cache.match(event.request)
				if (cachedResponse) {
					console.log('cachedResponse: ', event.request.url)
					return cachedResponse
				}

				const fetchResponse = await fetch(event.request)
				if (fetchResponse) {
					console.log('fetchResponse: ', event.request.url)
					await cache.put(event.request, fetchResponse.clone())
					return fetchResponse
				}
			} catch (error) {
				console.log('Fetch failed: ', error)
				const cachedResponse = await cache.match('index.html')
				return cachedResponse
			}
		})(),
	)
})

// const cacheName = 'links-cache-v1'
// const cacheUrls = ['index.html', 'favicon.png']

// // Installing the Service Worker
// self.addEventListener('install', async () => {
// 	try {
// 		const cache = await caches.open(cacheName)

// 		console.log('Service Worker: Caching files...')
// 		await cache.addAll(cacheUrls)

// 		self.skipWaiting()
// 	} catch (error) {
// 		console.error('Service Worker: Installation failed:', error)
// 	}
// })

self.addEventListener('activate', e => {
	console.log('Service Worker: Activated')

	// Removing unwanted caches
	e.waitUntil(
		caches.keys().then(cacheName => {
			return Promise.all(
				cacheName.map(cache => {
					if (cache !== cacheName) {
						console.log('Service worker: Clear old caches')
						return caches.delete(cache)
					}
				}),
			)
		}),
	)
})

// self.addEventListener('fetch', e => {
// 	console.log('Service worker: Fetching')
// 	//checking if the live site is avaialble and if not, respond with the cache site
// 	e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
// })
