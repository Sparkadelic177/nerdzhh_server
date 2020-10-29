const { Storage } = require("@google-cloud/storage");
const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());

const port = process.env.PORT || 3001;

// // Handle 404
// app.use(function (req, res) {
//   // res.send('404: Page not Found', 404);
//   res.redirect("/");
// });

// // Handle 500
// app.use(function (error, req, res, next) {
//   res.redirect("/");
// });

app.get("/", (req, res) => {
  res.send("backend");
});

app.get("/stream/:fileName", async (req, res) => {
  // Creates a client from a Google service account key.
  const bucketFile = `videos/${req.params.fileName}`;

  const storage = new Storage({ keyFilename: "key.json" }); //TODO: place in env

  const bucket = storage.bucket("nerdzandhiphop-b3a28.appspot.com"); // get bucket from client

  const remoteFile = bucket.file(bucketFile);
  remoteFile
    .createReadStream(null, { start: 1000, end: 4000 })
    .on("response", function (response) {
      const head = {
        "Content-Range": `bytes ${1000}-${4000}/${
          response._readableState.length
        }`,
        "Accept-Ranges": "bytes",
        "Content-Length": response.headers["content-length"],
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
    })
    .on("error", function (err) {
      console.log("Something happend to the stream" + err);
      res.send(err);
    })
    .on("end", function () {
      console.log("video complete");
    })
    .pipe(res);
});

app.listen(port, () => {
  console.log(`the server is connected in port: ${port}`);
});
