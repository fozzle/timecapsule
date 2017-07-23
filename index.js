require('dotenv').config();

const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const https = require('https');
const Multer = require('multer');
const uuidv4 = require('uuid/v4');
const storage = require('@google-cloud/storage')({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.GCLOUD_KEYFILENAME,
});

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

let db;

const app = express();

app.use('/static', express.static(__dirname + '/dist'));
app.use(express.static(__dirname + '/html'));

app.post('/upload', multer.single('media'), (req, res, next) => {

  const collection = db.collection('timecapsules');
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

      // If completed, insert record to DB
      collection.insertOne({ gcsFilename: gcsname })
        .then(() => {
          res.send({ ok: true });
        });
    });

    stream.end(req.file.buffer);
  }
});

MongoClient.connect(process.env.MONGO_URL, (err, dbHandle) => {
  if (err !== null) {
    console.error(err);
    throw new Error('Failed to connect to MongoDB');
  }

  https.createServer({
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  }, app).listen(3000, () => {
    console.log('App started on 3000');
  });

  db = dbHandle;
});
