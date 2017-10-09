import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <App />,
  document.getElementById('app')
)

const API_ENDPOINT = 'https://us-central1-timecapsule-174619.cloudfunctions.net/getSignedURL';

// Set min field based on today
// sendAtField.min = `${now.getUTCFullYear()}-${month}-${date}`;
//
// uploadButton.addEventListener('click', async function() {
  // const combinedBuffer = new Blob(chunks, { type: 'video/webm' });
//
  // const formData = new FormData();
  // formData.append('media', combinedBuffer);
//
  // const email = emailField.value;
  // const sendAt = sendAtField.value;
//
  // if (!email || !sendAt) {
    // return console.error('MISSING REQUIRED FIELDS');
  // }
//
  // const initiateFetchOptions = {
    // method: 'POST',
    // body: JSON.stringify({
      // email,
      // sendAt
    // }),
    // headers: {
      // 'Content-Type': 'application/json',
    // }
  // };
//
  // const putFetchOptions = {
    // method: 'PUT',
    // body: combinedBuffer,
    // headers: {
      // 'Content-Length': combinedBuffer.size,
      // 'Content-Type': 'video/webm',
    // },
  // };
//
  // try {
    // const urlResp = await fetch(API_ENDPOINT, initiateFetchOptions);
    // const { putURL } = await urlResp.json();
    // console.log('put url', putURL);
    // const putResp = await fetch(putURL, putFetchOptions);
  // } catch (err) {
    // console.error('Error', err);
  // }
//
  // console.log('Finished putting');
// });
//
