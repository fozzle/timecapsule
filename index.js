const storage = require('@google-cloud/storage')();
const cors = require('cors')({ origin: true });
const uuid = require('uuid/v4');
const bucket = storage.bucket('timecapsules');

exports.createCapsule = function(event, callback) {
  console.log('Processing file: ' + event.data.name);
  console.log(event.data);
  callback();
};

exports.getSignedURL = function(req, res) {
  cors(req, res, () => {
    // TODO: dont make the filename predictable
    const file = bucket.file(`${uuid()}.webm`);
    file.createResumableUpload({
      metadata: {
        sendAt: req.body.sendAt,
        email: req.body.email,
        contentType: 'video/webm',
      }
    })
      .then((data) => res.send({ putURL: data[0] }));
  });
}
