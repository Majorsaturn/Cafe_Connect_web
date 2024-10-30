// MongoDB connection URI
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
run().catch(console.dir);


async function signUp(userData){
    // Insert data into the collection and get the result
    Users = client.db("CC_1st").collection("Users");
    result = await Users.insertOne(userData); //signup id
    return result.insertedId;
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
    const users = await collection.find(query).toArray();
    return users;
}

async function deleteUser(queryObject) {
    const collection = client.db("CC_1st").collection("Users");
    const query = {};

    if (queryObject.email) {
        query.email = queryObject.email;
    }
    else if (queryObject.name) {
        query.name = queryObject.name;
    }
    else if (queryObject.username) {
        query.username = queryObject.username; // Search by username
    }
    else if (queryObject.id) {
        query._id = new ObjectId(queryObject.id); // Search by id
    }


    // Delete the user that matches the query
    const deleted = await collection.deleteOne(query);
    if (deleted.deletedCount > 0) {
        console.log(`Deleted user with ID: ${user._id}`); // Log the deleted user's ID
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

/*async function addFriend(requesterId, friendId) {
    try {
        const collection = client.db("CC_1st").collection("Users");

        // Check if both users exist
        const requester = await collection.findOne({ _id: new ObjectId(requesterId) });
        const friend = await collection.findOne({ _id: new ObjectId(friendId) });

        if (!requester || !friend) {
            return { success: false, message: 'One or both users not found' };
        }

        // Check if they are already friends
        if (requester.friends && requester.friends.includes(friendId)) {
            return { success: false, message: 'You are already friends with this user' };
        }

        // Check if there’s already a pending friend request
        if (requester.pendingFriends && requester.pendingFriends.includes(friendId)) {
            return { success: false, message: 'Friend request already sent' };
        }

        // Add friendId to the requester's pendingFriends
        await collection.updateOne(
            { _id: new ObjectId(requesterId) },
            { $addToSet: { pendingFriends: friendId } } // Prevents duplicates
        );

        // Optionally, add requesterId to friend's receivedFriendRequests if implementing a bi-directional request
        await collection.updateOne(
            { _id: new ObjectId(friendId) },
            { $addToSet: { receivedFriendRequests: requesterId } }
        );

        return { success: true, message: 'Friend request sent successfully' };
    } catch (error) {
        console.error("Error in addFriend function:", error);
        return { success: false, message: 'Failed to send friend request' };
    }
}*/



module.exports = {
    run,
    signUp,
    searchUsers,
    deleteUser,
    editUser,
    changeUserStatus,
    getSubscriptionDetails,
    viewSubscription,
    purchaseSubscription,
    //cancelSubscription,
    //addFriend,
}