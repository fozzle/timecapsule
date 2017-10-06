const storage = require('@google-cloud/storage')();
const cors = require('cors')({ origin: true });
const bucket = storage.bucket('timecapsules');

exports.createCapsule = function(event, callback) {
  console.log('Processing file: ' + event.data.name);
  console.log(event.data);
  callback();
};

exports.getSignedURL = function(req, res) {
  cors(req, res, () => {
    // TODO: dont make the filename predictable
    const file = bucket.file(`${Date.now()}-${req.body.sendAt}-${req.body.email}.webm`);
    // file.setMetadata({
    //   metadata: {
    //     sendAt: req.body.sendAt,
    //     email: req.body.email,
    //   }
    // })
      Promise.resolve().then(() => file.createResumableUpload())
      .then((data) => res.send({ putURL: data[0] }));
  });
}
