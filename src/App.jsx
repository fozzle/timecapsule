import React from 'react';
import Recorder from './Recorder';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import { blueGrey, red } from 'material-ui/colors';

const primary = blueGrey[500];
const accent = red[500];


const theme = createMuiTheme({
  palette: {
    primary: blueGrey,
    secondary: red,
  }
});

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = { recordedVideo: null, uploading: false };
  }
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div id="timecapsule">
          <Typography style={{ textAlign: 'center', margin: '16px 0' }} type="display4" component="h1">Video Timecapsule</Typography>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Recorder onRecordingStateChange={(recordedVideo) => this.setState({ recordedVideo })} />
          </div>
          <div>
            <Typography type="display2" component="h2" style={{ textAlign: 'center', margin: '16px 0' }}>FAQ</Typography>
            <Grid container spacing={16}>
              <Grid item xs={12} md={4}>
                <Typography type="headline" gutterBottom component="h3">How Do?</Typography>
                <Typography paragraph type="body1" component="p">After granting camera and microphone permissions to the website, click on the video to start recording. Click on the video again to stop recording. You will then be able to choose to redo or upload.</Typography>
                <Typography paragraph type="body1" component="p">Your recorded video is then uploaded to the cloud and cannot be viewed until the date you specify (and even then, only via a specific link that cannot be guessed by anyone else).</Typography>
                <Typography paragraph type="body1" component="p">On the date you specify, the video will be "unlocked" and viewable for 30 days. You will receive an email with a link to watch the video, and of course download it too.</Typography>
                <Typography paragraph type="body1" component="p">That's pretty much it!</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography type="headline" gutterBottom component="h3">Why?</Typography>
                <Typography paragraph type="body1" component="p">To put it succinctly: I just think the "timecapsule" concept is pretty fun!</Typography>
                <Typography paragraph type="body1" component="p">When I was in highschool I wrote a letter during freshman year to be opened on graduation. Forgetting about it and reading it 4 years later, it was a trip to see what had changed in my life, what hadn't changed in my life, and the all the changes that had happened in the years between.</Typography>
                <Typography paragraph type="body1" component="p">Since then I've journaled or written sporadically, to myself. I will often forget about these writings and find them years later. They are always a joy to re-read (and embarassing, but in an endearing way I think).</Typography>
                <Typography paragraph type="body1" component="p">I thought it would be fun to move this accidental timecapsule behavior to an easy to use website. A way to quickly record a message to myself on a whim and have it removed from my grasp until some set time in the future. By putting in the cloud, the hope is that it will be resilient to failures, drive wipes, over-zealous disk cleanup, planned obscelecence, or whatever other ravages of time we subject our data to. So here we are.</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography type="headline" gutterBottom component="h3">How Long?</Typography>
                <Typography paragraph type="body1" component="p">So to be honest, because I'm just one bored human bean, I can't truly GUARANTEE anything. BUT, and this is subject to change, up to 5 years is what I feel comfortable saying for now.</Typography>
                <Typography paragraph type="body1" component="p">I've set aside funds to store the videos for that time, however, if this service gets decent use I am open to extending that. Video storage without much access is cheaper than you'd think, and the way this service has been architected makes this very very inexpensive to run, so I've no problem with keeping it running if people are enjoying it.</Typography>
                <Typography paragraph type="body1" component="p">Just remember the capsules will self-destruct 30 days after being "unlocked". If you want to save them, please download them!</Typography>
              </Grid>
            </Grid>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
