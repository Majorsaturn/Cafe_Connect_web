var http = require('http');
var server = http.createServer(function (req, res) {
    res.statusCode = 200



    if (req.url == '/') {
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>This is the Home Page</h1>')
        }
        else if(req.method == "POST"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>you entered something on the home page</h1>')
        }
    }
    else if(req.url == "/login"){
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>Login Screen</h1>')
        }
        else if(req.method == "POST"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>Login Enter</h1>')
        }
    }
    else if(req.url == "/signup"){
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
    else if(req.url == "/profile/settings/profilesettings"){
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
    else if(req.url == "/profile/settings/deleteuser"){
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "DELETE") {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>DELETE, Method!</h1>')
        }
    }
    else if(req.url == "/friends"){
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
    else if(req.url == "/friends/search"){
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>GET, Method!</h1>')
        }
    }
    else if(req.url == "/friends/searchbyid"){
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>GET, Method!</h1>')
        }
    }
    else if(req.url == "/profile/settings/profilesettings/userstatus"){
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
    else if(req.url == "/chatroom"){
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>GET, Method!</h1>')
        }
    }
    else if(req.url == "/chatroom/create"){
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
    else if(req.url == "/chatroom/deletechatroom"){
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "DELETE") {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>DELETE, Method!</h1>')
        }
    }
    else if(req.url == "/searchchatroombyname"){
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>GET, Method!</h1>')
        }
    }
    else if(req.url == "/searchchatroombyid"){
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>GET, Method!</h1>')
        }
    }
    else if(req.url == "/chatroom/getinvite"){
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>GET, Method!</h1>')
        }
    }
    else if(req.url == "/chatroom/settings"){
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
    else if(req.url == "/subscription"){
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
    else if(req.url == "/subscription/purchase"){
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
    else if(req.url == "/subscription/cancel"){
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
    else if(req.url == "/profile/settings"){
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
    else if(req.url == "/friends/blocks"){
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
    else if(req.url == "/calendar"){
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>GET, Method!</h1>')
        }
    }
    else if(req.url == "/calendar/eventadd"){
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
    else if(req.url == "/calendar/eventedit"){
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
    else if(req.url == "/calendar/eventdelete"){
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "DELETE"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>DELETE, Method!</h1>')
        }
    }
    else
        res.end('Invalid Request!');

})

server.listen(5000);

console.log('node.js web server at port 5000 is running..')