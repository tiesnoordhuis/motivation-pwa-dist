export const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_URL = isLocal
    ? 'http://localhost:3001'
    : 'http://192.168.178.170:3000';
/**
 * Pi gateway — always-on Raspberry Pi at a fixed LAN IP.
 * CORS: the Pi server allows requests from the origins below.
 * Keep in sync with ALLOWED_ORIGINS in server.js on the Pi.
 * See docs/guides/pi-gateway-server.md for details.
 *
 * Allowed origins:
 *   - https://motivation.tiesnoordhuis.nl  (production)
 *   - http://localhost:8080                (local dev — npx http-server)
 */
export const PI_GATEWAY_URL = 'http://192.168.178.18:3000';
