/* eslint-env browser */
/* global hash */

// eslint-disable-next-line no-unused-vars
// fingerprint.js

async function fingerprint() {

    const components = [];

    // --- Vector 1: Canvas Fingerprint ---
    function getCanvasFingerprint() {
        const canvas = document.createElement('canvas');
        canvas.width = 280;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.font = '11pt Arial';
        ctx.fillText('Browser fingerprint 🔒', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.font = '18pt Arial';
        ctx.fillText('Browser fingerprint 🔒', 4, 45);
        console.log(ctx);
        console.log(canvas.toDataURL());
        return canvas.toDataURL();
    }

    async function canvasTest() {
  function getHash() {
    const c = document.createElement("canvas");
    c.width = 300;
    c.height = 80;
    const ctx = c.getContext("2d");

    ctx.textBaseline = "top";
    ctx.font = "16px Arial";
    ctx.fillText("fingerprint test 🔒 123", 10, 10);

    const data = c.toDataURL();

    return crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(data)
    ).then(buf =>
      [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("")
    );
  }

  const results = [];

  for (let i = 0; i < 5; i++) {
    results.push(await getHash());
  }

  console.log(results);
  console.log("unique:", new Set(results).size);
}

canvasTest();

function jitter() {
  const samples = [];

  for (let i = 0; i < 50; i++) {
    const t = performance.now();
    for (let j = 0; j < 1e6; j++) {}
    samples.push(performance.now() - t);
  }

  const variance =
    samples.reduce((a, b) => a + b, 0) / samples.length;

  console.log("variance:", variance);
  console.log(samples);
}
jitter();
    // --- Vector 2: WebGL Fingerprint ---
    function getWebGLFingerprint() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'no-webgl';
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
        const params = [
            gl.getParameter(gl.MAX_TEXTURE_SIZE),
            gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
            gl.getParameter(gl.MAX_VARYING_VECTORS),
            gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
            gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE).toString(),
        ];
        const pixels = new Uint8Array(10);
gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

console.log("pixels: " +pixels);
        
        console.log("Max texture size:" + params[0]);
        console.log("Max vertex atribs size:" + params[1]);
        console.log("Max varying vectors:" + params[2]);
        console.log("Max fragment uniform vectors:" + params[3]);
        console.log("aliased line width range:" + params[4]);
        console.log("vendor:" + vendor);
        console.log("renderer:" + renderer);
        return `${vendor}~${renderer}~${params.join(',')}`;
    }

    // --- Vector 3: Audio Fingerprint ---
    async function getAudioFingerprint() {
        return new Promise((resolve) => {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return resolve('no-audio');
                const ctx = new AudioContext();
                const oscillator = ctx.createOscillator();
                const analyser = ctx.createAnalyser();
                const gain = ctx.createGain();
                const scriptProcessor = ctx.createScriptProcessor(4096, 1, 1);

                gain.gain.value = 0; // silent
                oscillator.type = 'triangle';
                oscillator.frequency.value = 10000;

                oscillator.connect(analyser);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(gain);
                gain.connect(ctx.destination);

                scriptProcessor.onaudioprocess = (e) => {
                    const samples = e.inputBuffer.getChannelData(0);
                       console.log("RAW samples:", samples);
                    let sum = 0;
                    for (let i = 0; i < samples.length; i++) {
                        sum += Math.abs(samples[i]);
                    }
                      console.log("SUM fingerprint:", sum);
                    scriptProcessor.disconnect();
                    oscillator.disconnect();
                    ctx.close();
                    resolve(sum.toString());
                };

                oscillator.start(0);
                setTimeout(() => resolve('audio-timeout'), 1000);
            } catch (e) {
                resolve('audio-error');
            }
        });
    }

    // --- Vector 4: Hardware & Screen ---
    function getHardwareFingerprint() {
         console.log("screen width" + screen.width);
            console.log("screen height" + screen.height);
            console.log("screen colorDeapth"+ screen.colorDepth);
            console.log("screen pixelDepth"+ screen.pixelDepth);
            console.log("device pixel ratiot"+ window.devicePixelRatio || 1);
           console.log("hardware concurrency"+ navigator.hardwareConcurrency || 'unknown');
            console.log("device memory"+ navigator.deviceMemory || 'unknown');
        return [
            screen.width,
            screen.height,
            screen.colorDepth,
            screen.pixelDepth,
            window.devicePixelRatio || 1,
            navigator.hardwareConcurrency || 'unknown',
            navigator.deviceMemory || 'unknown',
        ].join('|');
    }

    // --- Vector 5: Timezone + Language ---
    function getLocaleFingerprint() {
        console.log("timezone" + Intl.DateTimeFormat().resolvedOptions().timeZone);
              console.log("lang"+ navigator.language);
              console.log("langs"+ navigator.languages ? navigator.languages.join(',') : '');
               console.log("timezone offset"+new Date().getTimezoneOffset());
        return [
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            navigator.language,
            navigator.languages ? navigator.languages.join(',') : '',
            new Date().getTimezoneOffset(),
        ].join('|');
    }

    // --- Collect all vectors ---
    components.push(getCanvasFingerprint());
    components.push(getWebGLFingerprint());
    components.push(await getAudioFingerprint());
    components.push(getHardwareFingerprint());
    components.push(getLocaleFingerprint());

    // --- Hash all components together ---
    const raw = components.join('###');
    const msgBuffer = new TextEncoder().encode(raw);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}