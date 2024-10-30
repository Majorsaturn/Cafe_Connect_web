// MongoDB connection URI
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = 'jebus276'
const uri = "mongodb+srv://nicoanovak:Xw7us3yzSyxXVGTW@cafeconnect1.pg0cb.mongodb.net/?retryWrites=true&w=majority&appName=cafeconnect1";
// Create a MongoClient with MongoClientOptions
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// MongoDB connection verification
async function run() {
    try {
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Connected to MongoDB!");
    } catch (error) {
        await client.close();
        console.error("Error connecting to MongoDB: ", error);
    }
}


async function signUp(userData){
    // Insert data into the collection and get the result
    Users = client.db("CC_1st").collection("Users");
    const { password, ...rest } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userExists = await Users.findOne({ username: rest.username });

    if (userExists) {
        throw new Error('User already exists');
    }

    result = await Users.insertOne({ ...rest, password: hashedPassword }); //signup id
    console.log("Insert result:", result);
    return result;
}

// Function to search for users based on query parameters
async function searchUsers(queryObject) {
    const collection = client.db("CC_1st").collection("Users");
    const query = {};

    if (queryObject.email) {
        query.email = queryObject.email;
    }
    else if (queryObject.name) {
        query.name = queryObject.name;
    }
    else if (queryObject.username) {
        query.username = queryObject.username;
    }
    else if (queryObject.id) {
        query._id = new ObjectId(queryObject.id);
    }

    // Find users that match the query
    const users = await collection.findOne(query)
    return users;
}

async function deleteUser(queryObject) {
    const collection = client.db("CC_1st").collection("Users");
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
    if (queryObject.id) {
        query._id = new ObjectId(queryObject.id); // Search by id
    }

    const id = new ObjectId(query._id);
    // Delete the user that matches the query
    const deleted = await collection.deleteOne(query);
    if (deleted.deletedCount > 0) {
        console.log(`Deleted user with ID: ${id}`); // Log the deleted user's ID
    }
    return deleted;
}

async function editUser(queryObject, userData) {
    const Users = client.db("CC_1st").collection("Users");
    const updateCriteria = {};
    const updateData = {};

    // Prepare the criteria for finding the user
    if (queryObject.id) {
        try {
            updateCriteria._id = new ObjectId(queryObject.id);  // Convert string id to ObjectId
        } catch (error) {
            console.error("Invalid ObjectId format: ", error);
            throw new Error('Invalid ID format');  // This error should bubble up to index.js
        }
    }
    if (queryObject.username) {
        updateCriteria.username = queryObject.username;  // If username is provided, use it to search
    }

    // Prepare the update data (if provided)
    if (userData.name) {
        updateData.name = userData.name;
    }
    if (userData.email) {
        updateData.email = userData.email;
    }
    if (userData.username) {
        updateData.username = userData.username;
    }

    console.log('Update Criteria:', updateCriteria);
    console.log('Update Data:', updateData);

    // Perform the update
    const result = await Users.updateOne(updateCriteria, { $set: updateData });
    return result;
}

async function changeUserStatus(queryObject, requestData) {
    const collection = client.db("CC_1st").collection("Users");
    const updateCriteria = { username: queryObject.username };
    const updateData = { status: requestData.status };

    // Perform the update
    const result = await collection.updateOne(updateCriteria, { $set: updateData });
    return result;
}

async function userLogin(queryObject){
    const collection = client.db("CC_1st").collection("Users");
    const query = {
        username: queryObject.username,
        password: queryObject.password
    };
    const user = await collection.findOne({ username: query.username });
    if(user){
        const isPasswordMatch = await bcrypt.compare(query.password, user.password);
        if (isPasswordMatch) {
            const token = jwt.sign(
                { userId: user._id, username: user.username },
                secret, // Replace with a secure key, ideally from an environment variable
                { expiresIn: '1h' } // Token expires in 1 hour, adjust as needed
            );
            console.log(jwt.verify(token, secret));
            console.log(token);
            return { token }
        } else {
            res.status(400).json({error: "incorrect password"});
        }
    }
    else{
        return false;
        res.status(400).json({error: "username does not match"});
    }
}

async function addFriend(token, friendUser){

    try{
        const decodedToken = jwt.verify(token, secret);
        const userId = new ObjectId(decodedToken.userId);

        const collection = client.db("CC_1st").collection("Users");
        const exists = await collection.findOne({username: friendUser});
        if(!exists){
            console.log(`Failed to add friend ${friendUser}.`);
            return { success: false, message: `Failed to add friend ${friendUser}.` };
        }
        const result = await collection.updateOne(
            { _id: userId },
            { $addToSet: {friends: friendUser} }
            );

        if (result.modifiedCount > 0) {
            console.log(`Friend ${friendUser} added successfully!`);
            return { success: true, message: `Friend ${friendUser} added successfully!` };
        } else {
            console.log(`Failed to add friend ${friendUser}.`);
            return { success: false, message: `Failed to add friend ${friendUser}.` };
        }
    }
    catch (error) {
        console.error("Error adding friend:", error);
        return {success: false, error: "Failed to authenticate or add friend."};
    }
}

