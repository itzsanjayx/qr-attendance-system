let scannedData = [];

// === SCAN QR CODE ===
function startScanner() {
  const video = document.createElement('video');
  const canvasElement = document.createElement('canvas');
  const canvas = canvasElement.getContext('2d');
  const outputDiv = document.createElement('div');

  document.getElementById('scanner-area').innerHTML = '';
  document.getElementById('scanner-area').appendChild(video);
  document.getElementById('scanner-area').appendChild(outputDiv);

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then((stream) => {
      video.srcObject = stream;
      video.setAttribute('playsinline', true); 
      video.play();
      requestAnimationFrame(tick);
    })
    .catch(err => {
      alert('Camera access denied or unavailable: ' + err);
    });

  function tick() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

      const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });

      if (code) {
        const time = new Date().toLocaleString();
        scannedData.push({ text: code.data, time });
        outputDiv.innerHTML = `<p><strong>Scanned:</strong> ${code.data}</p><p>Time: ${time}</p>`;
        video.srcObject.getTracks().forEach(track => track.stop()); // stop after scan
      } else {
        requestAnimationFrame(tick);
      }
    } else {
      requestAnimationFrame(tick);
    }
  }
}

// === GENERATE QR CODE ===
function generateQRCode() {
  const qrText = document.getElementById('qrText').value.trim();
  const qrContainer = document.getElementById('qrcode');
  const downloadLink = document.getElementById('downloadQR');

  qrContainer.innerHTML = '';
  downloadLink.style.display = 'none';

  if (!qrText) {
    alert('Please enter text to generate QR code!');
    return;
  }

  QRCode.toCanvas(qrText, { width: 200 }, function (err, canvas) {
    if (err) {
      alert('Error generating QR code');
      return;
    }
    qrContainer.appendChild(canvas);

    // Allow QR download
    const dataURL = canvas.toDataURL();
    downloadLink.href = dataURL;
    downloadLink.style.display = 'inline-block';
    downloadLink.textContent = 'Download QR';
  });
}

// === DOWNLOAD ATTENDANCE LIST ===
function downloadAttendance() {
  if (scannedData.length === 0) {
    alert('No attendance data to download.');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Name/Code,Time\n";
  scannedData.forEach(row => {
    csvContent += `${row.text},${row.time}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'attendance_list.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
