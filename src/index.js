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
  const emailField = document.querySelector('#email');
  const sendAtField = document.querySelector('#sendAt');
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

  uploadButton.addEventListener('click', async function() {
    const combinedBuffer = new Blob(chunks, { type: 'video/webm' });

    const formData = new FormData();
    formData.append('media', combinedBuffer);

    const email = emailField.value;
    const sendAt = sendAtField.value;

    if (!email || !sendAt) {
      return console.error('MISSING REQUIRED FIELDS');
    }

    const initiateFetchOptions = {
      method: 'POST',
      body: JSON.stringify({
        email,
        sendAt
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const putFetchOptions = {
      method: 'PUT',
      body: combinedBuffer,
      headers: {
        'Content-Length': combinedBuffer.size,
        'Content-Type': 'video/webm',
      },
    };

    // Get the resumable upload URL first
    try {
      const urlResp = await fetch('https://us-central1-timecapsule-174619.cloudfunctions.net/getSignedURL', initiateFetchOptions);
      const { putURL } = await urlResp.json();
      console.log('put url', putURL);
      const putResp = await fetch(putURL, putFetchOptions);
    } catch (err) {
      console.error('Error', err);
    }

    console.log('Finished putting');
  });


  targetVideo.srcObject = stream;
  targetVideo.onloadedmetadata = () => targetVideo.play();
})();
