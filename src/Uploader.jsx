import React from 'react';
import PropTypes from 'prop-types';

const API_URL = 'https://us-central1-timecapsule-174619.cloudfunctions.net/getSignedURL';
class Uploader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      sendAt: '',
      uploading: false,
    };
  }

  isValid() {
    // Check to make sure the date and email make sense.
    const valid = this.state.email.indexOf('@') !== -1 && new Date(this.state.sendAt) > new Date();

    return this.props.recordedVideo && valid;
  }

  async uploadVideo() {
    // Set uploading state
    this.setState({ uploading: true });
    this.props.onUploadingStateChange('uploading');
    const { email, sendAt } = this.state;
    const initiateFetchOptions = {
      method: 'POST',
      body: JSON.stringify({
        email,
        sendAt,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
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
      await fetch(putURL, putFetchOptions);
    } catch (err) {
      console.error('Error', err);
    }

    this.props.onUploadingStateChange('uploaded');
  }

  render() {
    const now = new Date();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const date = String(now.getUTCDate()).padStart(2, '0');
    const minSend = `${now.getUTCFullYear()}-${month}-${date}`;
    return (
      <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '4px',
          width: '100%',
        }}
      >
        <h3>Seal Away Your Capsule!</h3>
        <div>
          <p>Just fill out these two fields to seal away your time capsule, or hit &ldquo;Start Over&rdquo; to clear the video and start anew.</p>
          <form>
            <fieldset>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                  <input
                    className="form-input"
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={this.state.email}
                    onChange={e => this.setState({ email: e.target.value })}
                  />
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="sendAt" className="form-label">
                  Send on Date
                  <input
                    className="form-input"
                    id="sendAt"
                    label="Send on Date"
                    type="date"
                    min={minSend}
                    placeholder="MM-DD-YYYY"
                    value={this.state.sendAt}
                    onChange={e => this.setState({ sendAt: e.target.value })}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <button className="btn" type="button" disabled={this.state.uploading} onClick={() => this.props.onResetClick()}>
                  <i className="material-icons" style={{ marginRight: '8px', verticalAlign: 'middle' }}>clear</i>Start Over
                </button>
                <button className={`btn btn-primary ${this.state.uploading ? 'loading' : ''}`} type="button" onClick={() => this.uploadVideo()} disabled={!this.isValid() || this.state.uploading}>
                  <i className="material-icons" style={{ marginRight: '8px', verticalAlign: 'middle' }}>cloud_upload</i>Upload
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    );
  }
}

Uploader.propTypes = {
  onResetClick: PropTypes.func.isRequired,
  onUploadingStateChange: PropTypes.func.isRequired,
  recordedVideo: PropTypes.shape({
    size: PropTypes.number,
  }),
};

Uploader.defaultProps = {
  recordedVideo: null,
};

export default Uploader;
