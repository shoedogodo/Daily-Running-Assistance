// run app on port 8000
// https://cloud.mongodb.com/v2/673812e4d253332a8d51b4ad#/metrics/replicaSet/673813dd6b1f2165970205ae/explorer/sample_mflix/embedded_movies/find

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