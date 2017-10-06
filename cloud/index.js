/**
 * Triggered from a message on a Cloud Storage bucket.
 *
 * @param {!Object} event The Cloud Functions event.
 * @param {!Function} The callback function.
 */
exports.createCapsule = function(event, callback) {
  console.log('Processing file: ' + event.data.name);
  console.log(event.data);
  callback();
};
