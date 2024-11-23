const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/product.model.js');
const User = require('./models/user.model.js');
const productRoute = require('./routes/product.route.js');
const userRoute = require('./routes/user.route.js');
const app = express();

//middleware
app.use(express.json()); // allows API requests sent with JSON input

mongoose.connect('mongodb://DatabaseAccess:DatabaseAccess@localhost:27017', {
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
app.use("/api/products", productRoute);
app.use("/api/users", userRoute);

app.get('/', (request, response) => {
    response.send('Hello from Node API Server Updated');
});

// Set your desired port
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});