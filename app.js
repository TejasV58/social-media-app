const express = require('express')
const mongoose = require('mongoose')
require("dotenv").config();

// app
const app = express()

// mongodb connection
mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("DB CONNECTED"))
	.catch((err) => console.log("DB CONNECTION ERROR", err));

// middlewares
app.use(express.json())

// routes
const userRouter = require('./routes/user')
const postRouter = require('./routes/posts')
app.use(userRouter)
app.use(postRouter)

// port
const port = process.env.PORT || 8080;

// listener
const server = app.listen(port, () =>
	console.log(`Server is running on port ${port}`)
);

