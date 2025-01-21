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
app.use(express.static('static'))
app.use('/api', apiRoutes);
express.urlencoded({ extended: true })
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../admin/build')));
app.use("/uploads", express.static("uploads"));
app.use(errorHandler);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/build/index.html'));
});

module.exports = app;
