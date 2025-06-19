const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// const path= require("path");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());


app.use(cors({ origin: "http://localhost:8081", credentials: true }));

// if (process.env.NODE_ENV === "production") {
// 	app.use(express.static(path.join(__dirname, "/frontend/auth/dist")));

// 	app.get("*", (req, res) => {
// 		res.sendFile(path.resolve(__dirname, "hr-automation-moblie", "dist", "index.html"));
// 	});
// }


const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
