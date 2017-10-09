import React from 'react';
import Recorder from './Recorder';

export default class App extends React.Component {
  render() {
    return (
      <div id="timecapsule">
        <Recorder />
        <div>
          <input type="email" id="email" placeholder="Email" />
          <input type="date" id="sendAt" placeholder="Date to Send On" />
        </div>
        <div>
          <button id="record" disabled>Record</button>
          <button id="upload">Upload</button>
        </div>
      </div>
    );
  }
}
