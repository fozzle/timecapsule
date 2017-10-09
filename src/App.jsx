import React from 'react';
import Recorder from './Recorder';
import Uploader from './Uploader';

export default class App extends React.Component {
  render() {
    return (
      <div id="timecapsule">
        <h1 style={{ textAlign: 'center' }}>Video Timecapsule</h1>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Recorder />
        </div>
        <Uploader />
        <div>
          <h2>FAQ</h2>
          <div style={{ display: 'flex' }}>
            <div>
              <h3>Why?</h3>
              <p>To put it succinctly: I just think the "timecapsule" concept is pretty fun! Why not!?</p>
              <p>When I was in highschool I wrote a letter during freshman year to be opened on graduation. Forgetting about it and reading it 4 years later, it was a trip to see what had changed in my life, what hadn't changed in my life, and the all the changes that had happened in the years between.</p>
              <p>Since then I've journaled or written sporadically, to myself. I will often forget about these writings and find them years later. They are always a joy to "uncover" (and embarassing, but in an endearing way I think).</p>
              <p>I thought it would be fun to move this accidental timecapsule behavior to an easy to use website. A way to quickly record a message to myself on a whim and have it removed from my grasp until some set time. By putting in the cloud, the hope is that it will be resilient to failures, drive wipes, over-zealous disk cleanup, planned obscelecence, or whatever other ravages of time we subject our data to. So here we are.</p>
            </div>
            <div>
              <h3>How?</h3>
              <p>Your videos are uploaded to the cloud and cannot be viewed until the date you specify (and even then, only via a specific link that cannot be guessed).</p>
              <p>On the date you specify, the video will be "unlocked" and viewable for 30 days. You will receive an email with a link to the video, and of course be able to download it.</p>
              <p>That's pretty much it!</p>
            </div>
            <div>
              <h3>How far ahead can I set the date?</h3>
              <p>So to be honest, this is subject to change, but, 5 years is what I feel comfortable guaranteeing for now.</p>
              <p>I've set aside funds to store the videos for up to <em>5 years</em> in the future, however, if this service gets decent use I am open to extending that. Video storage without much access is cheaper than you'd think, and the way this service has been architected makes this very very inexpensive to run, so I've no problem with keeping it running if people are enjoying it.</p>
              <p>Just remember the capsules will self-destruct 30 days after being "unlocked". If you want to save them, please download them!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
