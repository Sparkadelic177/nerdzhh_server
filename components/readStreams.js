module.exports = { 
    chunkSizeStream: (remoteFile, start, end, chunksize, res) => {
        remoteFile
        .createReadStream(null,{ start: start , end: end })
        .on("response", (response) => {
            const head = {
                "Content-Range": `bytes ${start}-${end}/${response.headers['content-length']}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": response.headers['content-type'],
            };
            // console.log(JSON.stringify(response.headers))
            res.writeHead(206, head);
        }) 
        .on("error",  (err) => {
            console.log("Something happend to the stream" + err);
            res.status(500).send(err);
          })
        .on("end", () => {
            console.log("video complete");
        })
        .pipe(res);
    },
    entireFileDownload: (remoteFile, res, req)=> {
        remoteFile
        .createReadStream(null, {start: 1000, end: 4000})
        .on("response", function (response) {
            // const retrievedLength =  response.headers["content-length"] - start;
            const head = {
                "Content-Range": `bytes ${1000}-${4000}/${
                    response.headers["content-length"]
                }`,
                "Accept-Ranges": "bytes",
                "Content-Length":  response.headers["content-length"],
                "Content-Type": response.headers['content-type'],
            };
            res.writeHead(200, head)
        })
        .on("error", function (err) {
        console.log("Something happend to the stream" + err);
        res.status(500).send(err);
        })
        .on("end", function () {
        console.log("video complete");
        })
        .pipe(res);
    }

}

