const storage = require('@google-cloud/storage')();
const bucket = storage.bucket('timecapsules');

exports.createCapsule = function(event, callback) {
  console.log('Processing file: ' + event.data.name);
  console.log(event.data);
  callback();
};

exports.getSignedURL = function(req, res) {
  const file = bucket.file(`${Date.now()}.webm`);
  file.createResumableUpload((err, uri) => {
    if (err) {
      console.log('err', err);
      res.send(err);
    } else {
      console.log('uri', uri);
      res.send(uri);
    }
  });
}
