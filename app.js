const express = require('express');
const app = express();
app.listen(process.env.PORT || 3000);
const {MongoClient} = require('mongodb');
const uri = "mongodb+srv://zjmedailleu:MonkeyBongos81@cluster0.0hnjk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

let gameID = 1;
let collection;

//const appdata = [];
let printDummy;

app.use(express.json());

async function main() {

    try {
        await client.connect();
        const db = client.db("Games");
        collection = db.collection("Games");

        const dummy = {name: "Frogger", gameID: 100};
        await collection.insertOne(dummy);
        printDummy = await collection.find();
        console.log(printDummy);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

app.use('/', (req, res, next) => {
    console.log("Request URL: " + req.url);
    next();
});

app.use(express.static("public"));

app.get('/getdata', async (req, res) => {

    const appdata = await collection.find().toArray();
    res.json(appdata);
});

app.post('/submit', async (req, res) => {
    let data = req.body;
    data.gameID = gameID;
    gameID += 1;
    const newData = await collection.insertOne(data);
    res.json(data);
    // appdata.push(data);
    //
    // res.json(data);

});

app.post('/delete/:gameID', (req, res) => {

    const id = req.params.gameID;
    const newData = collection.deleteOne({id});

    res.json(newData);


});