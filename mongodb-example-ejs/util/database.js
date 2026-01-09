const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const uri = 'mongodb://127.0.0.1:27017'; // Your MongoDB connection string;

let db;

const mongoConnect = callback => {
    MongoClient.connect(uri)
    .then(client => {
        console.log('Connected');
        db = client.db('shop');
        callback();
    })
    .catch(err => {
        console.log(err);
        throw err;
    })
}

const getDb = () => {
    if (db) {
        return db;
    }
    throw 'No database found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;