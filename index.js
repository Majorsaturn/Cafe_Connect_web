var http = require('http');
var server = http.createServer(function (req, res) {


    if (req.url == '/') {
        // res.write('<html><body><p>Comp Sci.</p></body></html>');
        //response header
        if(req.method == "GET"){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('<h1>This is the Home Page</h1>')
            database.find({test: 1})
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
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://nicoanovak:Xw7us3yzSyxXVGTW@cafeconnect1.pg0cb.mongodb.net/?retryWrites=true&w=majority&appName=cafeconnect1";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);
const database = client.db('cafeconnect1')