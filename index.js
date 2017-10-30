const storage = require('@google-cloud/storage')();
const datastore = require('@google-cloud/datastore')();
const runtimeConfig = require('cloud-functions-runtime-config');
const mailgunKey = runtimeConfig.getVariable('dev-config', 'mailgunKey');
const mailgunDomain = runtimeConfig.getVariable('dev-config', 'mailgunDomain');
const cors = require('cors')({ origin: true });
const uuid = require('uuid/v4');
const bucket = storage.bucket('timecapsules');
const mailgun = require('mailgun-js');

// These are all google cloud functions. This repo sort of does double work. I'm not sorry.
exports.createCapsule = function(event, callback) {
  console.log('Processing file: ' + event.data.name);
  console.log(event.data);

  const file = event.data;

  // We will only respond to creation events.
  if (file.metageneration !== '1' && file.resourceState !== 'exists') return callback();

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
      }
    ]
  }

  datastore.save(entity)
    .then(() => callback())
    .catch((err) => console.error('ERROR:', err));
};

exports.unlockAndSendCapsules = function(event, callback) {
  const query = datastore.createQuery('Capsule')
    .filter('sent', '=', false)
    .filter('sendAt', '<=', new Date());

  Promise.all([
    mailgunKey,
    mailgunDomain,
  ])
    .then(([apiKey, domain]) => {
      const mailgunClient = mailgun({ apiKey, domain });
      console.log('unpacked', apiKey, domain);
      return datastore.runQuery(query)
        .then(([data, meta]) => {
          // All capsules to be sent undergo same 3 step process
          const promises = data.map((capsule) => {
            // Unlock the associated file for access.
            const file = bucket.file(capsule.filename);
            return file.makePublic()
              .then(() => {
                // Send email to owner.
                const email = {
                  from: 'Time Warden <me@samples.mailgun.org>',
                  to: capsule.email,
                  subject: 'Your Time Capsule Has Been Released from Stasis',
                  text: `Check check check check it out! https://storage.googleapis.com/timecapsules/${capsule.filename}`,
                };

                return new Promise((resolve, reject) => {
                  mailgunClient.messages().send(email, (err, body) => {
                    if (err) return reject(err);
                    return resolve(body);
                  })
                });
              })
              .then(() => {
                // Mark as sent.
                const capsuleKey = capsule[datastore.KEY]);
                // This could be batched but for now...whatever lol
                return datastore.update({
                  key: capsuleKey,
                  data: {
                    email: capsule.email,
                    filename: capsule.filename,
                    sent: true,
                    sendAt: capsule.sendAt,
                  }
                });
              });
          });

          return Promise.all(promises);
        })
    })
    .then(() => {
      callback();
    })
    .catch((err) => {
      console.error('ERROR:', err)
      callback(err);
    });

}

exports.getSignedURL = function(req, res) {
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
      }
    })
      .then((data) => res.send({ putURL: data[0] }));
  });
}
