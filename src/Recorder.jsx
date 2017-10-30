import 'webrtc-adapter';
import React from 'react';
import PropTypes from 'prop-types';

class Recorder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recording: false,
      recordedVideo: null,
    };
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

    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.addEventListener('dataavailable', (e) => {
      this.chunks.push(e.data);
    });
  }

  toggleRecording() {
    if (!this.state.recording) {
      this.chunks = [];
      this.mediaRecorder.start(10);
      this.setState({ recording: true });
      if (this.props.onRecordingStateChange) this.props.onRecordingStateChange(null);
    } else {
      this.mediaRecorder.stop();

      // need to provide combined buffer to the uploader
      const recordedData = new Blob(this.chunks, { type: 'video/webm' });
      this.setState({ recording: false });
      if (this.props.onRecordingStateChange) this.props.onRecordingStateChange(recordedData);
    }
  }

  render() {
    const hasRecording = Boolean(this.props.recordedData);

    /* Overlay shown:
      1.) Initial load (not recording, no data)
      2.) hover while recording
    */
    const showOverlay = (!hasRecording && !this.state.recording) ||
      (!hasRecording && this.state.hovered);
    return (
      <div
        className="recorder"
        style={{ position: 'relative' }}
        onMouseEnter={() => this.setState({ hovered: true })}
        onMouseLeave={() => this.setState({ hovered: false })}
      >
        {showOverlay ?
          <div
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
            {!hasRecording && !this.state.recording ?
              <button
                className="button button-clear"
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
                Lookin&lsquo; good? Click to start recording.
              </button> : null}
            {/* During recording toggle */}
            {this.state.recording ?
              <button
                className="button button-clear"
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
          </div> : null}
        {/* eslint-disable */}
        <video
          style={{ maxHeight: '80vh', width: '100vw', maxWidth: '80vw', objectFit: 'initial' }}
          muted={!hasRecording || showOverlay}
          autoPlay
          loop={hasRecording}
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
