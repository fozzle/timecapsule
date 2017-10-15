import React from 'react';
import Recorder from './Recorder';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = { recordedVideo: null, uploading: false };
  }
  render() {
    return (
      <div id="timecapsule">
        <h1 style={{ textAlign: 'center', margin: '16px 0' }} component="h1">Video Timecapsule</h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Recorder onRecordingStateChange={(recordedVideo) => this.setState({ recordedVideo })} />
        </div>
        <div className="container">
          <h2 style={{ textAlign: 'center', margin: '16px 0' }}>FAQ</h2>
          <div className="columns">
            <div className="column col-md-12">
              <h3>How?</h3>
              <p>After granting camera and microphone permissions to the website, click on the video to start recording. Click on the video again to stop recording. You will then be able to choose to redo or upload.</p>
              <p>Your recorded video is then uploaded to the cloud and cannot be viewed until the date you specify (and even then, only via a specific link that cannot be guessed by anyone else).</p>
              <p>On the date you specify, the video will be "unlocked" and viewable for 30 days. You will receive an email with a link to watch the video, and of course download it too.</p>
            </div>
            <div className="column col-md-12">
              <h3>Why?</h3>
              <p>To put it succinctly: I just think the "timecapsule" concept is pretty fun!</p>
              <p>When I was in highschool I wrote a letter during freshman year to be opened on graduation. Forgetting about it and reading it 4 years later, it was a trip to see what had changed in my life, what hadn't changed in my life, and the all the changes that had happened in the years between.</p>
              <p>Since then I've journaled in the form of writing to myself. I will often forget about these musings and find them years later. They are always a joy to re-read (and terribly embarassing, but in an endearing way I think).</p>
              <p>I thought it would be fun to move this accidental timecapsule behavior to an easy to use website. A way to quickly record a message to myself on a whim and have it removed from my grasp until some set time in the future. By putting in the cloud, the hope is that it will be resilient to failures, drive wipes, over-zealous disk cleanup, planned obscelecence, or whatever other ravages of time we subject our data to.</p>
            </div>
            <div className="column col-md-12">
              <h3>Anything Else?</h3>
              <p>I will keep this up for a mininum of 5 years. Whether that will be extended will be determined by the project's usage.</p>
              <p>Bug reports / feedback can go to <a href="https://github.com/fozzle/timecapsule/">Github</a> or <a href="https://twitter.com/xn9q8h">Twitter</a>.</p>
              <p>Once a timecapsule is uploaded, it cannot be removed. If you can't bear to see it when it arrives I suggest trashing the email because then it will truly be lost.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
