const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const User = require('./models/user.model.js');
const userRoute = require('./routes/user.route.js');
const app = express();

//middleware
app.use(express.json());

// MongoDB connection
const mongoURI = 'mongodb://DatabaseAccess:DatabaseAccess@localhost:27017';
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