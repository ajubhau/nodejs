const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  // const imageUrl = req.body.imageUrl;
  const imageUrl = req.file.filename;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user._id;
  console.log(image);
  const product = new Product({title, description, price, imageUrl, userId});
  product
  .save()
  .then(result => {
     res.redirect('/admin/products');
  })
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;

  Product.findById(prodId).then(product => {
    if (!product) {
      return res.redirect('/');
    }
     res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
    });
  })
  .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  const data = {
    title: updatedTitle,
    description: updatedDesc,
    price: updatedPrice,
    imageUrl: updatedImageUrl,
    // userId: req.user.userId
  }
  Product.findById(prodId)
  .then(product => {
    product.title = updatedTitle;
    product.description = updatedDesc;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    return product.save();
  })
  // Product.editProduct(prodId, data)
  .then(() => res.redirect('/admin/products'))
  .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getProducts = (req, res, next) => {
  Product.find()
  // .select('title  price -_id')
  // .populate('userId')
  .then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  })
  .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndDelete(prodId)
  .then(() => res.redirect('/admin/products'))
  .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};
