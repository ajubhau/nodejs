const Product = require('../models/product');
// const Cart = require('../models/cart');
const Order = require('../models/order');
const path = require('path');
const fs = require('fs');

const pdfDocument = require('pdfkit');

exports.getProducts = (req, res, next) => {
  Product.find().then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });  
  })
  .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(product => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  }).catch(err => {
    console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getIndex = (req, res, next) => {
   Product.find().then(products => {
     res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err => {
    console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getCart = (req, res, next) => {
  req.user
  .populate('cart.items.productId')
  .then(product => {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: product.cart.items
    });
  })
  .catch(err => {
    console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product);
  }).then(() => {
    res.redirect('/cart');
  }).catch(err => {
    console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
  .then(() => {res.redirect('/cart')})
  .catch(err => {
    console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postOrder = (req, res, next) => {
  req.user.postOrder(req.user._id)
  .then(() => {
    res.redirect('/orders');
  })
  .catch(err => {
    console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getOrders = (req, res, next) => {
  Order.find({'userId': req.user._id})
  .populate('cart.items.productId')
  // req.user.getOrders()
  .then(orders => {
    console.log('orders', orders)
    res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders',
    orders: orders
    });
  })
  .catch(err => {
    console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
  });

};

// exports.getCheckout = (req, res, next) => {
//   res.render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Checkout'
//   });
// };

exports.downloadPdf = (req, res, next) => {
  const filePath = path.join('files', 'sample.pdf'); // Adjust 'sample.pdf' to your actual PDF file name
  // const fileName = 'my_document.pdf'; // Optional: specify a different filename for the download
    // fs.readFile(filePath, (err, data) => {
    //    if (err) {
    //         return next(err);
    //     }
    //     res.setHeader('Content-Type', 'application/pdf');
    //     res.setHeader('Content-Disposition', 'inline; filename="sample.pdf"');
    //     res.send(data);
    // })
    // const file = fs.createReadStream(filePath); // Use for high volume data;
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'inline; filename="sample.pdf"');
    // file.pipe(res);
    Order.findOne({_id: req.params.orderId})
    .populate('cart.items.productId').then(order => {
      console.log(order.cart.items)
      order.cart.items.forEach(item => {
        Product
      })
    }).catch(err => console.log(err))
    const doc = new pdfDocument();

    // Set the response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="generated_document.pdf"');

    // Pipe the PDF document to the response stream
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(25).text('Hello from Express.js!', 100, 100);
    doc.text('This is a dynamically generated PDF.', { align: 'center' });
    doc.moveDown();
    doc.text('You can add more text, images, and other elements here.', { indent: 20 });

    // Finalize the PDF and end the stream
    doc.end();
}