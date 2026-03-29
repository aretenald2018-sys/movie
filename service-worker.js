// Service Worker for 무코 영화 캘린더 PWA
// 오프라인 캐싱 및 성능 최적화

const CACHE_VERSION = 'muko-movie-v1.0';
const RUNTIME_CACHE = 'muko-movie-runtime';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './style.css',
  './service-worker.js'
];

// 설치 이벤트: 정적 자산 캐싱
self.addEventListener('install', (event) => {
  console.log('[SW] Install event fired');
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        // 일부 자산이 없을 수 있으므로 무시
        console.log('[SW] Some assets failed to cache (non-critical)');
      });
    }).then(() => {
      return self.skipWaiting(); // 즉시 활성화
    })
  );
});

// 활성화 이벤트: 구식 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event fired');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return self.clients.claim(); // 즉시 제어
    })
  );
});

// Fetch 이벤트: 네트워크 우선, 캐시 대체
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // POST, PUT, DELETE는 캐싱하지 않음
  if (request.method !== 'GET') {
    return;
  }

  // 영화 데이터 JSON 파일 (캐시 우선)
  if (url.pathname.includes('/data/movies/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          console.log('[SW] Serving from cache:', url.pathname);
          return cached;
        }
        // 캐시가 없으면 네트워크에서 가져오고 저장
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            console.log('[SW] Caching movie data:', url.pathname);
            cache.put(request, responseClone);
          });
          return response;
        }).catch(() => {
          // 네트워크 실패 시 캐시된 데이터 반환
          console.log('[SW] Network failed, trying fallback cache:', url.pathname);
          return caches.match(request);
        });
      })
    );
    return;
  }

  // HTML, CSS, JS (네트워크 우선)
  if (url.pathname.endsWith('.html') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname === '/' ||
      url.pathname === '') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseClone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            console.log('[SW] Caching static asset:', url.pathname);
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          console.log('[SW] Network failed, serving from cache:', url.pathname);
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            // 모든 캐시 실패 시 오프라인 페이지 반환
            if (request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
        })
    );
    return;
  }

  // 폰트, 이미지 등 (캐시 우선)
  if (url.pathname.includes('fonts.googleapis') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.ttf') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.gif')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            console.log('[SW] Caching asset:', url.pathname);
            cache.put(request, responseClone);
          });
          return response;
        }).catch(() => {
          return caches.match(request);
        });
      })
    );
    return;
  }

  // 기타 요청 (네트워크 우선)
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// 백그라운드 동기화 (필요시 영화 데이터 자동 갱신)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-movie-data') {
    event.waitUntil(
      // 모든 월의 영화 데이터 갱신 시도
      (async () => {
        const months = ['2026-03', '2026-04', '2026-05']; // 향후 3개월
        try {
          for (const month of months) {
            const url = `./data/movies/${month}.json`;
            const response = await fetch(url);
            if (response.ok) {
              const cache = await caches.open(RUNTIME_CACHE);
              await cache.put(url, response.clone());
              console.log(`[SW] Synced movie data: ${month}`);
            }
          }
        } catch (error) {
          console.error('[SW] Background sync failed:', error);
        }
      })()
    );
  }
});

// 주기적 백그라운드 동기화 (필요시 설정)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-movie-data') {
    event.waitUntil(
      (async () => {
        try {
          const months = ['2026-03', '2026-04', '2026-05'];
          for (const month of months) {
            const url = `./data/movies/${month}.json`;
            const response = await fetch(url);
            if (response.ok) {
              const cache = await caches.open(RUNTIME_CACHE);
              await cache.put(url, response.clone());
            }
          }
          console.log('[SW] Periodic sync completed');
        } catch (error) {
          console.error('[SW] Periodic sync failed:', error);
        }
      })()
    );
  }
});

// 메시지 처리 (클라이언트에서 보낸 메시지)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker script loaded');
