
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const csrf = require('csurf'); // Cross Site Request Forgery
const flash = require('connect-flash'); // Flash for show messages
const multer = require('multer');

const errorController = require('./controllers/error');
const mongoose = require('mongoose');

const app = express();
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/'); // Specify the destination folder
    },
    filename: (req, file, cb) => {
        // Generate a unique filename to prevent overwrites
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg' 
    ) {
        cb(null, true);
    } else {
        cb(null, false)
    }
}

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const MONGODB_URI = 'mongodb://localhost:27017/mongoose';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
// Serve static files (optional, but useful for storing PDFs)
app.use('/files', express.static(path.join(__dirname, 'files')));

app.use(session({
    secret: 'my secret', // Replace with a strong, unique secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        collectionName: 'sessions'
    })
}));

app.use(csrfProtection);
app.use(flash());

const User = require('./models/user');
const { error } = require('console');


// This middleware function run on only incoming request
app.use((req, res, next) => {
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        if(!user) {
            return next();
        }
        req.user = user;
        next();
    })
    .catch(err => {
        next(new Error(err));
    })
});

// Middleware function to pass authentication status and csrfToken locally serve
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Initilizing routes 
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    res.redirect('/500');
})

mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('Connected')
    app.listen(3000)
})
.catch(err => {
    console.log(err)
})
