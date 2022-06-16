
const express = require('express');

const routes = require('../config/routes.js')

const app = express();
app.use(express.json())


app.use(routes)


app.listen(3334);