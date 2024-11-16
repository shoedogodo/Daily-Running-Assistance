// run app on port 8000

const express = require('express');
const mongoose = require('mongoose');
const app = express();

// access database with Admin User: Username-DatabaseAccess Password-DatabaseAccess
const uri = 'mongodb+srv://DatabaseAccess:DatabaseAccess@ttlp-cluster.5ftd2.mongodb.net/?retryWrites=true&w=majority&appName=TTLP-Cluster';

async function connect() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error(error);
    }
}

connect();

app.listen(8000, () => {
    console.log('Server started on port 8000');
});