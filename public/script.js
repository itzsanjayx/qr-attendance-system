// Start QR Scanner
function startScanner() {
  const video = document.createElement('video');
  const canvasElement = document.createElement('canvas');
  const canvas = canvasElement.getContext('2d');
  const outputDiv = document.createElement('div');

  document.body.innerHTML = `
    <h1>QR Code Scanner</h1>
    <div id="scanner-area"></div>
  `;
  document.getElementById('scanner-area').appendChild(video);
  document.getElementById('scanner-area').appendChild(outputDiv);

  // Use the device camera
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then((stream) => {
      video.srcObject = stream;
      video.setAttribute('playsinline', true); // Required for iPhone
      video.play();
      requestAnimationFrame(tick);
    })
    .catch(err => {
      alert('Camera access denied or not available: ' + err);
    });

  // Load QR Scanner
  function tick() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

      const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });

      if (code) {
        outputDiv.innerHTML = `<p><strong>QR Code Data:</strong> ${code.data}</p>`;
        video.srcObject.getTracks().forEach(track => track.stop()); // Stop camera after scanning
      } else {
        requestAnimationFrame(tick);
      }
    } else {
      requestAnimationFrame(tick);
    }
  }
}
