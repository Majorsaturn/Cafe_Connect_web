const http = require('http');
const { run, signUp, searchUsers, deleteUser, editUser, changeUserStatus } = require('./mongodb');
const url = require('url');  // To parse query parameters from the URL


run();

// Create the HTTP server
var server = http.createServer(async function (req, res) {

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

                    // Insert data into the collection and get the result
                    const result = await signUp(userData); //signup id

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

    else if (req.url.startsWith('/usersearch') && req.method == "GET") {
        // Parse query parameters from the URL
        const queryObject = url.parse(req.url, true).query;

        try {
            // Call the searchUsers function from mongodb.js with the query parameters
            const users = await searchUsers(queryObject);

            // Send the retrieved users as JSON
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));

        } catch (error) {
            console.error("Error retrieving users: ", error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }

    else if(req.url.startsWith("/profile/settings/deleteuser") && req.method =='DELETE') {
        // Parse query parameters from the URL
        const queryObject = url.parse(req.url, true).query;

        try {
            // Find users that match the query
            const deleted = await deleteUser(queryObject);

            // Send the retrieved users as JSON
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(deleted));

        } catch (error) {
            console.error("Error retrieving users: ", error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }

    else if (req.url.startsWith("/profile/settings/edituser") && req.method === "PUT") {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const userData = JSON.parse(body);
                const queryObject = url.parse(req.url, true).query;

                // Validate that either an ID or username is provided
                if (!queryObject.id && !queryObject.username) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Please provide an ID or username to edit a user.' }));
                    return;
                }

                // Call the updateUser function from mongodb.js
                const result = await editUser(queryObject, userData);

                // Handle the result of the update
                if (result.modifiedCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User not found or no changes made.' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User details updated successfully.' }));
                }
            } catch (error) {
                console.error("Error parsing JSON: ", error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Bad Request' }));
            }
        });
    }

    else if (req.url.startsWith("/profile/settings/userstatus") && req.method === "POST") {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const requestData = JSON.parse(body);  // Parse the request body
                const queryObject = url.parse(req.url, true).query;

                // Validate that the status is provided
                if (!requestData.status || !queryObject.username) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Please provide a username and a status.' }));
                    return;
                }

                // Validate the status value
                const validStatuses = ["Online", "Do Not Disturb", "Offline"];
                if (!validStatuses.includes(requestData.status)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Invalid status value. Must be Online, Do Not Disturb, or Offline.' }));
                    return;
                }

                // Call the updateUserStatus function from mongodb.js
                const result = await changeUserStatus(queryObject, requestData);

                // Check if a document was updated
                if (result.modifiedCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User not found or status not changed.' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User status updated successfully.' }));
                }
            } catch (error) {
                console.error("Error processing request: ", error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Bad Request' }));
            }
        });
    }

    else if (req.url.startsWith('/profile/settings') && req.method == "POST") {
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
            const userDoc = collection.findOne({username: query.username});
            const userId = new ObjectId(userDoc.id);
            // Find users that match the query
            const userUpdate = await collection.updateOne(userId, {$set: updateData}).toArray();

            // Send the retrieved users as JSON
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));

        } catch (error) {
            console.error("Error retrieving users: ", error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }
    /*
    else if(req.url.startsWith('/login') && req.method == "POST"){
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });



        const queryObject = url.parse(req.url, true).query;
    }
     */
    else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
    }
});

// Start the server
server.listen(5000);
console.log('Node.js web server at port 5000 is running..');


