/*var http = require('http');
var server = http.createServer(function (req, res) {


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
        if(req.method == "POST"){
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString(); // Convert Buffer to string
            });

            req.on('end', async () => {
                console.log("Received body: ", body); // Log the raw body
                if (!body) {
                    console.error("No data received");
                    res.writeHead(400, {'Content-Type': 'text/html'});
                    res.end('<h1>Bad Request: No data received</h1>');
                    return;
                }
                try {
                    const userData = JSON.parse(body); // Parse the incoming JSON data
                    console.log("Parsed data: ", userData); // Log parsed data

                    const collection = client.db("yourDatabase").collection("yourCollection");
                    await collection.insertOne(userData); // Insert data
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end('<h1>User registered!</h1>');
                } catch (error) {
                    console.error("Error parsing JSON: ", error);
                    res.writeHead(400, {'Content-Type': 'text/html'});
                    res.end('<h1>Bad Request</h1>');
                }
            });
        }
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

/*-------------------- M o n g o D B   C o n n e c t i o n --------------------*/
/*
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
        // Connect the client to the server    (optional starting in v4.7)
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
*/
var http = require('http');
const { MongoClient, ServerApiVersion } = require('mongodb');
const url = require('url');  // To parse query parameters from the URL

// MongoDB connection URI
const uri = "mongodb+srv://nicoanovak:Xw7us3yzSyxXVGTW@cafeconnect1.pg0cb.mongodb.net/?retryWrites=true&w=majority&appName=cafeconnect1";

// Create a MongoClient with MongoClientOptions
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Create the HTTP server
var server = http.createServer(async function (req, res) {
    // Connect to the MongoDB client
    await client.connect();

    if (req.url == '/signup') {
        if (req.method == "POST") {
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString(); // Convert Buffer to string
            });

            req.on('end', async () => {
                console.log("Received body: ", body); // Log the raw body
                if (!body) {
                    console.error("No data received");
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end('<h1>Bad Request: No data received</h1>');
                    return;
                }
                try {
                    const userData = JSON.parse(body); // Parse the incoming JSON data
                    console.log("Parsed data: ", userData); // Log parsed data

                    const collection = client.db("CC_1st").collection("Users");

                    // Insert data into the collection and get the result
                    const result = await collection.insertOne(userData);

                    // Log the insertedId
                    console.log("Inserted ID: ", result.insertedId);

                    // Send the insertedId in the response
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User registered!', id: result.insertedId }));
                } catch (error) {
                    console.error("Error parsing JSON: ", error);
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end('<h1>Bad Request</h1>');
                }
            });
        }
    }

    // Handle the usersearch route (GET)
    else if (req.url.startsWith('/usersearch') && req.method == "GET") {
        // Parse query parameters from the URL
        const queryObject = url.parse(req.url, true).query;

        try {
            const collection = client.db("CC_1st").collection("Users");

            // Use the query parameters to search for users
            const query = {};

            if (queryObject.email) {
                query.email = queryObject.email;
            }

            if (queryObject.name) {
                query.name = queryObject.name;
            }
            if (queryObject.username) {
                query.username = queryObject.username; // Search by username
            }

            // Find users that match the query
            const users = await collection.find(query).toArray();

            // Send the retrieved users as JSON
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));

        } catch (error) {
            console.error("Error retrieving users: ", error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
    }
});

// Start the server
server.listen(5000);
console.log('Node.js web server at port 5000 is running..');

// MongoDB connection verification
async function run() {
    try {
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB: ", error);
    }
}
run().catch(console.dir);
