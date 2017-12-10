import 'webrtc-adapter';
import React from 'react';
import PropTypes from 'prop-types';
import CircularProgressbar from 'react-circular-progressbar';


const MAX_DURATION_MS = 1000 * 60 * 10; // 10 minutes
class Recorder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recording: false,
      recordedVideo: null,
    };

    this.recordingAnimationFrame = this.recordingAnimationFrame.bind(this);
  }

  componentDidMount() {
    this.initMediaRecorder();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.recordedData !== nextProps.recordedData) {
      this.setState({ recordedVideo: nextProps.recordedData ? window.URL.createObjectURL(nextProps.recordedData) : null });
    }
  }

  async getMedia() {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { width: 1280, height: 720 } });
    } catch (e) {
      console.error('Error fetching streams', e);
    }

    this.setState({ streamSrc: window.URL.createObjectURL(stream) });

    return stream;
  }

  async initMediaRecorder() {
    const stream = await this.getMedia();

    this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=h264,opus' });

    this.mediaRecorder.addEventListener('dataavailable', (e) => {
      this.chunks.push(e.data);
    });
  }

  toggleRecording() {
    if (!this.state.recording) {
      this.chunks = [];
      this.mediaRecorder.start(10);
      this.recordStart = Date.now();
      this.setState({ recording: true });
      requestAnimationFrame(this.recordingAnimationFrame);
      if (this.props.onRecordingStateChange) this.props.onRecordingStateChange(null);
    } else {
      this.mediaRecorder.stop();

      // need to provide combined buffer to the uploader
      const recordedData = new Blob(this.chunks, { type: 'video/webm' });
      this.setState({ recording: false });
      if (this.props.onRecordingStateChange) this.props.onRecordingStateChange(recordedData);
    }
  }

  recordingAnimationFrame() {
    const elapsed = Date.now() - this.recordStart;
    this.setState({ completionPercent: elapsed / MAX_DURATION_MS });
    if (this.state.recording) requestAnimationFrame(this.recordingAnimationFrame);
    // Can use this to stop recording as well
    if ((elapsed / MAX_DURATION_MS) > 1) this.toggleRecording();
  }

  render() {
    const hasRecording = Boolean(this.props.recordedData);
    return (
      <div
        className="recorder"
        style={{ position: 'relative' }}
      >
        {/* recording toggle */}
        {!hasRecording ?
          <button
            className="button-clear"
            style={{
              position: 'absolute',
              bottom: '5%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
              width: '8vw',
              maxWidth: '100px',
              height: '8vw',
              maxHeight: '100px',
            }}
            onClick={() => this.toggleRecording()}
          >
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              width: this.state.recording ? '35%' : '40%',
              height: this.state.recording ? '35%' : '40%',
              background: this.state.recording ? 'gray' : 'red',
              borderRadius: this.state.recording ? 0 : '100%',
              }}
            />
            <CircularProgressbar
              className={this.state.recording ? 'progress-button-recording' : 'progress-button-record'}
              percentage={this.state.recording ? this.state.completionPercent * 100 : 0}
              background
            />
          </button> : null}
        {/* eslint-disable */}
        <video
          style={{ maxHeight: '80vh', width: '100vw', maxWidth: '80vw', objectFit: 'initial' }}
          muted={!hasRecording}
          autoPlay
          controls={hasRecording}
          ref={x => (this.video = x)}
          src={this.state.recordedVideo || this.state.streamSrc}
        />
        {/* eslint-enable */}
      </div>
    );
  }
}

Recorder.propTypes = {
  onRecordingStateChange: PropTypes.func.isRequired,
  recordedData: PropTypes.object, //eslint-disable-line
};

export default Recorder;
