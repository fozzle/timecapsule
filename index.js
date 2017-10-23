const storage = require('@google-cloud/storage')();
const datastore = require('@google-cloud/datastore')();
const cors = require('cors')({ origin: true });
const uuid = require('uuid/v4');
const bucket = storage.bucket('timecapsules');

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
        value: new Date(file.metadata.sendAt).toJSON(),
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
  datastore.createQuery('Capsule')
    .filter('sent', '=', false)
    .filter('sendAt', '<=', new Date())
    .then((data) => {
      console.log('data found', data);
    })
    .catch((err) => console.error('ERROR:', err));
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
