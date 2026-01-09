const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

const routesShop = require('./routes/shop');
const routesAdmin = require('./routes/admin');

app.use(bodyParser.urlencoded({extended: false}));
  
// Setting the views directory using an absolute path
// app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', routesAdmin);
app.use(routesShop);

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views/404.html'))
});

app.listen(3000);