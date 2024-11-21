const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/product.model.js');
const productRoute = require('./routes/product.route.js');
const app = express();

//middleware
app.use(express.json()); // allows API requests sent with JSON input

//routes
app.use("/api/products", productRoute)

app.get('/', (request, response) => {
    response.send('Hello from Node API Server Updated');
});


// access Mongo Atlas database, Cluster ttlp-cluster, Database: TTLP-Data; 
// with Admin User: Username-DatabaseAccess Password-DatabaseAccess
const uri = 'mongodb+srv://DatabaseAccess:DatabaseAccess@ttlp-cluster.5ftd2.mongodb.net/TTLP-Data?retryWrites=true&w=majority&appName=TTLP-Cluster';


async function connect() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB Database');

        app.listen(3000, () => {
            console.log('App available on http://localhost:3000'); // run server only after connected to database
        });

    } catch (error) {
        console.log('Connection failed')
        console.error(error);
    }
}

connect();