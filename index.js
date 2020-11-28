
const { Storage } = require("@google-cloud/storage");
const express = require("express");
const app = express();
const fs = require('fs');
const path = require('path');
const {chunkSizeStream, entireFileDownload} = require("./components/readStreams.js")

const cors = require("cors");
const port = process.env.NODE_ENV || '3000';

app.use(cors());

app.get("/stream/:fileName", (req, res) => {

  res.set('Cache-Control', 'public, max-age=300, s-maxage=500');

  const bucketFile = `videos/${req.params.fileName}`;
  const storage = new Storage({ keyFilename: "key.json" });//TODO: place in env
  const bucket = storage.bucket("nerdzandhiphop-b3a28.appspot.com") // get bucket from client
  const remoteFile = bucket.file(bucketFile);
  const range = req.headers.range;

  if(range){
    const parts = range.replace(/bytes=/, "").split("-"); 
    const start = parseInt(parts[0], 10) ;
    //in some cases end may not exists, if its  not exists make it end of file
    if(parts[1] === ''){
      entireFileDownload(bucketFile, remoteFile, start, res)
    }else{
      const end = parseInt(parts[1], 10);
      const chunksize = (end - start) + 1 
      chunkSizeStream(bucketFile, remoteFile, start, end, chunksize, res);
    }
  }else{
      res.status(400).send("Requires Range header");
  }

});

app.listen(port, () => {
  console.log(`the server is connected in port: ${port}`);
})