const http = require('http');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { parse } = require('url');
const { run, joinTable, deleteTable, viewTable, makeTable, listFriends, addFriend, removeFriend, blockUser, unblockUser, listBlockedUsers, signUp, searchUsers, deleteUser, editUser, changeUserStatus, userLogin, getSubscriptionDetails, viewSubscription, purchaseSubscription, cancelSubscription, editTable, searchTable, getTableInvite, editSettings } = require('./mongodb');
const cookie = require('cookie'); // If you want to keep using the cookie module for serializing cookies
const url = require('url');  // To parse query parameters from the URL

const secret = 'jebus276';

run();
const staticDir = path.join(__dirname, 'public'); // Public directory where styles.css is located


// Helper to send JSON responses
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// Helper to serve static files
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Not Found</h1>');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// Helper function to parse cookies from the request header
function parseCookies(cookieHeader) {
    return cookieHeader ? cookie.parse(cookieHeader) : {};
}

function verifyToken(req) {
    // Parse cookies from the request headers
    const cookies = parseCookies(req.headers.cookie);

    // Check if the authToken cookie exists
    const token = cookies.authToken;

    if (!token) {
        return null; // No token in cookies
    }

    try {
        // Verify the token and return the decoded data
        return token;
    } catch (error) {
        return null; // Invalid token
    }
}

