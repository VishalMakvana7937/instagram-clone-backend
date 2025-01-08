// const http = require('http');

// const server = http.createServer((req, res) => {
//     console.log("Server created..!");
//     res.end("Heloo");
// })

// server.listen(5000, "localhost", () => {
//     console.log('Server is running on port 5000');

// })

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const corsOptions = {
    origin: 'https://instagram-clone-demo-kappa.vercel.app', 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], 
    credentials: true,
};

app.use(cors(corsOptions));

require('./models/model');
require('./models/post');
app.use(express.json());
app.use(require("./routes/auth"));
app.use(require("./routes/createPost"));
app.use(require("./routes/user"));

mongoose.connect(process.env.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected successfully.');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

const port = process.env.post || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