async function listFriends(token){
    try {
        const collection = client.db("CC_1st").collection("Users");
        const decodedToken = jwt.verify(token, secret);
        const userId = new ObjectId(decodedToken.userId);

        const friendList = await collection.findOne(
            { _id: userId },
            { projection: {friends: 1}}
            );
        return friendList.friends;
    }
    catch(error){
        console.error("Error loading friends:", error);
        return {success: false, error: "Failed to load friends."};
    }
}

async function makeTable(token, tableData){
    try{
        const Tables = client.db("CC_1st").collection("Tables");
        const decodedToken = jwt.verify(token, secret);
        const userId = new ObjectId(decodedToken.userId);
        const username = decodedToken.username;

        tableData.members = [username];
        tableData.createdby = userId;

        const { ...all } = tableData;

        result = await Tables.insertOne({ ...all });
        console.log("Insert result:", result);
        return result;
    }
    catch(error){
        console.error("Error creating chatroom:", error);
        return {success: false, error: "Failed to create chatroom."};
    }
}

async function viewTable(queryObject) {
    try {
        const Tables = client.db("CC_1st").collection("Tables");

        const query = {
            _id: new ObjectId(queryObject.id)
        };

        const table = await Tables.findOne(query);
        return table;
    }
    catch (error) {
        console.error("Error finding chatroom:", error);
        return {success: false, error: "Failed to create chatroom."};
    }
}
async function getSubscriptionDetails() {
    try {
        const collection = client.db("CC_1st").collection("Subscriptions");

        // Fetch all subscription plans
        const subscriptionDetails = await collection.find().toArray();

        return { success: true, data: subscriptionDetails };
    } catch (error) {
        console.error("Error retrieving subscription details:", error);
        return { success: false, message: 'Internal Server Error' };
    }
}

async function viewSubscription(userId) {
    const collection = client.db("CC_1st").collection("Users");

    // Find the user with the specified userId and retrieve the subscription data
    const user = await collection.findOne(
        { _id: new ObjectId(userId) },
        { projection: { subscription: 1 } } // Only retrieve the subscription field
    );

    // Check if user or subscription data exists
    return user && user.subscription
        ? { success: true, data: user.subscription }
        : { success: false, message: 'Subscription not found for this user' };
}

async function purchaseSubscription(userId, subscriptionDetails) {
    try {
        const collection = client.db("CC_1st").collection("Users");

        // Validate userId format
        if (!ObjectId.isValid(userId)) {
            return { success: false, message: 'Invalid user ID format' };
        }

        // Update the user's subscription details
        const result = await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { subscription: subscriptionDetails } }
        );

        if (result.modifiedCount > 0) {
            return { success: true, message: 'Subscription activated successfully' };
        } else {
            return { success: false, message: 'User not found' };
        }
    } catch (error) {
        console.error("Error in activateSubscription:", error);
        return { success: false, message: 'Internal Server Error' };
    }
}

/*async function cancelSubscription(userId) {
    try {
        const collectionUsers = client.db("CC_1st").collection("Users");
        const collectionSubscriptions = client.db("CC_1st").collection("Subscriptions");

        // Find the user in the Users collection
        const user = await collectionUsers.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // Check if the user has an active subscription
        if (!user.subscriptionId) {
            return { success: false, message: 'No active subscription to cancel' };
        }

        // Find the subscription in the Subscriptions collection
        const subscription = await collectionSubscriptions.findOne({ _id: new ObjectId(user.subscriptionId) });

        if (!subscription) {
            return { success: false, message: 'Subscription not found' };
        }

        // Update the user's subscriptionId to null (or remove subscription information)
        await collectionUsers.updateOne({ _id: new ObjectId(userId) }, { $set: { subscriptionId: null } });

        // Optionally, you can also update the subscription status (if you have a status field)
        await collectionSubscriptions.updateOne({ _id: new ObjectId(user.subscriptionId) }, { $set: { status: 'Cancelled' } });

        return { success: true };
    } catch (error) {
        console.error("Error in cancelUserSubscription:", error);
        return { success: false, message: 'Error cancelling subscription' };
    }
}*/

module.exports = {
    run,
    signUp,
    searchUsers,
    deleteUser,
    editUser,
    changeUserStatus,
    userLogin,
    addFriend,
    listFriends,
    makeTable,
    viewTable,
    getSubscriptionDetails,
    viewSubscription,
    purchaseSubscription,
    //cancelSubscription,
}