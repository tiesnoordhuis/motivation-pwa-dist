"use strict";
const CACHE_NAME = 'motivation-pwa-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './manifest.json'
];
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install');
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
        console.log('[Service Worker] Caching all: app shell and content');
        return cache.addAll(ASSETS_TO_CACHE);
    }));
});
self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request).then((response) => {
        return response || fetch(event.request);
    }));
});
