const http = require('http');
const { run, deleteTable, viewTable, makeTable, listFriends, addFriend, signUp, searchUsers, deleteUser, editUser, changeUserStatus, userLogin, getSubscriptionDetails, viewSubscription, purchaseSubscription } = require('./mongodb');
const url = require('url');  // To parse query parameters from the URL
const secret = 'jebus276'

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

                if (!body) {
                    console.error("No data received");
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end('<h1>Bad Request: No data received</h1>');
                    return;
                }
                console.log("Received body: ", body); // Log the raw body
                try {
                    const userData = JSON.parse(body); // Parse the incoming JSON data
                    console.log("Parsed data: ", userData); // Log parsed data

                    // Insert data into the collection and get the result
                    const result = await signUp(userData); //signup id

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

    else if(req.url.startsWith('/login') && req.method == "POST"){

        const queryObject = url.parse(req.url, true).query;
        const result = await userLogin(queryObject);
        if(!result){
            throw new Error("Token generation failed");
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    }

    else if(req.url.startsWith('/friends') && (req.method === "POST" || req.method === "GET")){
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });

        req.on('end', async () => {
            const authHeader = req.headers['authorization'];

            if(authHeader){
                const token = authHeader;
                let friendUser = null;
                if(req.method === "POST"){
                    const parsedBody = JSON.parse(body);
                    friendUser = parsedBody.username;

                    try{
                    const result = await addFriend(token, friendUser);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                    }
                    catch(error){
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                    }
                }
                else if(req.method === "GET"){
                    try{
                        const result = await listFriends(token);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(result));
                    }
                    catch(error){
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: error.message }));
                    }
                }
            }
            else {
                // If the Authorization header is missing
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: "Authorization token is missing" }));
            }
        });
    }
    else if(req.url.startsWith('/table')){

        if(req.method === "GET"){
            const queryObject = url.parse(req.url, true).query;

            try {
                // Call the searchUsers function from mongodb.js with the query parameters
                const table = await viewTable(queryObject);

                // Send the retrieved users as JSON
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(table));

            } catch (error) {
                console.error("Error retrieving users: ", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
        }
        else if(req.url.startsWith('/table/create') && req.method === "POST") {
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                if (!body) {
                    console.error("No data received");
                    res.writeHead(400, {'Content-Type': 'text/html'});
                    res.end('<h1>Bad Request: No data received</h1>');
                    return;
                }
                console.log("Received body: ", body);

                const authHeader = req.headers['authorization'];

                if (authHeader) {

                }
                const token = authHeader;
                const tableData = JSON.parse(body); // Parse the incoming JSON data
                console.log("Parsed data: ", tableData);
                try {
                    const result = await makeTable(token, tableData);
                    if(result.acknowledged) {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({message: 'Table created!', id: result.insertedId}));
                    }
                    else{
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({message: 'Table creation failed.'}));
                    }
                } catch (error) {
                    console.error("Error processing request: ", error);
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({message: 'Bad Request'}));
                }
            })
        }
        else if(req.url.startsWith('/table/delete') && req.method === "DELETE"){
            const queryObject = url.parse(req.url, true).query;

            try {
                const deleted = await deleteTable(queryObject);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(deleted));

            } catch (error) {
                console.error("Error retrieving users: ", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
        }
    }
    else if (req.url === "/subscription" && req.method === "GET") {
        try {
            const result = await getSubscriptionDetails();

            if (result.success) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.data));
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: result.message }));
            }
        } catch (error) {
            console.error("Error in /subscription route:", error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }

    else if (req.url.startsWith("/profile/settings/subscription") && req.method === "GET") {
        // Parse query parameters to get the userId
        const queryObject = url.parse(req.url, true).query;

        // Validate that a userId is provided
        if (!queryObject.userId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User ID is required to view subscription details.' }));
            return;
        }

        try {
            // Call the viewSubscription function to get subscription details
            const result = await viewSubscription(queryObject.userId);

            if (result.success) {
                // Send subscription details as JSON
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Subscription details retrieved successfully.', subscription: result.data }));
            } else {
                // Subscription not found
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: result.message }));
            }
        } catch (error) {
            console.error("Error retrieving subscription: ", error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Internal Server Error' }));
        }
    }

    else if (req.url.startsWith("/subscription/purchase") && req.method === "POST") {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { userId, subscriptionDetails } = JSON.parse(body);

                // Check if both userId and subscriptionDetails are provided
                if (!userId || !subscriptionDetails) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'userId and subscriptionDetails are required' }));
                    return;
                }

                const result = await purchaseSubscription(userId, subscriptionDetails);

                // Send response based on the result
                if (result.success) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: result.message }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: result.message }));
                }
            } catch (error) {
                console.error("Error handling activateSubscription route:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
        });
    }

    /*else if (req.url === "/subscription/cancel" && req.method === "POST") {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });

        req.on('end', async () => {
            try {
                const requestData = JSON.parse(body);
                const userId = requestData.userId; // Expecting userId in the body

                if (!userId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User ID is required' }));
                    return;
                }

                const result = await cancelUserSubscription(userId);

                if (result.success) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Subscription cancelled successfully' }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: result.message }));
                }
            } catch (error) {
                console.error("Error in /subscription/cancel route:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
        });
    }*/

});

// Start the server
server.listen(5000);
console.log('Node.js web server at port 5000 is running..');


