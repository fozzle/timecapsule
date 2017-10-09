import 'webrtc-adapter';
import React from 'react';

export default class Recorder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recording: false,
      recordedData: null,
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

  toggleRecording() {
    if (!this.state.recording) {
      this.chunks = [];
      this.mediaRecorder.start(10);
      this.setState({ recordedData: null, recording: true });
    } else {
      this.mediaRecorder.stop();

      const combinedBuffer = new Blob(this.chunks, { type: 'video/webm' });
      const recordedData = window.URL.createObjectURL(combinedBuffer);
      this.setState({ recordedData, recording: false });
    }
  }

  render() {
    const hasRecording = Boolean(this.state.recordedData);
    return (
      <div className="recorder">
        <button onClick={() => this.toggleRecording()} style={{ border: this.state.recording ? '4px solid red' : '4px solid transparent' }}>
          <video
            muted={!hasRecording}
            autoPlay
            controls={hasRecording}
            loop={hasRecording}
            ref={x => (this.video = x)}
            src={this.state.recordedData || this.state.streamSrc}
          />
        </button>
      </div>
    );
  }
}
