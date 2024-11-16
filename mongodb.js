// MongoDB connection URI
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = 'jebus276'
const uri = "mongodb+srv://nicoanovak:Xw7us3yzSyxXVGTW@cafeconnect1.pg0cb.mongodb.net/?retryWrites=true&w=majority&appName=cafeconnect1";

// default user settings
const defaultSettings = {
    input: "test mic",
    output: "test speaker",
    light_dark: true,
    notifications: false
}


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
    const Users = client.db("CC_1st").collection("Users");
    const Settings = client.db("CC_1st").collection("User_Settings");
    const updateCriteria = {};

    const userExists = await Users.findOne({ username: userData.username });
    if (userExists) {
        throw new Error('User already exists');
    }

    const settingsResult = await Settings.insertOne(defaultSettings);
    console.log(settingsResult.insertedId);
    userData.settingsId = settingsResult.insertedId;

    const { password, ...rest } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await Users.insertOne({ ...rest, password: hashedPassword }); //signup id
    console.log("Insert result:", result);

    updateCriteria._id = settingsResult.insertedId;
    const updateData = {
        userId: result.insertedId
    };
    console.log(updateData);
    await Settings.updateOne(updateCriteria, { $set: updateData });

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
                secret,
                { expiresIn: '12h' } // Token expires in 12 hours
            );
            console.log(jwt.verify(token, secret));
            console.log(token);
            return { token };
        } else {
            return { message: "Incorrect password" };
        }
    }
    else{
        return { message: "Username does not exist" };
    }
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
    const Users = client.db("CC_1st").collection("Users");
    const Settings = client.db("CC_1st").collection("User_Settings");
    const query = {
        _id: new ObjectId(queryObject.id),
    };
    const querySettings = {
        userId: new ObjectId(queryObject.id),
    };

    // Delete the user that matches the query along with the settings
    const deleted = await Users.deleteOne(query);
    const deletedSettings = await Settings.deleteOne(querySettings);
    if (deleted.deletedCount > 0) {
        console.log(`Deleted user with ID: ${query._id} along with their settings`); // Log the deleted user's ID
    }
    return deleted;
}

