var http = require('http');
var server = http.createServer(function (req, res) {
    res.statusCode = 200



    if (req.url == '/') {

        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>GET, Method!</h1>')
        }
        else if(req.method == "POST"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>POST, Method!</h1>')
        }
    }
    else if(req.url == "/student"){
        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>GET, Method!</h1>')
        }
        else if(req.method == "POST"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>POST, Method!</h1>')
        }
    }
    else if(req.url == "/major"){
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>GET, Method!</h1>')
        }
        else if(req.method == "POST"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>POST, Method!</h1>')
        }
    }
    else if(req.url == "/Education"){
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>GET, Method!</h1>')
        }
        else if(req.method == "POST"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>POST, Method!</h1>')
        }
    }
    else
        res.end('Invalid Request!');

})

server.listen(5000);

console.log('node.js web server at port 5000 is running..')