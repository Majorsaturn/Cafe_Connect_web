const fs = require('fs');
const { MongoClient, ServerApiVersion, ObjectId, GridFSBucket } = require('mongodb');
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

    const result = await Users.insertOne({ //signup id
        ...rest,
        password: hashedPassword,
        followers: []
    });
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

async function searchUsers(searchTerm) {
    const db = client.db("CC_1st");
    const usersCollection = db.collection("Users");

    // Search for a user by username or email
    return usersCollection.find({
        $or: [
            { username: searchTerm },
            { email: searchTerm }
        ]
    }).toArray();
}

async function searchUsersByName(firstName, lastName) {
    const db = client.db("CC_1st");
    const usersCollection = db.collection("Users");

    // Search for users by first name and last name
    return usersCollection.find({
        firstName: firstName,
        lastName: lastName
    }).toArray();
}


async function deleteUser(token) {
    const Users = client.db("CC_1st").collection("Users");
    const Settings = client.db("CC_1st").collection("User_Settings");
    const Tables = client.db("CC_1st").collection("Tables");
    const decodedToken = jwt.verify(token, secret);
    const query = {
        _id: new ObjectId(decodedToken.userId),
    };
    const querySettings = {
        userId: new ObjectId(decodedToken.userId),
    };
    const queryTables = {
        createdby: new ObjectId(decodedToken.userId),
    };

    // Delete the user that matches the query along with the settings
    const deleted = await Users.deleteOne(query);
    const deletedSettings = await Settings.deleteOne(querySettings);
    const deletedTables = await Tables.deleteOne(queryTables);
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
    if (userData.firstname) {
        updateData.firstName = userData.firstname;
    }
    if (userData.lastname) {
        updateData.lastName = userData.lastname;
    }
    if (userData.email) {
        updateData.email = userData.email;
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

async function addFollower(currentUserId, targetUserId) {
    const Followers = client.db("CC_1st").collection("Followers");

    // Convert user IDs to ObjectIds for MongoDB
    const currentUserIdObj = new ObjectId(currentUserId);
    const targetUserIdObj = new ObjectId(targetUserId);

    // Check if the follow relationship already exists
    const existingFollow = await Followers.findOne({
        userId: currentUserIdObj,
        followerId: targetUserIdObj
    });

    if (existingFollow) {
        throw new Error("You are already following this user.");
    }

    // Add the new follower
    await Followers.insertOne({ userId: currentUserIdObj, followerId: targetUserIdObj });
    return { message: "Followed successfully!" };
}

async function removeFollower(currentUserId, targetUserId) {
    const Followers = client.db("CC_1st").collection("Followers");

    // Convert user IDs to ObjectIds for MongoDB
    const currentUserIdObj = new ObjectId(currentUserId);
    const targetUserIdObj = new ObjectId(targetUserId);

    // Delete the follow document
    const result = await Followers.deleteOne({
        userId: currentUserIdObj,
        followerId: targetUserIdObj
    });

    if (result.deletedCount === 0) {
        throw new Error("Follow relationship does not exist.");
    }

    return { message: "Unfollowed successfully." };
}

async function listFollowers(userId) {
    const Followers = client.db("CC_1st").collection("Followers");
    const Users = client.db("CC_1st").collection("Users");

    // Ensure `userId` is an ObjectId for consistency
    const userObjectId = new ObjectId(userId);

    // Find all follower documents for the given userId
    const followers = await Followers.find({ userId: userObjectId }).toArray();

    // Extract `followerId` values and convert to ObjectId
    const followerIds = followers.map(f => new ObjectId(f.followerId));

    // Query the Users collection for these follower IDs
    const followerDetails = await Users.find({ _id: { $in: followerIds } }).toArray();

    return followerDetails;
}

async function blockUser(currentUserId, targetUserId) {
    const BlockedUsers = client.db("CC_1st").collection("BlockedUsers");

    const currentUserIdObj = new ObjectId(currentUserId);
    const targetUserIdObj = new ObjectId(targetUserId);

    // Check if the block relationship already exists
    const existingBlock = await BlockedUsers.findOne({
        blockerId: currentUserIdObj,
        blockedId: targetUserIdObj
    });

    if (existingBlock) {
        return { message: "User is already blocked." }; // Return success if already blocked
    }

    // Insert a new block document
    await BlockedUsers.insertOne({
        blockerId: currentUserIdObj,
        blockedId: targetUserIdObj,
        timestamp: new Date()
    });

    return { message: "User blocked successfully." };
}

async function unblockUser(currentUserId, targetUserId) {
    const BlockedUsers = client.db("CC_1st").collection("BlockedUsers");

    const currentUserIdObj = new ObjectId(currentUserId);
    const targetUserIdObj = new ObjectId(targetUserId);

    // Remove the block document
    const result = await BlockedUsers.deleteOne({
        blockerId: currentUserIdObj,
        blockedId: targetUserIdObj
    });

    if (result.deletedCount === 0) {
        throw new Error("Block relationship does not exist.");
    }

    return { message: "User unblocked successfully." };
}

async function listBlockedUsers(userId) {
    try {
        const currentUserIdObj = new ObjectId(userId);

        const BlockedUsers = client.db("CC_1st").collection("BlockedUsers");

        // Find all users that are blocked by the current user
        const blockedUsers = await BlockedUsers.find({ blockerId: currentUserIdObj }).toArray();

        if (!blockedUsers || blockedUsers.length === 0) {
            return { success: false, message: "No blocked users found." };
        }

        // Extract the blocked user IDs from the relationships
        const blockedUserIds = blockedUsers.map(block => block.blockedId);

        // Fetch the user details for each blocked user (assuming 'Users' collection holds user info)
        const usersCollection = client.db("CC_1st").collection("Users");
        const blockedUserDetails = await usersCollection.find({
            _id: { $in: blockedUserIds }
        }).toArray();

        // Return an array of blocked users with their details (e.g., username, id)
        const result = blockedUserDetails.map(user => ({
            id: user._id.toString(),
            username: user.username // Assuming you have a 'username' field in the Users collection
        }));

        console.log("Blocked users retrieved successfully:", result);
        return { success: true, blockedUsers: result };
    } catch (error) {
        console.error("Error retrieving blocked users:", error);
        return { success: false, error: "Failed to retrieve blocked users." };
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

async function viewTable(token, queryObject) {
    try {
        const Tables = client.db("CC_1st").collection("Tables");
        const Users = client.db("CC_1st").collection("Users");

        // Decode the token to get user details
        const decodedToken = jwt.verify(token, secret);
        const userId = new ObjectId(decodedToken.userId);
        const username = decodedToken.username;

        // Fetch the table using the provided queryObject (table ID)
        const table = await Tables.findOne({ _id: new ObjectId(queryObject.id) });

        if (!table) {
            return { success: false, message: "Table not found." };
        }

        // Check if the user is a member of the table
        if (!table.members.includes(username)) {
            return { success: false, message: "You are not a member of this table." };
        }

        // Return the table details if the user is a member
        return table;

    } catch (error) {
        console.error("Error finding table:", error);
        return { success: false, message: "Failed to fetch table details." };
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
        console.error("Error updating table:", error);
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
        console.log(table);
        const tableInvite = table.link;
        console.log(tableInvite);
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
    return result;
}

async function uploadAudio(filePath, fileName) {
    const db = client.db("CC_1st");
    const bucket = new GridFSBucket(db, { bucketName: "audio" });

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(fileName);
        const fileStream = fs.createReadStream(filePath);

        fileStream.pipe(uploadStream)
            .on("error", (error) => {
                console.error("Upload error:", error);
                reject(error);
            })
            .on("finish", () => {
                console.log(`File ${fileName} uploaded successfully.`);
                resolve({ success: true, fileId: uploadStream.id });
            });
    });
}

async function getAudio(fileName, res) {
    const db = client.db("CC_1st");
    const bucket = new GridFSBucket(db, { bucketName: "audio" });

    return new Promise((resolve, reject) => {
        const downloadStream = bucket.openDownloadStreamByName(fileName);

        downloadStream.pipe(res)
            .on("error", (error) => {
                console.error("Download error:", error);
                res.status(500).send("Error retrieving audio file.");
                reject(error);
            })
    });
}


module.exports = {
    run,
    signUp,
    userLogin,
    searchUsers,
    searchUsersByName,
    deleteUser,
    editUser,
    changeUserStatus,
    addFollower,
    listFollowers,
    removeFollower,
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
    uploadAudio,
    getAudio,
}