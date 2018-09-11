var fs = require('fs'),
    url = require('url'),
    path = require('path'),
    http = require('http');

var root = path.resolve(process.argv[2] || '.');

var server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var filepath = path.join(root, pathname);
    fs.stat(filepath, function (err, stats) {
        if (!err) {
            if(stats.isFile()){
                console.log('200 ' + request.url);
                response.writeHead(200,{"Content-Type":getFileType(pathname)});
                fs.createReadStream(filepath).pipe(response);
            }else if(stats.isDirectory()){
                var defaults = 'index.html';          
                if (fs.existsSync(path.join(filepath,defaults))) {
                    filepath = path.join(filepath,defaults);
                    console.log('200' + request.url);
                    response.writeHead(200);
                    fs.createReadStream(filepath).pipe(response);
                    return;
                }
                console.log('404' + request.url);
                response.writeHead(404);
                response.end('404 Not Found');
            }
        } else {
            console.log('404 ' + request.url);
            response.writeHead(404);
            response.end('404 Not Found');
        }
    });
});

//获取文件类型
function getFileType(pathname){
    switch(path.extname(pathname)){
        case ".html":
            return "text/html";
        case ".js":
            return "text/javascript";
        case ".css":
            return "text/css";
        case ".gif":
            return "image/gif";
        case ".jpg":
            return "image/jpeg";
        case ".png":
            return "image/png";
        default:
            return "application/octet-stream";
    }
}

server.listen(5005);

console.log('Server is running at http://localhost:5005/');