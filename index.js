require('dotenv').config()
const { Storage } = require("@google-cloud/storage");
const express = require("express");
const app = express();
const helmet = require('helmet')
const cors = require("cors");

const {chunkSizeStream, entireFileDownload} = require("./components/readStreams.js")
const port = process.env.NODE_ENV || '3000';

app.use(cors());
app.use(helmet())

async function configureBucketCors(storage) {
  await storage.bucket(process.env.FB_BUCKET).setCorsConfiguration([
    {
      maxAgeSeconds: 3600,
      method: ['*'],
      origin: ['*'],
      responseHeader: ['video/mp4'],
    },
  ]);
}


app.get("/stream/:fileName", async (req, res) => {

  // res.set('Cache-Control', 'public, max-age=300, s-maxage=500');

  const bucketFile = `videos/${req.params.fileName}`;
  const storage = new Storage({ keyFilename: "key.json" });
  const bucket = storage.bucket(process.env.FB_BUCKET);
  const remoteFile = bucket.file(bucketFile);
  const range = req.headers.range;

  if(range){//if range request avalible, pasrse start and end bytes
    const parts = range.replace(/bytes=/, "").split("-"); 
    const start = parseInt(parts[0], 10);
    if(parts[1] === ''){//if end is not empty send client chunked stream
      entireFileDownload(remoteFile, res, req)
    }else{ //else send the entire file to the client
      const end = parseInt(parts[1], 10);
      const chunksize = (end - start) + 1 
      chunkSizeStream(remoteFile, start, end, chunksize, res);
    }
  }else{//send 400 request for a bad request
    res.status(400).send("Need to send range request")
  }

});

app.listen(port, () => {
  console.log(`the server is connected in port: ${port}`);
})