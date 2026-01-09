const mongodb = require('mongodb');
const { get } = require('../routes/admin');
const getDb = require('../util/database').getDb;

class Product {
    constructor(title, description, price, imageUrl, userId) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.userId = userId;
    }

    save() {
        const db = getDb();
        return db.collection('products')
        .insertOne(this)
        .then((data) => {
           console.log(data);
        })
        .catch(err => console.log(err));
    }

    static fetchAll() {
        return getDb()
        .collection('products')
        .find()
        .toArray()
        .then(result => {
            return result;
        }).catch(err => {
            console.log(err)
        })
    }

    static findById(prodId) {
        return getDb()
        .collection('products')
        .find({_id: new mongodb.ObjectId(prodId) })
        .next()
        .then(result => {
            return result;
        }).catch(err => {
            console.log(err)
        })
    }

    static editProduct(prodId, data) {
    
        console.log('id', prodId, data);
        return getDb()
        .collection('products')
        .updateOne(
            { _id: new mongodb.ObjectId(Number(prodId))},
            { $set: data })
        .then(result => {
            console.log('ddddd', result)
        })
        .catch(err => {
            console.log(err);
        })
    }

    static deleteProduct(prodId) {
        return getDb()
        .collection('products')
        .deleteOne({ _id: new mongodb.ObjectId(prodId) })
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.log(err);
        })
    }
}

module.exports = Product;