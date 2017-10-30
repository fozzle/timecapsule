const storage = require('@google-cloud/storage')();
const datastore = require('@google-cloud/datastore')();
const runtimeConfig = require('cloud-functions-runtime-config');
const cors = require('cors')({ origin: true });
const uuid = require('uuid/v4');
const mailgun = require('mailgun-js');
const unlockEmailHTMLTemplate = require('./unlockEmailHTMLTemplate');
const unlockEmailTextTemplate = require('./unlockEmailTextTemplate');

const mailgunKey = runtimeConfig.getVariable('dev-config', 'mailgunKey');
const mailgunDomain = runtimeConfig.getVariable('dev-config', 'mailgunDomain');
const bucket = storage.bucket('timecapsules');


// These are all google cloud functions. This repo sort of does double work. I'm not sorry.
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
                const email = {
                  from: 'Time Warden <me@samples.mailgun.org>',
                  to: capsule.email,
                  subject: 'Your Time Capsule Has Been Released from Stasis',
                  text: unlockEmailTextTemplate(videoURL, capsule.createdAt),
                  html: unlockEmailHTMLTemplate(videoURL, capsule.createdAt),
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
    // TODO: dont make the filename predictable
    const file = bucket.file(`${uuid()}.webm`);
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
