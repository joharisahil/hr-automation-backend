const express = require('express');
const { pool } = require('./db/connectDb');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.get("/", (req, res) => {
    res.send("hello guys");
});

app.use("/api/auth", authRoutes);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