async function editUser(token, userData) {
    const Users = client.db("CC_1st").collection("Users");
    const decodedToken = jwt.verify(token, secret);
    const updateData = {};
    const updateCriteria = {
        _id: new ObjectId(decodedToken.userId),
    };

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

async function removeFriend(token, friendUser) {
    try {
        const decodedToken = jwt.verify(token, secret);
        const userId = new ObjectId(decodedToken.userId);

        const collection = client.db("CC_1st").collection("Users");

        // Check if the friend exists in the user's friends list
        const user = await collection.findOne({ _id: userId, friends: friendUser });
        if (!user) {
            console.log(`Friend ${friendUser} not found in the user's friend list.`);
            return { success: false, message: `Friend ${friendUser} is not in your friends list.` };
        }

        // Remove the friend from the user's friends list
        const result = await collection.updateOne(
            { _id: userId },
            { $pull: { friends: friendUser } }
        );

        if (result.modifiedCount > 0) {
            console.log(`Friend ${friendUser} removed successfully!`);
            return { success: true, message: `Friend ${friendUser} removed successfully!` };
        } else {
            console.log(`Failed to remove friend ${friendUser}.`);
            return { success: false, message: `Failed to remove friend ${friendUser}.` };
        }
    } catch (error) {
        console.error("Error removing friend:", error);
        return { success: false, error: "Failed to authenticate or remove friend." };
    }
}

async function blockUser(token, blockUser) {
    try {
        const decodedToken = jwt.verify(token, secret);
        const userId = new ObjectId(decodedToken.userId);

        const collection = client.db("CC_1st").collection("Users");

        // Check if the user to be blocked exists
        const userToBlock = await collection.findOne({ username: blockUser });
        if (!userToBlock) {
            console.log(`User ${blockUser} not found.`);
            return { success: false, message: `User ${blockUser} does not exist.` };
        }

        // Add the user to the blocked list of the requester, ensuring no duplicates
        const result = await collection.updateOne(
            { _id: userId },
            { $addToSet: { blocked: blockUser } }
        );

        if (result.modifiedCount > 0) {
            console.log(`User ${blockUser} blocked successfully!`);
            return { success: true, message: `User ${blockUser} blocked successfully!` };
        } else {
            console.log(`Failed to block user ${blockUser}.`);
            return { success: false, message: `Failed to block user ${blockUser}.` };
        }
    } catch (error) {
        console.error("Error blocking user:", error);
        return { success: false, error: "Failed to authenticate or block user." };
    }
}

async function unblockUser(token, blockedUser) {
    try {
        const decodedToken = jwt.verify(token, secret);
        const userId = new ObjectId(decodedToken.userId);

        const collection = client.db("CC_1st").collection("Users");

        // Remove the user from the blocked list using $pull
        const result = await collection.updateOne(
            { _id: userId },
            { $pull: { blocked: blockedUser } }
        );

        if (result.modifiedCount > 0) {
            console.log(`User ${blockedUser} has been unblocked successfully.`);
            return { success: true, message: `User ${blockedUser} has been unblocked successfully.` };
        } else {
            return { success: false, message: `User ${blockedUser} is not in the blocked list.` };
        }
    } catch (error) {
        console.error("Error unblocking user:", error);
        return { success: false, error: "Failed to authenticate or unblock user." };
    }
}

async function listBlockedUsers(token) {
    try {
        const decodedToken = jwt.verify(token, secret);
        const userId = new ObjectId(decodedToken.userId);

        const collection = client.db("CC_1st").collection("Users");

        // Retrieve the user's blocked list
        const user = await collection.findOne(
            { _id: userId },
            { projection: { blocked: 1 } } // Only fetch the "blocked" field
        );

        if (!user || !user.blocked) {
            return { success: false, message: "No blocked users found or user does not exist." };
        }

        console.log("Blocked users retrieved successfully:", user.blocked);
        return { success: true, blockedUsers: user.blocked };
    } catch (error) {
        console.error("Error retrieving blocked users:", error);
        return { success: false, error: "Failed to authenticate or retrieve blocked users." };
    }
}

async function makeTable(token, tableData) {
    try {
        const Tables = client.db("CC_1st").collection("Tables");
        const Users = client.db("CC_1st").collection("Users");

        // Decode the token to get user details
        const decodedToken = jwt.verify(token, secret);
        const userId = new ObjectId(decodedToken.userId);
        const username = decodedToken.username;

        const existingUser = await Users.findOne({ _id: userId });
        if (existingUser && existingUser.table) {
            return { success: false, message: 'User is already assigned to a table.' };
        }

        // Check if a table with the same name already exists
        const existingTable = await Tables.findOne({ tablename: tableData.tablename });
        if (existingTable) {
            return { success: false, message: 'A table with this name already exists.' };
        }

        // Set the members and createdby fields in the table data
        tableData.members = [username];
        tableData.createdby = userId;

        // Insert the table into the Tables collection
        const result = await Tables.insertOne({ ...tableData });

        // Now update the user's document to link the created table to the user
        const userUpdate = await Users.updateOne(
            { _id: userId },
            { $set: { table: result.insertedId } }  // Set the created table's ID in the user's document
        );

        // Check if the user's document update was successful
        if (userUpdate.modifiedCount === 0) {
            return { success: false, message: 'Failed to update user document with created table.' };
        }

        // Return success and the result of table creation
        return { success: true, message: 'Table created successfully', tableId: result.insertedId };

    } catch (error) {
        console.error("Error creating table:", error);
        return { success: false, message: "Failed to create table." };
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

async function joinTable(token, tableId) {
    try {
        const Tables = client.db("CC_1st").collection("Tables");
        const Users = client.db("CC_1st").collection("Users");

        // Decode the token to get user details
        const decodedToken = jwt.verify(token, secret);
        const userId = new ObjectId(decodedToken.userId);
        const username = decodedToken.username;

        // Ensure the user exists in the Users collection
        const user = await Users.findOne({ _id: userId });
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // Find the table by ID
        const table = await Tables.findOne({ _id: new ObjectId(tableId) });
        if (!table) {
            return { success: false, message: 'Table not found' };
        }

        // Check if the user is already a member of the table
        if (table.members.includes(username)) {
            return { success: false, message: 'You are already a member of this table' };
        }

        // Check if the table has reached the max number of seats
        if (table.members.length >= table.maxseats) {
            return { success: false, message: 'Table is full' };
        }

        // Add the user to the table's members list
        const result = await Tables.updateOne(
            { _id: new ObjectId(tableId) },
            { $push: { members: username } }  // Add username to members array
        );

        // Check if the table update was successful
        if (result.modifiedCount === 0) {
            return { success: false, message: 'Failed to join the table' };
        }

        // Update the user's document by adding the table's ID (single table) to the table field
        const userUpdate = await Users.updateOne(
            { _id: userId },
            { $set: { table: new ObjectId(tableId) } }  // Store the single tableId
        );

        // Check if the user's document update was successful
        if (userUpdate.modifiedCount === 0) {
            return { success: false, message: 'Failed to update user document' };
        }

        return { success: true, message: 'Successfully joined the table' };
    } catch (error) {
        console.error("Error in joinTable function:", error);
        return { success: false, message: 'Error processing request' };
    }
}


async function deleteTable(token, tableId) {
    try {
        const Tables = client.db("CC_1st").collection("Tables");
        const Users = client.db("CC_1st").collection("Users");

        // Decode the token to get user details
        const decodedToken = jwt.verify(token, secret);
        const userId = new ObjectId(decodedToken.userId);

        // Find the table by ID to check ownership
        const table = await Tables.findOne({ _id: new ObjectId(tableId) });
        if (!table) {
            return { success: false, message: 'Table not found' };
        }

        // Check if the current user is the owner of the table
        if (!table.createdby.equals(userId)) {
            return { success: false, message: 'You are not the owner of this table' };
        }

        // Proceed to delete the table
        const deleteResult = await Tables.deleteOne({ _id: new ObjectId(tableId) });
        if (deleteResult.deletedCount === 0) {
            console.log("fail");
            return { success: false, message: 'Failed to delete table' };
        }

        // Optionally, update the user’s table field (if needed)
        const userUpdate = await Users.updateOne(
            { _id: userId },
            { $unset: { table: "" } }  // Unset the table reference from the user document
        );

        // Check if the user update was successful
        if (userUpdate.modifiedCount === 0) {
            return { success: false, message: 'Failed to update user document' };
        }

        return { success: true, message: 'Table successfully deleted' };

    } catch (error) {
        console.error("Error in deleteTable function:", error);
        return { success: false, message: 'Error processing request' };
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
    try {
        const collectionUsers = client.db("CC_1st").collection("Users");
        const collectionSubscriptions = client.db("CC_1st").collection("Subscriptions");

        // Find the user by their ID
        const user = await collectionUsers.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // Check if the user has an active subscription
        if (!user.subscriptionId) {
            return { success: false, message: 'No active subscription' };
        }

        // Find the subscription by its ID
        const subscription = await collectionSubscriptions.findOne({ _id: new ObjectId(user.subscriptionId) });

        if (!subscription) {
            return { success: false, message: 'Subscription not found' };
        }

        return { success: true, subscription };
    } catch (error) {
        console.error("Error retrieving subscription:", error);
        return { success: false, message: 'Error retrieving subscription' };
    }
}


async function purchaseSubscription(userId, subscriptionId) {
    try {
        const collectionUsers = client.db("CC_1st").collection("Users");
        const collectionSubscriptions = client.db("CC_1st").collection("Subscriptions");

        // Verify that the subscription exists
        const subscription = await collectionSubscriptions.findOne({ _id: new ObjectId(subscriptionId) });
        if (!subscription) {
            console.error(`Subscription with ID ${subscriptionId} not found`);
            return { success: false, message: 'Subscription not found' };
        }

        // Update the user's subscription
        const result = await collectionUsers.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { subscriptionId: new ObjectId(subscriptionId), subscriptionStartDate: new Date() } }
        );

        if (result.modifiedCount === 0) {
            console.error(`Failed to update user ${userId} with subscription ID ${subscriptionId}`);
            return { success: false, message: 'Failed to update user subscription' };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in purchaseSubscription:", error.message);  // Log error message for details
        console.error(error.stack); // Log stack trace to understand where the error is happening
        return { success: false, message: 'Error purchasing subscription' };
    }
}



async function cancelSubscription(userId) {
    try {
        const collectionUsers = client.db("CC_1st").collection("Users");
        const collectionSubscriptions = client.db("CC_1st").collection("Subscriptions");

        // Find the user in the Users collection
        const user = await collectionUsers.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            console.log("User not found with ID:", userId);
            return { success: false, message: 'User not found' };
        }

        // Check if the user has an active subscriptionId
        if (!user.subscriptionId) {
            console.log("No subscription ID found for user:", userId);
            return { success: false, message: 'No active subscription to cancel' };
        }

        // Validate that the subscriptionId is correctly formatted as an ObjectId
        let subscriptionId;
        try {
            subscriptionId = new ObjectId(user.subscriptionId);
        } catch (err) {
            console.error("Invalid subscriptionId format:", user.subscriptionId);
            return { success: false, message: 'Invalid subscription ID format.' };
        }

        // Find the subscription in the Subscriptions collection
        const subscription = await collectionSubscriptions.findOne({ _id: subscriptionId });
        if (!subscription) {
            console.log("Subscription document not found for ID:", subscriptionId);
            return { success: false, message: 'Subscription not found' };
        }

        // Update the user's subscriptionId to null (or remove subscription information)
        await collectionUsers.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { subscriptionId: null } }
        );

        // Optionally, update the subscription status to 'Cancelled'
        await collectionSubscriptions.updateOne(
            { _id: subscriptionId },
            { $set: { status: 'Cancelled' } }
        );

        console.log("Subscription cancelled successfully for user:", userId);
        return { success: true, message: 'Subscription cancelled successfully' };
    } catch (error) {
        console.error("Error in cancelSubscription:", error);
        return { success: false, message: 'Error cancelling subscription' };
    }
}


