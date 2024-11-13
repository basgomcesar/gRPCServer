const EventEmitter = require('events');
class ProductService extends EventEmitter {
  constructor() {
    super();
    this.products = {}; // Puede ser reemplazado con acceso a base de datos
  }

  updateProduct(productId, data) {
    // Lógica para actualizar producto en base de datos o en memoria
    console.log(`Actualizando producto ${productId} con datos:`, data);
    this.products[productId] = data;
    
    // Emitir evento de actualización de producto
    console.log('Emitiendo evento de actualización de producto');
    this.emit('productUpdated', { productId, ...data });
  }

  subscribeToUpdates(call) {
    console.log('Cliente conectado para recibir actualizaciones de productos');
    const onProductUpdate = (update) => {
      call.write({
        product_id: update.productId,
        product_name: update.productName,
        available: update.available,
        status: update.status
      });
    };

    // Escuchar actualizaciones de productos
    this.on('productUpdated', onProductUpdate);

    // Cuando el cliente termina la conexión
    call.on('end', () => {
      this.removeListener('productUpdated', onProductUpdate);
      call.end();
    });
  }
}

module.exports = ProductService;
