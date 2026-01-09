const db = require('../util/database').getDb;
const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;
const Product = require('./product');

class User {
    constructor(name, email, cart, id) {
        this.name = name;
        this.email = email;
        this.cart = cart;
        this.id = id;
    }
  
    static findById(id) {
        return db()
        .collection('users')
        .find({ _id: new ObjectId(id) })
        .next()
        .then((result) => {
            return result;
        })
        .catch(err => {
            console.log(err);
        })
    }

    getCart() {
        const productIds = this.cart.items.map(i => { return i.productId});
        return db()
        .collection('products')
        .find({ _id:  { $in: productIds }})
        .toArray()
        .then(carts => {
            return carts.map(item => {
                return { ...item, quantity: this.cart.items.find(p => {return p.productId.toString() === item._id.toString()}).quantity}
            })
        })
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(item => item.productId.toString() === product._id.toString());

        let newQuantity = 1;

        const updatedCartItems = [...this.cart.items];
        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({
                productId: new ObjectId(product._id),
                quantity: newQuantity
            });
        }
        const updatedCart = { items: updatedCartItems };

        return db()
        .collection('users')
        .updateOne(
            { _id: new ObjectId(this.id)},
            { $set: { cart: updatedCart }}
        )
        // .then((result) => {
        //     console.log(result);
        // })
        // .catch(err => console.log(err));
    }

    deleteCartItem(id) {
        const updatedItems = this.cart.items.filter(i => { return i.productId.toString() !== id.toString()});
        return db()
        .collection('users')
        .updateOne({ _id: new ObjectId(this.id)}, { $set: { cart: { items : updatedItems} }})
    }

    postOrder() {
        return this.getCart()
        .then(products => {
            const order = {
                items: products,
                user : {
                    _id: new ObjectId(this.id),
                    name: this.name
                }
            }
            return db().collection('order').insertOne(order)
        })
        .then(result => {
            this.cart = { items: [] };
            return db()
            .collection('users')
            .updateOne(
                { _id: new ObjectId(this.id)},
                { $set: { cart: { items: [] } } }
            );
        })
    }

    getOrders() {
        return db()
        .collection('order')
        .find({ 'user._id': new ObjectId(this.id)})
        .toArray();
    }
}

module.exports = User;