async function editTable(token, tableData) {
    try {
        const Tables = client.db("CC_1st").collection("Tables");
        const decodedToken = jwt.verify(token, secret);

        const updateData = {};
        const updateCriteria = {
            createdby: new ObjectId(decodedToken.userId),
        };

        if (tableData.tablename) {
            updateData.tablename = tableData.tablename;
        }
        if (tableData.maxseats) {
            updateData.maxseats = tableData.maxseats;
        }
        if (tableData.pub_priv) {
            updateData.pub_priv = tableData.pub_priv;
        }

        console.log('Update Criteria:', updateCriteria);
        console.log('Update Data:', updateData);

        // Perform the update
        const result = await Tables.updateOne(updateCriteria, {$set: updateData});
        return result;
    }
    catch (error) {
        console.error("Error adding friend:", error);
        return {success: false, error: "Failed to edit table."};
    }
}

async function searchTable(queryObject) {
    try {
        const Tables = client.db("CC_1st").collection("Tables");
        const query = {};

        if(queryObject.id) {
            query._id = new ObjectId(queryObject.id)
        }
        else if(queryObject.tablename){
            query.tablename = queryObject.tablename
        }

        const table = await Tables.find(query).toArray();
        return table;
    }
    catch (error) {
        console.error("Error finding chatroom:", error);
        return {success: false, error: "Failed to create chatroom."};
    }
}

