import React from 'react';
import Recorder from './Recorder';
import Uploader from './Uploader';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recordedData: null,
      uploading: false,
      recorderVisible: false,
    };
  }

  reset() {
    this.setState({ recordedData: null, uploading: false });
  }

  render() {
    const showRecorderDiv = (
      <div
        className="text-center"
        style={{
          border: '3px dashed gray',
          color: 'gray',
          width: '40vw',
          padding: '16px',
          borderRadius: '4px',
        }}
      >
        <p>
          We will need access to your camera and microphone.
        </p>
        <button className="btn btn-lg" onClick={() => this.setState({ recorderVisible: true })}>
          <i className="material-icons mr-2" style={{ verticalAlign: 'bottom' }}>perm_camera_mic</i>Start
        </button>
      </div>
    );
    return (
      <div id="timecapsule">
        <h1 style={{ margin: '16px 0' }} className="text-center" component="h1">Timelock Video</h1>
        {!window.MediaRecorder ?
          <div className="toast toast-error m-2">
            Sorry, your browser doesn&lsquote;t support video recording. Try using Firefox or Chrome.
          </div> : null}
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          {this.state.recorderVisible ? <Recorder
            recordedData={this.state.recordedData}
            onRecordingStateChange={recordedData => this.setState({ recordedData })}
          /> : showRecorderDiv}
          {this.state.recordedData && this.state.uploading !== 'uploaded' ? <Uploader
            onResetClick={() => this.reset()}
            recordedVideo={this.state.recordedData}
            onUploadingStateChange={uploading => this.setState({ uploading })}
          /> : null}
          {this.state.uploading === 'uploaded' ?
            <div style={{ textAlign: 'center' }}>
              <h3><i className="material-icons" style={{ marginRight: '16px', verticalAlign: 'middle' }}>check</i> It&lsquo;s sealed! See you in the future?</h3>
              <button className="btn" type="button" onClick={() => this.reset()}>
                <i className="material-icons" style={{ marginRight: '16px', verticalAlign: 'middle' }}>clear</i>Start Over
              </button>
            </div> : null}
        </div>
        <div className="container">
          <h2 className="text-center" style={{ margin: '16px 0' }}>Send a Video To Your Future Self</h2>
          <div className="columns">
            <div className="column col-md-12">
              <h4 className="text-center">Step 1</h4>
              <p className="h5">After allowing us access to your camera, record the video.</p>
            </div>
            <div className="column col-md-12">
              <h4 className="text-center">Step 2</h4>
              <p className="h5">Review the recording, or don&lsquo;t. :) In any case, fill out your email and a date in the future to send it.</p>
            </div>
            <div className="column col-md-12">
              <h4 className="text-center">Step 3</h4>
              <p className="h5">Wait! Your video will be inaccessible until the date you specified, upon which you&lsquo;ll receive an email.</p>
            </div>
          </div>
          <h2 style={{ textAlign: 'center', margin: '16px 0' }}>FAQ</h2>
          <dl>
            <dt>Why?</dt>
            <dd>
              <p>I just think the &ldquo;timecapsule&rdquo; concept is pretty fun!</p>
              <p>When I was in highschool I wrote a letter during freshman year to be opened on graduation. Forgetting about it and reading it 4 years later, it was a trip to see what was important to me back then, what had changed, what hadn&lsquo;t...</p>
              <p>Since then I&lsquo;ve journaled in the form of writing to myself. I will often forget about these musings and find them years later. They are always a joy to re-read (and terribly embarassing, but in an endearing way I think).</p>
              <p>I thought it would be fun to move this accidental timecapsule behavior to an easy to use website. A way to quickly record a message to myself on a whim and have it removed from my grasp until some set time in the future. By putting in the cloud, the hope is that it will be resilient to failures, drive wipes, over-zealous disk cleanup, planned obscelecence, or whatever other ravages of time we subject our data to.</p>
            </dd>
            <dt>How far in the future can I set the date?</dt>
            <dd>
              <p>I vow to keep this up for a minimum of 5 years. Whether that will be extended will be determined by the project&lsquo;s usage.</p>
            </dd>
            <dt>Can I delete a previously recorded timecapsule?</dt>
            <dd>
              <p>Once a timecapsule is uploaded, it cannot be removed. If you can&lsquo;t bear to see it when it arrives I suggest trashing the email because then it will truly be lost.</p>
            </dd>
            <dt>I found a bug?</dt>
            <dd>
              <p>Bug reports / feedback can go to <a href="https://github.com/fozzle/timecapsule/">Github</a>.</p>
            </dd>
          </dl>
        </div>
      </div>
    );
  }
}
