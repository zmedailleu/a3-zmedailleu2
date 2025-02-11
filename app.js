const express = require('express');
const {ObjectId} = require("mongodb");
const {join} = require("path");
const app = express();
app.listen(process.env.PORT || 3000);
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://zjmedailleu:MonkeyBongos81@cluster0.0hnjk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

let collection = null;
let users = null;



app.use(express.static("public"));
app.use(express.json());

async function main() {
    try {
        await client.connect().then(() => console.log("Connected!"));
        const db = await client.db("Games");
        collection = await db.collection("Games");
        users = await db.collection("Users");

    } catch (e) {
        console.error(e);
    }
}

main().catch(console.error);


app.use('/', (req, res, next) => {
    console.log("Request URL: " + req.url);
    next();
});

app.get("/home", (req, res) => {
    res.sendFile(join(__dirname, "public", "gametracker.html"));
});


app.get('/getdata', async (req, res) => {
    const currentUser = req.query.user;
    const appdata = await collection.find({user: currentUser}).toArray();
    res.json(appdata);
});

app.get('/getusers', async (req, res) => {

    const appdata = await users.find().toArray();
    res.json(appdata);
});

app.post('/submit', async (req, res) => {
    let data = req.body;

    const newData = await collection.insertOne(data);
    res.json(data);

});

app.post('/delete/:id', (req, res) => {

    const id = req.params.id;
    const newData = collection.deleteOne({_id: new ObjectId(id)});

    res.json(newData);
});

app.put('/modify/:id', async (req, res) => {
    const id = req.params.id;
    const data = req.body;

    await collection.updateOne({ _id: new ObjectId(id) }, {$set: data});
    res.json(data);
});