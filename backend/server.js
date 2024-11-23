const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/product.model.js');
const User = require('./models/user.model.js');
const productRoute = require('./routes/product.route.js');
const userRoute = require('./routes/user.route.js');
const app = express();

//middleware
app.use(express.json()); // allows API requests sent with JSON input

//routes
app.use("/api/products", productRoute);
app.use("/api/users", userRoute);

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

        const host = '0.0.0.0';  // Listens on all interfaces
        const port = 8000;  // You can specify the port if you want
        
        app.listen(port, host, () => {
            console.log(`App available on http://${host}:${port}`);
        });

    } catch (error) {
        console.log('Connection failed')
        console.error(error);
    }
}

connect();