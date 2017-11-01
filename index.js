const storage = require('@google-cloud/storage')();
const datastore = require('@google-cloud/datastore')();
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const runtimeConfig = require('cloud-functions-runtime-config');
const moment = require('moment');
const cors = require('cors')({ origin: true });
const uuid = require('uuid/v4');
const mailgun = require('mailgun-js');
const unlockEmailHTMLTemplate = require('./unlockEmailHTMLTemplate');
const unlockEmailTextTemplate = require('./unlockEmailTextTemplate');

const mailgunKey = runtimeConfig.getVariable('dev-config', 'mailgunKey');
const mailgunDomain = runtimeConfig.getVariable('dev-config', 'mailgunDomain');
const bucket = storage.bucket('timecapsules');
const tempBucket = storage.bucket('timecapsules-temp');
ffmpeg.setFfmpegPath(ffmpegPath);


// These are all google cloud functions. This repo sort of does double work. I'm not sorry.

// Upon upload to bucket, transcode and transmux video for universal playback
exports.transcodeCapsule = function transcodeCapsule(event, callback) {
  const file = event.data;

  if (file.metageneration !== '1' || file.resourceState !== 'exists') {
    callback();
    return;
  }

  // Transcode and transmux to mp4 h264/aac incoming video should be h264 so we can copy codec

  // Transfer file to new bucket, preserve metadata on file for datastore construction
  const remoteWriteStream = bucket.file(file.name.replace('.webm', '.mp4')).createWriteStream();
  const remoteReadStream = tempBucket.file(file.name).createReadStream();

  ffmpeg()
    .input(remoteReadStream)
    .outputOptions('-c:v copy')
    .outputOptions('-c:a aac')
    .outputOptions('-b:a 160k')
    .outputOptions('-f mp4')
    .outputOptions('-preset fast')
    .outputOptions('-movflags frag_keyframe+empty_moov')
    .on('start', (cmdLine) => {
      console.log('Started ffmpeg with command:', cmdLine);
    })
    .on('end', () => {
      console.log('Successfully re-encoded video.');
      // Set the metadata of the file on completion.
      const transcodedFile = bucket.file(file.name.replace('.webm', '.mp4'));

      transcodedFile.setMetadata({
        metadata: file.metadata,
        contentType: 'video/mp4',
      })
        .then(() => callback())
        .catch((err) => {
          console.error('Error setting metadata', err);
          callback(err);
        });

      // TODO: Delete previous file
    })
    .on('error', (err, stdout, stderr) => {
      console.error('An error occured during encoding', err.message);
      console.error('stdout:', stdout);
      console.error('stderr:', stderr);
      callback(err);
    })
    .pipe(remoteWriteStream, { end: true });
};

// After transcoding is complete, create datastore entry for future querying
exports.createCapsule = function createCapsule(event, callback) {
  const file = event.data;

  // We will only respond to creation events.
  if (file.metageneration !== '1' || file.resourceState !== 'exists') return callback();

  const capsuleKey = datastore.key('Capsule');
  const entity = {
    key: capsuleKey,
    data: [
      {
        name: 'email',
        value: file.metadata.email,
      },
      {
        name: 'sendAt',
        value: new Date(file.metadata.sendAt),
      },
      {
        name: 'filename',
        value: file.name,
      },
      {
        name: 'sent',
        value: false,
      },
      {
        name: 'createdAt',
        value: new Date(),
      },
    ],
  };

  return datastore.save(entity)
    .then(() => callback())
    .catch(err => console.error('ERROR:', err));
};

exports.unlockAndSendCapsules = function unlockAndSendCapsules(event, callback) {
  const query = datastore.createQuery('Capsule')
    .filter('sent', '=', false)
    .filter('sendAt', '<=', new Date());

  Promise.all([
    mailgunKey,
    mailgunDomain,
  ])
    .then(([apiKey, domain]) => {
      const mailgunClient = mailgun({ apiKey, domain });

      return datastore.runQuery(query)
        .then(([data]) => {
          // All capsules to be sent undergo same 3 step process
          const promises = data.map((capsule) => {
            // Unlock the associated file for access.
            const file = bucket.file(capsule.filename);
            return file.makePublic()
              .then(() => {
                // Send email to owner.
                const videoURL = `https://storage.googleapis.com/timecapsules/${capsule.filename}`;
                const createdAtString = moment(capsule.createdAt).format('LL');
                const email = {
                  from: 'Time Warden <me@samples.mailgun.org>',
                  to: capsule.email,
                  subject: 'Your Time Capsule Has Been Released from Stasis',
                  text: unlockEmailTextTemplate(videoURL, createdAtString),
                  html: unlockEmailHTMLTemplate(videoURL, createdAtString),
                };

                return new Promise((resolve, reject) => {
                  mailgunClient.messages().send(email, (err, body) => {
                    if (err) return reject(err);
                    return resolve(body);
                  });
                });
              })
              .then(() => {
                // Mark as sent.
                const capsuleKey = capsule[datastore.KEY];
                // This could be batched but for now...whatever lol
                return datastore.update({
                  key: capsuleKey,
                  data: {
                    email: capsule.email,
                    filename: capsule.filename,
                    sent: true,
                    sendAt: capsule.sendAt,
                    createdAt: capsule.createdAt,
                  },
                });
              });
          });

          return Promise.all(promises);
        });
    })
    .then(() => {
      callback();
    })
    .catch((err) => {
      console.error('ERROR:', err);
      callback(err);
    });
};

exports.cleanTimecapsules = function cleanTimecapsules(event, callback) {
  // Find timecapsules that have been sent, and have a sendAt over 30 days in the past.
  const today = new Date();
  const deletionDate = new Date(new Date().setDate(today.getDate() - 30));
  const query = datastore.createQuery('Capsule')
    .filter('sent', '=', true)
    .filter('sendAt', '<=', deletionDate);

  return datastore.runQuery(query)
    .then(([data]) => {
      const promises = data.map((capsule) => {
        const file = bucket.file(capsule.filename);
        const capsuleKey = capsule[datastore.KEY];
        // Delete them from the datastore
        // Remove their files from storage
        return Promise.all([
          datastore.delete(capsuleKey),
          file.delete(),
        ]);
      });

      return Promise.all(promises);
    })
    .then(() => {
      callback();
    })
    .catch((err) => {
      console.error('ERROR:', err);
      callback(err);
    });
};

exports.getSignedURL = function getSignedURL(req, res) {
  cors(req, res, () => {
    const file = tempBucket.file(`${uuid()}.webm`);
    file.createResumableUpload({
      origin: req.headers.origin,
      metadata: {
        metadata: {
          sendAt: req.body.sendAt,
          email: req.body.email,
        },
        contentType: 'video/webm',
      },
    })
      .then(data => res.send({ putURL: data[0] }));
  });
};
