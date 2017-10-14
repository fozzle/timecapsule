import 'webrtc-adapter';
import React from 'react';
import Uploader from './Uploader';

export default class Recorder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recording: false,
      recordedData: null,
      uploading: false,
      recordedVideo: null,
    };
  }

  componentDidMount() {
    this.initMediaRecorder();
  }

  async getMedia() {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch (e) {
      console.error('Error fetching streams', e);
    }

    this.setState({ stream, streamSrc: window.URL.createObjectURL(stream) });

    return stream;
  }

  async initMediaRecorder() {
    const stream = await this.getMedia();

    console.log('got stream', stream);
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.addEventListener('dataavailable', (e) => {
      this.chunks.push(e.data);
    });
  }

  resetState() {
    this.setState({ recording: false, recordedData: null, recordedVideo: null });
  }

  toggleRecording() {
    if (!this.state.recording) {
      this.chunks = [];
      this.mediaRecorder.start(10);
      this.setState({ recordedData: null, recording: true, recordedVideo: null });
      if (this.props.onRecordingStateChange) this.props.onRecordingStateChange(null);
    } else {
      this.mediaRecorder.stop();

      // need to provide combined buffer to the uploader
      const recordedData = new Blob(this.chunks, { type: 'video/webm' });
      this.setState({ recordedData, recording: false, recordedVideo: window.URL.createObjectURL(recordedData) });
      if (this.props.onRecordingStateChange) this.props.onRecordingStateChange(recordedData);
    }
  }

  render() {
    const hasRecording = Boolean(this.state.recordedData);

    /* Overlay shown:
      1.) Initial load (not recording, no data)
      2.) hover while recording
      3.) hover when complete
      4.) In upload form mode
    */
    const showOverlay = (!hasRecording && !this.state.recording) ||
      (this.state.hovered);
    return (
      <div
        className="recorder"
        style={{ height: '80vh', position: 'relative' }}
        onMouseEnter={() => this.setState({ hovered: true })}
        onMouseLeave={() => this.setState({ hovered: false })}
      >
        {showOverlay ? <div
          style={{
            position: 'absolute',
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
        >
          {/* Initial recording toggle */}
          {!hasRecording && !this.state.recording ? <button
            style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              width: '100%',
              height: '100%',
              cursor: 'pointer',
            }}
            onClick={() => this.toggleRecording()}
          >
            <div>
              <i className="material-icons md-48">videocam</i>
            </div>
            Lookin' good? Click to start recording.
          </button> : null}
          {/* During recording toggle */}
          {this.state.recording ? <button
            style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              width: '100%',
              height: '100%',
              cursor: 'pointer',
            }}
            onClick={() => this.toggleRecording()}
          >
            <div>
              <i className="material-icons md-48">stop</i>
            </div>
            Stop Recording
          </button> : null}
          {/* Recording finished buttons (Reset, Show Upload Form) */}
          {hasRecording && !this.state.recording ? <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Uploader onResetClick={() => this.resetState()} recordedVideo={this.state.recordedData} onUploadingStateChange={(uploading) => this.setState({ uploading })} />
          </div> : null}
        </div> : null}
        <video
          style={{ height: '100%', objectFit: 'initial' }}
          muted={!hasRecording}
          autoPlay
          loop={hasRecording}
          ref={x => (this.video = x)}
          src={this.state.recordedVideo || this.state.streamSrc}
        />
      </div>
    );
  }
}
