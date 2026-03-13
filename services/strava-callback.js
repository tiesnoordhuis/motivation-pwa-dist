import { StravaService } from './strava.service.js';
/**
 * Check if the current URL has a Strava OAuth callback code.
 * If so, exchange it for tokens and clean up the URL.
 */
export function handleStravaOAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const scope = params.get('scope');
    // Only act on Strava callbacks (has code + scope containing 'activity')
    if (!code || !scope?.includes('activity'))
        return;
    // Clean the URL immediately so it doesn't linger
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', cleanUrl);
    // Exchange the code in the background
    StravaService.exchangeCode(code)
        .then(() => {
        console.log('Strava connected successfully');
        // Dispatch event so the status pill can update
        window.dispatchEvent(new CustomEvent('strava-connected'));
    })
        .catch((err) => {
        console.error('Failed to exchange Strava code:', err);
        window.dispatchEvent(new CustomEvent('strava-connection-failed', { detail: err.message }));
    });
}
