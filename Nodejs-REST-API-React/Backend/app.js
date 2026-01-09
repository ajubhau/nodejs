const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');

const app = express();

app.use(express.urlencoded({ extended: true }));

const MONGODB_URI = 'mongodb://localhost:27017/graphql';
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolver');

// app.use((req, res, next) => {
//     res.setHeader('Acess-Control-Allow-Origin', '*');
//     res.setHeader(
//         'Access-Control-Allow-Method',
//         'OPTIONS, GET, POST, PUT, PATCH, DELETE'
//     );
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// })

// Enable CORS with specific options for better security
const corsOptions = {
  origin: '*', // Replace with your allowed origin(s)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow sending cookies/authorization headers
  allowedHeaders: 'Content-Type,Authorization' // Specify allowed headers
};
app.use(cors(corsOptions)); // Enable CORS for all routes

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);


app.use(
    '/graphql',
    graphqlHTTP({
        schema: graphqlSchema,
        rootValue: graphqlResolver,
        graphiql: true
    })
)
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data});
});

mongoose.connect(MONGODB_URI).then(db => {
    console.log('connected')
    app.listen(8080);
}).catch(err => {
    console.log(err)
});