const PORT = 8444;

//var server = require('https'),
var server = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

function serverHandler(request, response) {
    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);

    fs.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + filename + '\n');
            response.end();
            return;
        }

        fs.readFile(filename, 'binary', function (err, file) {
            if (err) {
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.write(err + '\n');
                response.end();
                return;
            }

            var contentType;

            if (filename.indexOf('.js') !== -1) {
                contentType = 'application/javascript';
            }

            if (contentType) {
                response.writeHead(200, {
                    'Content-Type': contentType
                });
            } else response.writeHead(200);

            response.write(file, 'binary');
            response.end();
        });
    });
}

var config = {
    "socketURL": "/",
    "dirPath": "",
    "homePage": "/",
    "socketMessageEvent": "RTCMultiConnection-Message",
    "socketCustomEvent": "RTCMultiConnection-Custom-Message",
    "port": PORT,
    "enableLogs": false,
    //"isUseHTTPs": true,
    "isUseHTTPs": false,
    //"ssl_key": "ssl/privkey.pem",
    //"ssl_cert": "ssl/fullchain.pem"
};

var serverOptions = {
    //key: fs.readFileSync(config.ssl_key),
    //cert: fs.readFileSync(config.ssl_cert)
    //ca: fs.readFileSync(config.ssl_cabundle)
};

var RTCMultiConnectionServer = require('rtcmulticonnection-server');
var ioServer = require('socket.io');

var httpApp = server.createServer(serverOptions, serverHandler);

RTCMultiConnectionServer.beforeHttpListen(httpApp, config);
httpApp = httpApp.listen(process.env.PORT || PORT, process.env.IP || "0.0.0.0", function () {
    RTCMultiConnectionServer.afterHttpListen(httpApp, config);
});

// --------------------------
// socket.io codes goes below
var rooms = {};

ioServer(httpApp).on('connection', function (socket) {
    RTCMultiConnectionServer.addSocket(socket, config);

    socket.on('userConnection', function (data) {
        socket.join(data.tid);
    });

    socket.on('ticketUpdate', function (data) {
        socket.to(data.tid).emit('triggerUpdate', data);
    });

    socket.on('checklistUpdate', function (data) {
        socket.to(data.tid).emit('triggerUpdate', data);
    });

    socket.on('ticketAdd', function (data) {
        socket.to(data.tid).emit('triggerUpdate', data);
    });

    socket.on('flowUpdate', function (data) {
        socket.to(data.tid).emit('triggerUpdate', data);
    });

    socket.on('projectUpdate', function (data) {
        socket.to(data.tid).emit('triggerUpdate', data);
    });
});

