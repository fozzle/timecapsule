import adapter from 'webrtc-adapter';

async function getMedia() {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  } catch (e) {
    console.error('Error fetching streams', e);
  }

  return stream;
}

(async function() {
  let chunks = [];
  const stream = await getMedia();
  const targetVideo = document.querySelector('#targetVideo');
  const recordedVideo = document.querySelector('#recordedVideo');
  const recordButton = document.querySelector('#record');
  const uploadButton = document.querySelector('#upload');
  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.addEventListener('dataavailable', (e) => {
    console.log('pushed data');
    chunks.push(e.data);
  });

  recordButton.addEventListener('click', () => {
    if (mediaRecorder.state !== 'recording') {
      chunks = [];
      mediaRecorder.start(10);
      recordButton.textContent = 'Stop';
    } else {
      mediaRecorder.stop();
      recordButton.textContent = 'Record';

      const combinedBuffer = new Blob(chunks, { type: 'video/webm' });
      recordedVideo.src = window.URL.createObjectURL(combinedBuffer);
      recordedVideo.play();
    }
  });

  uploadButton.addEventListener('click', () => {
    const combinedBuffer = new Blob(chunks, { type: 'video/webm' });

    const formData = new FormData();
    formData.append('media', combinedBuffer);

    const fetchOptions = {
      method: 'POST',
      body: formData,
    };

    fetch('/upload', fetchOptions)
      .then(() => {
        console.log('POSTED OK');
      })
      .catch((err) => {
        console.error('ERROR:', err);
      });

  });


  targetVideo.srcObject = stream;
  targetVideo.onloadedmetadata = () => targetVideo.play();
})();