async function getTableInvite(queryObject) {
    try {
        const Tables = client.db("CC_1st").collection("Tables");
        const query = {
            _id: new ObjectId(queryObject.id)
        };

        const table = await Tables.findOne(query);
        const tableInvite = table.invitelink;

        return tableInvite;
    }
    catch (error) {
        console.error("Error finding chatroom:", error);
        return {success: false, error: "Failed to create chatroom."};
    }
}

async function editSettings(token, settingsData){
    const Settings = client.db("CC_1st").collection("User_Settings");
    const decodedToken = jwt.verify(token, secret);
    const updateData = {};
    const updateCriteria = {
        userId: new ObjectId(decodedToken.userId),
    };

    if(settingsData.input){
        updateData.input = settingsData.input;
    }
    if(settingsData.output){
        updateData.output = settingsData.output;
    }
    if(settingsData.light_dark === false || settingsData.light_dark === true){
        updateData.light_dark = settingsData.light_dark;
    }
    if(settingsData.notifications === false || settingsData.notifications === true){
        updateData.notifications = settingsData.notifications;
    }
    console.log(await Settings.findOne(updateCriteria));
    console.log('Update Criteria:', updateCriteria);
    console.log('Update Data:', updateData);

    const result = await Settings.updateOne(updateCriteria, { $set: updateData });
    return result
}

module.exports = {
    run,
    signUp,
    userLogin,
    searchUsers,
    deleteUser,
    editUser,
    changeUserStatus,
    addFriend,
    listFriends,
    removeFriend,
    blockUser,
    unblockUser,
    listBlockedUsers,
    makeTable,
    viewTable,
    deleteTable,
    getSubscriptionDetails,
    viewSubscription,
    purchaseSubscription,
    cancelSubscription,
    editTable,
    searchTable,
    getTableInvite,
    editSettings,
    joinTable,
}