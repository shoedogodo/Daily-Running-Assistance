const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const connectDB = require('./db');
const userRoutes = require('./routes/user');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(express.json());

// Use the user routes
app.use('/api', userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});