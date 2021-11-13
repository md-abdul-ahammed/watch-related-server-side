const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wire
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wtvgs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("watch_store");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders");
        const usersCollection = database.collection("users");
        const feedbackCollection = database.collection('feedback')


        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })
        app.get('/checkout/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const result = await usersCollection.findOne(query);
            let isAdmin = false;
            if (result?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })
        //add order
        app.post('/order', async (req, res) => {
            console.log(req.body)
            const result = await orderCollection.insertOne(req.body)
            res.send(result);
        });
        //my order 
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const result = await orderCollection.find(query).toArray()
            res.send(result);
        })
        app.get('/order', async (req, res) => {
            const cursor = orderCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result);
        })
        app.put('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(query, updateDoc, options);
            res.send(result);
        })
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user)
            const query = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await usersCollection.updateOne(query, updateDoc);
            res.send(result);
        })
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            console.log(reviews)
            const result = await feedbackCollection.insertOne(reviews)
            res.send(result)
        })
        app.get('/reviews', async (req, res) => {
            const cursor = feedbackCollection.find({});
            const feedback = await cursor.toArray();
            res.send(feedback)
        })
        //Delete Product 
        app.delete("/deleteOrder/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const result = await orderCollection.deleteOne({ _id: ObjectId(id) })
            res.send(result)
        })


    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})
console.log(uri)
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})