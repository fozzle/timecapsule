import React from 'react';
import Card, { CardHeader, CardContent, CardActions } from 'material-ui/Card';
import MButton from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import { CircularProgress } from 'material-ui/Progress';


const API_URL = 'https://us-central1-timecapsule-174619.cloudfunctions.net/getSignedURL';
export default class Uploader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      sendAt: '',
      valid: false,
      uploading: false,
    }
  }

  isValid() {
    // Check to make sure the date and email make sense.
    const valid = this.state.email.indexOf('@') !== -1 && new Date(this.state.sendAt) > new Date();

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
      <Card>
        <CardHeader title="Seal the Deal!" />
        <CardContent>
          <Typography type="body1">Just fill out these two fields to send away your time capsule, or hit reset to clear the video and start over.</Typography>
          <form style={{ display: 'flex', flexDirection: 'column' }}>
            <TextField
              error={Boolean(this.state.email && this.state.email.indexOf('@') === -1)}
              id="email"
              label="Email"
              type="email"
              value={this.state.email}
              onChange={(e) => this.setState({ email: e.target.value })}
              margin="normal"
            />
            <TextField
              id="sendAt"
              label="Send on Date"
              placeholder="MM-DD-YYYY"
              value={this.state.sendAt}
              onChange={(e) => this.setState({ sendAt: e.target.value })}
              margin="normal"
            />
          </form>
        </CardContent>
        <CardActions>
          <MButton disabled={this.state.uploading} raised color='primary' onClick={() => this.props.onResetClick()}>
            <i className="material-icons" style={{ marginRight: '4px' }}>clear</i>Reset
          </MButton>
          <div style={{ position: 'relative' }}>
            <MButton raised color='accent' onClick={() => this.uploadVideo()} disabled={!this.isValid() || this.state.uploading}>
              <i className="material-icons" style={{ marginRight: '4px'}}>cloud_upload</i>Upload
            </MButton>
            {
              this.state.uploading &&
              <CircularProgress
                size={24}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '24px',
                  height: '24px',
                  marginTop: -12,
                  marginLeft: -12,
                }} />
            }
          </div>
        </CardActions>
      </Card>
    );
  }
}
