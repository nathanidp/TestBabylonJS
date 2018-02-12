const http = require('http');
const express = require('express');
const app = express();
const path = require('path');

const port = 3000;
app.use(express.static('dist'));


app.listen(port, function () {
  console.log(`Server running at port ${port}/`);
});