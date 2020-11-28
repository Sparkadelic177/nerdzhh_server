
module.exports = { 
    
    chunkSizeStream: (bucketFile, remoteFile, start, end, chunksize, res) => {
        //TODO: need the file to use its size in the content range
        const fs = require('fs');
        remoteFile
        .createReadStream({ start: start , end: end })
        .on("response", (response) => {

            const head = {
            "Content-Range": `bytes ${start}-${end}/${response.headers['content-length']}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4",
            };

            res.writeHead(206, head);
        }) 
        .on("error",  (err) => {
            console.log("Something happend to the stream" + err);
            res.send(err);
          })
        .on("end", () => {
            console.log("video complete");
        })
        .pipe(res);
    },
    entireFileDownload: (bucketFile, remoteFile ,start , res)=> {
        const fs = require('fs');
        remoteFile
        .createReadStream({start:start})
        .on("response", (response) => {
            const head = { 
                "Content-Range": `bytes ${start}-${response.headers['content-length']}/${response.headers['content-length']}`,
                "Accept-Ranges": "bytes",
                "Content-Length": response.headers['content-length'],
                "Content-Type": "video/mp4",
            } 
            res.writeHead(200, head); 
        }) 
        .on("error",  (err) => {
            console.log("Something happend to the stream" + err);
            res.send(err);
        })
        .on("end", () => {
            console.log("video complete");
        })
        .pipe(res);
    }

}