// Create the HTTP server
var server = http.createServer(async function (req, res) {


    if (req.url === '/') {
        // Redirect root URL to login page
        res.writeHead(302, { 'Location': '/login' });
        res.end();
        return;
    }

    // Serve signup page and script
    if (req.url === '/signup' && req.method === 'GET') {
        serveFile(res, path.join(__dirname, 'signup.html'), 'text/html');
        return;
    } else if (req.url === '/signup.js' && req.method === 'GET') {
        serveFile(res, path.join(__dirname, 'signup.js'), 'application/javascript');
        return;
    }

    // Handle signup POST request
    if (req.url === '/signup' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const userData = JSON.parse(body);
                const result = await signUp(userData);
                sendJSON(res, 200, { message: 'User registered!', id: result.insertedId });
            } catch (error) {
                sendJSON(res, 400, { message: error.message });
            }
        });
        return;
    }

    // Serve login page and script
    if (req.url === '/login' && req.method === 'GET') {
        serveFile(res, path.join(__dirname, 'login.html'), 'text/html');
        return;
    } else if (req.url === '/login.js' && req.method === 'GET') {
        serveFile(res, path.join(__dirname, 'login.js'), 'application/javascript');
        return;
    }

    // Handle login POST request
    if (req.url === '/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const credentials = JSON.parse(body);
                const result = await userLogin(credentials);

                if (result.token) {
                    const token = result.token;
                    const cookieHeader = cookie.serialize('authToken', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 12 * 60 * 60, // 12 hours
                        path: '/',
                    });

                    res.setHeader('Set-Cookie', cookieHeader);
                    sendJSON(res, 200, result);
                } else {
                    sendJSON(res, 401, { message: 'Invalid credentials' });
                }
            } catch (error) {
                sendJSON(res, 500, { message: error.message });
            }
        });
        return;
    }

    if (req.url.startsWith('/table')) {

        // Join table route (POST request)
        if (req.url.startsWith('/table/join') && req.method === "POST") {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                const tokenData = verifyToken(req);  // Verify token to authenticate user
                if (!tokenData) {
                    sendJSON(res, 401, { message: 'Unauthorized: Invalid token' });
                    return;  // Prevent further execution
                }

                const { tableId } = JSON.parse(body);  // Extract the table ID from the request body

                if (!tableId) {
                    sendJSON(res, 400, { message: 'Bad Request: Table ID is required' });
                    return;
                }

                try {
                    // Attempt to join the table
                    const result = await joinTable(tokenData, tableId);
                    if (result.success) {
                        sendJSON(res, 200, { message: 'Successfully joined the table' });
                    } else {
                        sendJSON(res, 400, { message: result.message });
                    }
                } catch (error) {
                    console.error("Error joining table: ", error);
                    sendJSON(res, 500, { message: 'Internal Server Error' });
                }
            });
            return;  // Ensure no further code executes after response is sent
        }


        // Serve table creation page
        if (req.url === '/table/search?' && req.method === 'GET') {
            serveFile(res, path.join(__dirname, 'searchTable.html'), 'text/html');
            return;  // Ensure no further code executes after response is sent
        } else if (req.url === '/table/searchTable.js' && req.method === 'GET') {
            serveFile(res, path.join(__dirname, 'searchTable.js'), 'application/javascript');
            return;  // Ensure no further code executes after response is sent
        }

        // Search table route
        if (req.url.startsWith('/table/search') && req.method === "GET") {
            // Parse query parameters
            const queryObject = parse(req.url, true).query;

            // If no query parameters are provided, return a bad request response
            if (Object.keys(queryObject).length === 0) {
                sendJSON(res, 400, { message: 'No search parameters provided' });
                return;
            }

            try {
                // Call the searchTable function with the queryObject
                const table = await searchTable(queryObject);

                // Send back the search results
                sendJSON(res, 200, table);
            } catch (error) {
                console.error("Error retrieving table: ", error);
                sendJSON(res, 500, { message: 'Internal Server Error' });
            }
            return;  // Ensure no further code executes after the response is sent
        }

        // Get table invite route
        if (req.url.startsWith('/table/invite') && req.method === "GET") {
            const queryObject = parse(req.url, true).query;
            try {
                const table = await getTableInvite(queryObject);
                sendJSON(res, 200, table);
            } catch (error) {
                console.error("Error retrieving table invite: ", error);
                sendJSON(res, 500, { message: 'Internal Server Error' });
            }
            return;  // Ensure no further code executes after response is sent
        }

        // View table route
        if (req.url === '/table' && req.method === "GET") {
            const queryObject = parse(req.url, true).query;
            try {
                const table = await viewTable(queryObject);
                sendJSON(res, 200, table);
            } catch (error) {
                console.error("Error retrieving table: ", error);
                sendJSON(res, 500, { message: 'Internal Server Error' });
            }
            return;  // Ensure no further code executes after response is sent
        }

        // Serve table creation page
        if (req.url === '/table/create' && req.method === 'GET') {
            serveFile(res, path.join(__dirname, 'table.html'), 'text/html');
            return;  // Ensure no further code executes after response is sent
        } else if (req.url === '/table/makeTable.js' && req.method === 'GET') {
            serveFile(res, path.join(__dirname, 'makeTable.js'), 'application/javascript');
            return;  // Ensure no further code executes after response is sent
        }
        else if (req.url === '/table/styles.css' && req.method === 'GET') {
            serveFile(res, path.join(staticDir, 'styles.css'), 'text/css');
            return;
        }

        // Create table route (POST request)
        if (req.url.startsWith('/table/create') && req.method === "POST") {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                const tokenData = verifyToken(req);
                console.log(tokenData)
                if (!tokenData) {
                    sendJSON(res, 401, { message: 'Unauthorized: Invalid token' });
                    return;  // Prevent further execution
                }

                try {
                    const tableData = JSON.parse(body);
                    const result = await makeTable(tokenData, tableData);
                    if (result.acknowledged) {
                        sendJSON(res, 200, { message: 'Table created!', id: result.insertedId });
                    } else {
                        sendJSON(res, 400, { message: 'Table creation failed.' });
                    }
                } catch (error) {
                    console.error("Error creating table: ", error);
                    sendJSON(res, 400, { message: 'Bad Request' });
                }
            });
            return;  // Ensure no further code executes after response is sent
        }



        // Delete table route (DELETE request)
        if (req.url.startsWith('/table/delete') && req.method === "DELETE") {
            const queryObject = parse(req.url, true).query;
            try {
                const deleted = await deleteTable(queryObject);
                sendJSON(res, 200, deleted);
            } catch (error) {
                console.error("Error deleting table: ", error);
                sendJSON(res, 500, { message: 'Internal Server Error' });
            }
            return;  // Ensure no further code executes after response is sent
        }

        // Update table settings route (PUT request)
        if (req.url.startsWith('/table/settings') && req.method === "PUT") {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                const tokenData = verifyToken(req);
                if (!tokenData) {
                    sendJSON(res, 401, { message: 'Unauthorized: Invalid token' });
                    return;  // Prevent further execution
                }

                try {
                    const tableData = JSON.parse(body);
                    const result = await editTable(tokenData, tableData);
                    if (result.modifiedCount === 0) {
                        sendJSON(res, 404, { message: 'Table not found or no changes made.' });
                    } else {
                        sendJSON(res, 200, { message: 'Table updated successfully.' });
                    }
                } catch (error) {
                    console.error("Error updating table: ", error);
                    sendJSON(res, 400, { message: 'Bad Request' });
                }
            });
            return;  // Ensure no further code executes after response is sent
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
            const authHeader = req.headers['authorization'];

            if (authHeader) {
                const token = authHeader;
                try {
                    const userData = JSON.parse(body);

                    // Call the updateUser function from mongodb.js
                    const result = await editUser(token, userData);

                    // Handle the result of the update
                    if (result.modifiedCount === 0) {
                        res.writeHead(404, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({message: 'User not found or no changes made.'}));
                    } else {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({message: 'User details updated successfully.'}));
                    }
                } catch (error) {
                    console.error("Error parsing JSON: ", error);
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({message: 'Bad Request'}));
                    return;
                }
            }
            else {
                // If the Authorization header is missing
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: "Authorization token is missing" }));
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

    else if (req.url.startsWith('/profile/settings') && req.method == "PUT") {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const authHeader = req.headers['authorization'];

            if (authHeader) {
                const token = authHeader;
                try {
                    const settingsData = JSON.parse(body);

                    // Call the updateUser function from mongodb.js
                    const result = await editSettings(token, settingsData);

                    // Handle the result of the update
                    if (result.modifiedCount === 0) {
                        res.writeHead(404, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({message: 'Settings not found or no changes made.'}));
                    } else {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({message: 'Settings details updated successfully.'}));
                    }
                } catch (error) {
                    console.error("Error parsing JSON: ", error);
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({message: 'Bad Request'}));
                }
            }
            else {
                // If the Authorization header is missing
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: "Authorization token is missing" }));
            }
        })
    }

    else if(req.url.startsWith('/friends') && (req.method === "POST" || req.method === "GET" || req.method === "DELETE")){
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
                else if (req.url.startsWith('/friends/remove') && req.method === "DELETE") {
                            const parsedBody = JSON.parse(body);
                            const friendUser = parsedBody.username;

                            try {
                                // Call removeFriend function
                                const result = await removeFriend(token, friendUser);

                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(result));
                            } catch (error) {
                                console.error("Error in /friends/remove route:", error);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
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

    else if (req.url.startsWith('/users/block') && req.method === "POST") {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const authHeader = req.headers['authorization'];

            if (authHeader) {
                const token = authHeader;
                const parsedBody = JSON.parse(body);
                const blockUsername = parsedBody.username;

                try {
                    // Call blockUser function
                    const result = await blockUser(token, blockUsername);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                } catch (error) {
                    console.error("Error in /users/block route:", error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                }
            } else {
                // If the Authorization header is missing
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: "Authorization token is missing" }));
            }
        });
    }

    else if (req.url === '/users/unblock' && req.method === "DELETE") {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });

        req.on('end', async () => {
            const authHeader = req.headers['authorization'];

            if (authHeader) {
                const token = authHeader;

                try {
                    const parsedBody = JSON.parse(body);
                    const blockedUser = parsedBody.username;

                    // Check if blockedUser was provided
                    if (!blockedUser) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: "Blocked user username is required" }));
                        return;
                    }

                    const result = await unblockUser(token, blockedUser);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                } catch (error) {
                    console.error("Error in /users/unblock route:", error);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                }
            } else {
                // If the Authorization header is missing
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: "Authorization token is missing" }));
            }
        });
    }

    else if (req.url === '/users/blockedlist' && req.method === "GET") {
        const authHeader = req.headers['authorization'];

        if (authHeader) {
            const token = authHeader;

            try {
                const result = await listBlockedUsers(token);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (error) {
                console.error("Error in /users/blocked route:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        } else {
            // If the Authorization header is missing
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: "Authorization token is missing" }));
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
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Authorization token is required' }));
            return;
        }

        const token = authHeader.split(' ')[1]; // Extract the token

        try {
            const decodedToken = jwt.verify(token, secret); // Verify the token
            const userId = decodedToken.userId; // Get the userId from the token

            const result = await viewSubscription(userId); // Call the viewSubscription function

            if (result.success) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ subscription: result.subscription })); // Return the subscription details
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: result.message })); // Handle error message
            }
        } catch (error) {
            console.error("Error in /subscription/view route:", error);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid token' }));
        }
    }

    else if (req.url === "/subscription/purchase" && req.method === "POST") {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const authHeader = req.headers['authorization'];

            if (!authHeader) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Authorization token is required' }));
                return;
            }

            try {
                const requestData = JSON.parse(body);
                const subscriptionId = requestData.subscriptionId;

                if (!subscriptionId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Subscription ID is required' }));
                    return;
                }

                const token = authHeader;

                try {
                    const decodedToken = jwt.verify(token, secret);  // Log any JWT errors here
                    const userId = decodedToken.userId;

                    const result = await purchaseSubscription(userId, subscriptionId);

                    if (result.success) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Subscription purchased successfully' }));
                    } else {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: result.message }));
                    }
                } catch (jwtError) {
                    console.error("JWT Verification failed:", jwtError.message);
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Invalid token' }));
                }
            } catch (error) {
                console.error("Error in /subscription/purchase route parsing or handling:", error.message);
                console.error(error.stack);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
        });
    }



    else if (req.url === "/subscription/cancel" && req.method === "POST") {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });

        req.on('end', async () => {
            try {
                const authHeader = req.headers['authorization'];

                if (!authHeader) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Authorization token is missing' }));
                    return;
                }

                const token = authHeader;
                const decodedToken = jwt.verify(token, secret); // Verify the token
                const userId = decodedToken.userId;

                const result = await cancelSubscription(userId);

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
    }

    // Serve other static files (CSS, JS, etc.)
    const ext = path.extname(req.url);
    const contentType = ext === '.css' ? 'text/css' :
        ext === '.js' ? 'application/javascript' :
            ext === '.html' ? 'text/html' : 'text/plain';

    serveFile(res, path.join(staticDir, req.url), contentType);

});

// Start the server
server.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
console.log('Node.js web server at port 5000 is running..');


