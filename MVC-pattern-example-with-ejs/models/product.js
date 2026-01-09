const fs = require('fs');
const path = require('path');

const db = require('../util/database');

const Cart = require('./cart');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    return db.execute(
      'INSERT INTO product (title, description, price, imageUrl) VALUES (?, ?, ?, ?)',
      [this.title, this.description, this.price, this.imageUrl])
    // getProductsFromFile(products => {
    //   if (this.id) {
    //     const existingProductIndex = products.findIndex(
    //       prod => prod.id === this.id
    //     );
    //     const updatedProducts = [...products];
    //     updatedProducts[existingProductIndex] = this;
    //     fs.writeFile(p, JSON.stringify(updatedProducts), err => {
    //       console.log(err);
    //     });
    //   } else {
    //     this.id = Math.random().toString();
    //     products.push(this);
    //     fs.writeFile(p, JSON.stringify(products), err => {
    //       console.log(err);
    //     });
    //   }
    // });
  }

  updateProduct() {
    return db.execute('UPDATE product SET title = ? , description = ? , price = ? , imageUrl = ? WHERE id = ?', [this.title, this.description, this.price, this.imageUrl, this.id] )
  }

  static deleteById(id) {
    // getProductsFromFile(products => {
    //   const product = products.find(prod => prod.id === id);
    //   const updatedProducts = products.filter(prod => prod.id !== id);
    //   fs.writeFile(p, JSON.stringify(updatedProducts), err => {
    //     if (!err) {
    //       Cart.deleteProduct(id, product.price);
    //     }
    //   });
    // });
    return db.execute('DELETE FROM product WHERE id = ?', [id])
  }

  static fetchAll() {
    // getProductsFromFile(cb);
    return db.execute('SELECT * FROM product');
  }

  static findById(id) {
    // return db.execute('SELECT * FROM product WHERE product.id = ?', [id])
    return db.execute(`SELECT * FROM product WHERE product.id = ${id}`)
    // getProductsFromFile(products => {
    //   const product = products.find(p => p.id === id);
    //   cb(product);
    // });
  }
};
