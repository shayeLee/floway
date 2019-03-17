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
                response.writeHead(200, {
                    "Content-Type": getFileType(pathname),
                    "Cache-Control": (path.extname(pathname) !== ".js") ? "max-age=315360000" : "no-store"
                });
                fs.createReadStream(filepath).pipe(response);
            }else if(stats.isDirectory()){
                var defaults = 'index.html';          
                if (fs.existsSync(path.join(filepath,defaults))) {
                    filepath = path.join(filepath,defaults);
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
            break;
        case ".js":
            return "text/javascript";
            break;
        case ".css":
            return "text/css";
            break;
        case ".gif":
            return "image/gif";
            break;
        case ".jpg":
            return "image/jpeg";
            break;
        case ".png":
            return "image/png";
            break;
        default:
            return "application/octet-stream";
    }
}

server.listen(3005);

console.log('Server is running at http://localhost:3005/');