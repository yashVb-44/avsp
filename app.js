// app.js
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const { errorHandler } = require('./middleware/errorMiddleware');
const apiRoutes = require('./apiRoutes');
const cors = require('cors')
const path = require('path')

app.use(express.json());
app.use(cors())
// app.use(express.static('static'))
app.use('/api', apiRoutes);
express.urlencoded({ extended: true })
app.use(bodyParser.json())
app.use("/uploads", express.static("uploads"));
app.use('/images', express.static('images'));
app.use(errorHandler);


module.exports = app;
