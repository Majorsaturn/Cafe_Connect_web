var http = require('http');
const { run, signUp, searchUsers, deleteUser, editUser, changeUserStatus, getSubscriptionDetails, viewSubscription, purchaseSubscription } = require('./mongodb');
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
                    const result = signUp(userData); //signup id

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

    /*else if (req.url === "/friends/add" && req.method === "POST") {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const requestData = JSON.parse(body);
                const requesterId = requestData.requesterId;
                const friendId = requestData.friendId;

                // Validate that requesterId and friendId are provided
                if (!requesterId || !friendId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Requester ID and Friend ID are required' }));
                    return;
                }

                // Call the addFriend function to handle the friend request logic
                const result = await addFriend(requesterId, friendId);

                if (result.success) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: result.message }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: result.message }));
                }
            } catch (error) {
                console.error("Error in /friends/add route:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
        });
    }*/


});


// Start the server
server.listen(5000);
console.log('Node.js web server at port 5000 is running..');
