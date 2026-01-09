const mongoose = require('mongoose');
const Order = require('./order');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    resetToken: String,
    resetTokenExpiration: String,
    cart: {
        items: [{ 
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true},
            quantity: { type: Number, required: true } 
        }]
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true  
    }
});

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(item => item.productId.toString() === product._id.toString());

    let newQuantity = 1;

    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        });
    }
    const updatedCart = { items: updatedCartItems };
    
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.removeFromCart = function (id) {
    const updatedItems = this.cart.items.filter(i => { return i.productId.toString() !== id.toString()});
    this.cart.items = updatedItems;
    return this.save()
}

userSchema.methods.postOrder = function (userId) {
    const order = new Order({ cart: this.cart, userId: userId});
    return order.save().then(() => {
        this.cart.items = [];
        return this.save();
    });
}

module.exports = mongoose.model('User', userSchema);