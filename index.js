require('dotenv').config();

const express = require('express');
const fs = require('fs');
const https = require('https');
const Multer = require('multer');
const uuidv4 = require('uuid/v4');
const storage = require('@google-cloud/storage')({
  projectId: process.env.GCLOUD_KEYFILENAME,
  keyFilename: process.env.GCLOUD_KEYFILENAME,
});

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});


const app = express();

app.use('/static', express.static(__dirname + '/dist'));
app.use(express.static(__dirname + '/html'));

app.post('/upload', multer.single('media'), (req, res, next) => {

  const bucket = storage.bucket('timecapsules');
  // Parse out extra data to store in DB
  if (req.file) {

    const gcsname = `${uuidv4()}.webm`;
    const file = bucket.file(gcsname);

    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      }
    });

    stream.on('error', (err) => {
      req.file.cloudStorageError = err;
      next(err);
    });

    stream.on('finish', () => {
      req.file.cloudStorageObject = gcsname;
      res.send({ ok: true });
    });

    stream.end(req.file.buffer);
  }
});


https.createServer({
  key: fs.readFileSync('../localhostkeys/server.key'),
  cert: fs.readFileSync('../localhostkeys/server.crt'),
}, app).listen(3000, () => {
  console.log('App started on 3000');
});
