// MongoDB connection URI
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
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

async function userLogin(queryObject){
    const collection = client.db("CC_1st").collection("Users");
    const query = {};
    query.username = queryObject.username;
    query.password = queryObject.password;
    const user = await collection.findOne({ username: query.username });
    if(user){
        const isPasswordMatch = await bcrypt.compare(query.password, user.password);
        if (isPasswordMatch) {
            return isPasswordMatch;
        } else {
            return isPasswordMatch;
        }
    }
    else{
        return false;
        res.status(400).json({error: "username does not match"});
    }
}

module.exports = {
    run,
    signUp,
    searchUsers,
    deleteUser,
    editUser,
    changeUserStatus,
    userLogin,
}