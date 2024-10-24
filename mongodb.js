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


module.exports = {
    run,
    signUp
}