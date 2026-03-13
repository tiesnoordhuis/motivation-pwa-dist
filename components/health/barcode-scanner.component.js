import styles from './barcode-scanner.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div class="scanner-container">
        <div id="permission-prompt" class="permission-prompt">
            <p>📷 Camera access is needed to scan barcodes</p>
            <button id="start-btn">Start Camera</button>
        </div>

        <div id="video-section" style="display:none">
            <div class="video-wrapper">
                <video id="video" autoplay playsinline muted></video>
                <div class="scan-overlay"><div class="scan-line"></div></div>
            </div>
            <button class="btn-stop" id="stop-btn">Stop Camera</button>
        </div>

        <div id="status" class="status"></div>
        <div id="detected" class="detected-barcode" style="display:none"></div>

        <div id="fallback" style="display:none">
            <p class="status">BarcodeDetector not available — enter barcode manually:</p>
            <div class="manual-entry">
                <input type="text" id="manual-input" placeholder="Enter barcode number" inputmode="numeric" pattern="[0-9]*">
                <button id="manual-btn">Look up</button>
            </div>
        </div>
    </div>
`;
export class BarcodeScanner extends HTMLElement {
    _stream = null;
    _scanning = false;
    _animationFrameId = null;
    _onBarcodeDetected = null;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        const shadow = this.shadowRoot;
        shadow.getElementById('start-btn').addEventListener('click', () => this.startCamera());
        shadow.getElementById('stop-btn').addEventListener('click', () => this.stopCamera());
        shadow.getElementById('manual-btn').addEventListener('click', () => this.handleManualEntry());
        const manualInput = shadow.getElementById('manual-input');
        manualInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter')
                this.handleManualEntry();
        });
        // Auto-start camera if BarcodeDetector is available, otherwise show fallback
        if ('BarcodeDetector' in window) {
            this.startCamera();
        }
        else {
            shadow.getElementById('permission-prompt').style.display = 'none';
            shadow.getElementById('fallback').style.display = '';
        }
    }
    disconnectedCallback() {
        this.stopCamera();
    }
    set onBarcodeDetected(handler) {
        this._onBarcodeDetected = handler;
    }
    setStatus(message, type = '') {
        const el = this.shadowRoot.getElementById('status');
        el.textContent = message;
        el.className = `status${type ? ` ${type}` : ''}`;
    }
    async startCamera() {
        const shadow = this.shadowRoot;
        try {
            this._stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            const video = shadow.getElementById('video');
            video.srcObject = this._stream;
            await video.play();
            shadow.getElementById('permission-prompt').style.display = 'none';
            shadow.getElementById('video-section').style.display = '';
            this.setStatus('Scanning…');
            this._scanning = true;
            this.scanLoop(video);
        }
        catch (err) {
            if (err.name === 'NotAllowedError') {
                this.setStatus('Camera permission denied. Please allow camera access in browser settings.', 'error');
            }
            else {
                this.setStatus(`Camera error: ${err.message}`, 'error');
            }
            // Show manual fallback
            shadow.getElementById('fallback').style.display = '';
        }
    }
    stopCamera() {
        this._scanning = false;
        if (this._animationFrameId != null) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }
        if (this._stream) {
            for (const track of this._stream.getTracks()) {
                track.stop();
            }
            this._stream = null;
        }
        const shadow = this.shadowRoot;
        if (shadow) {
            shadow.getElementById('video-section').style.display = 'none';
            shadow.getElementById('permission-prompt').style.display = '';
        }
    }
    async scanLoop(video) {
        if (!this._scanning || !('BarcodeDetector' in window))
            return;
        const detector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'],
        });
        const tick = async () => {
            if (!this._scanning)
                return;
            try {
                const barcodes = await detector.detect(video);
                if (barcodes.length > 0) {
                    const barcode = barcodes[0].rawValue;
                    this.onDetected(barcode);
                    return; // Stop scanning after detection
                }
            }
            catch {
                // Detection can fail on empty frames, just continue
            }
            this._animationFrameId = requestAnimationFrame(tick);
        };
        this._animationFrameId = requestAnimationFrame(tick);
    }
    onDetected(barcode) {
        // Vibrate on detection
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        const shadow = this.shadowRoot;
        const detected = shadow.getElementById('detected');
        detected.textContent = `Barcode: ${barcode}`;
        detected.style.display = '';
        this.setStatus('Product found!', 'success');
        this.stopCamera();
        if (this._onBarcodeDetected) {
            this._onBarcodeDetected(barcode);
        }
    }
    handleManualEntry() {
        const input = this.shadowRoot.getElementById('manual-input');
        const value = input.value.trim();
        if (!value) {
            this.setStatus('Please enter a barcode number', 'error');
            return;
        }
        this.onDetected(value);
    }
    /** Reset scanner to initial state */
    reset() {
        this.stopCamera();
        const shadow = this.shadowRoot;
        shadow.getElementById('detected').style.display = 'none';
        this.setStatus('');
        if (!('BarcodeDetector' in window)) {
            shadow.getElementById('permission-prompt').style.display = 'none';
            shadow.getElementById('fallback').style.display = '';
        }
        else {
            shadow.getElementById('permission-prompt').style.display = '';
            shadow.getElementById('fallback').style.display = 'none';
        }
        const input = shadow.getElementById('manual-input');
        input.value = '';
    }
}
customElements.define('barcode-scanner', BarcodeScanner);
