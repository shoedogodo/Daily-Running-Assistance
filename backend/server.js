require('dotenv').config();  // Add this at the top
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const User = require('./models/user.model.js');
const userRoute = require('./routes/user.route.js');
const app = express();

// Add this logging to check if Node can see the SECRET_KEY
console.log('Loaded SECRET_KEY:', process.env.SECRET_KEY);

if (!process.env.SECRET_KEY) {
    console.error('WARNING: SECRET_KEY is not set in Node process environment');
}


//middleware
app.use(express.json());

// MongoDB connection
const mongoURI = 'mongodb://DatabaseAccess:DatabaseAccess@127.0.0.1:27017?authSource=admin';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB!');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

//routes
app.use("/api/users", userRoute);

app.get('/', (request, response) => {
    response.send('Hello from Node API Server Updated');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});