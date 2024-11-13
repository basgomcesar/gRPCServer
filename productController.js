const ProductService = require('./services/productService');
const productService = new ProductService();

module.exports = {
  subscribeToProductUpdates: (call) => {
    productService.subscribeToUpdates(call);
  },

  // Método para simular una actualización de producto
  updateProduct: (productId, data) => {
    productService.updateProduct(productId, data);
  },
};
