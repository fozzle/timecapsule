import React from 'react';

const API_URL = 'https://us-central1-timecapsule-174619.cloudfunctions.net/getSignedURL';
export default class Uploader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      date: '',
      valid: false,
      uploading: false,
    }
  }

  isValid() {
    // Check to make sure the date and email make sense.
    const valid = this.state.email.indexOf('@') !== -1 && new Date(this.state.date) > new Date();

    return this.props.recordedVideo && valid;
  }

  async uploadVideo() {
    // Set uploading state
    this.setState({ uploading: true });
    const { email, sendAt } = this.state;
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
      body: this.props.recordedVideo,
      headers: {
        'Content-Length': this.props.recordedVideo.size,
        'Content-Type': 'video/webm',
      },
    };

    try {
      const urlResp = await fetch(API_URL, initiateFetchOptions);
      const { putURL } = await urlResp.json();
      const putResp = await fetch(putURL, putFetchOptions);
    } catch (err) {
      console.error('Error', err);
    }

    this.setState({ uploading: false });
  }

  render() {
    const now = new Date();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const date = String(now.getUTCDate()).padStart(2, '0');
    const minSend = `${now.getUTCFullYear()}-${month}-${date}`
    return (
      <div
        className="uploader"
        style={{
          maxHeight: this.props.recordedVideo ? '1000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.5s ease',
          width: '100%',
          margin: '16px 0',
        }}
      >
        <form style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <label>
            <span style={{ marginRight: '16px' }}>Email</span>
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => this.setState({ email: e.target.value })}
              value={this.state.email}
            />
          </label>
          <label>
            <span style={{ marginRight: '16px' }}>Send On Date</span>
            <input
              type="date"
              min={minSend}
              placeholder="Send on Date"
              onChange={(e) => this.setState({ date: e.target.value })}
              value={this.state.date}
            />
          </label>
          <div>
            <button type="button" onClick={() => this.uploadVideo()} disabled={!this.isValid()}>
              Upload
            </button>
          </div>
        </form>
      </div>
    );
  }
}
