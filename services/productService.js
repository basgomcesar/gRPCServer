const EventEmitter = require('events');
const connection  = require('../models/database');

class ProductService extends EventEmitter {
  constructor() {
    super();
    this.products = {}; // Cache de productos
    this.db = connection; // Conexión a MySQL
  }

  async pollDatabaseForUpdates() {
    console.log('Iniciando monitoreo de base de datos para actualizaciones de productos...');
    const query = `SELECT idProducto, nombre, descripcion,precio, cantidadDisponible, disponible, idVendedor,foto FROM productos WHERE disponible = 1`;

    let lastSnapshot = new Map(); // Para comparar cambios en la base de datos

    // Revisa la base de datos periódicamente
    setInterval(async () => {
      try {
        const [rows] = await this.db.query(query);

        const currentSnapshot = new Map(rows.map((row) => [row.idProducto, row]));

        // Detectar cambios comparando instantáneas
        currentSnapshot.forEach((current, id) => {
          const previous = lastSnapshot.get(id);

          if (!previous || JSON.stringify(previous) !== JSON.stringify(current)) {
            console.log(`Cambio detectado en producto ${id}`);
            this.updateProduct(id, current);
          }
        });

        // Actualizar el último estado
        lastSnapshot = currentSnapshot;
      } catch (error) {
        console.error('Error al consultar la base de datos:', error);
      }
    }, 5000); // Consulta cada 5 segundos
  }

  updateProduct(productId, data) {
    console.log(`Actualizando producto ${productId} con datos:`, data);
    this.products[productId] = data;

    console.log('Emitiendo evento de actualización de producto');
    this.emit('productUpdated', { productId, ...data });
  }

  async subscribeToUpdates(call) {
    // 1. Obtener la lista inicial de productos disponibles
    try {
      const query = `SELECT idProducto, nombre, descripcion, precio, cantidadDisponible, disponible, idVendedor,foto FROM productos `;
      const [rows] = await this.db.query(query);

      console.log('Enviando productos iniciales al cliente...');
      rows.forEach((row) => {
        call.write({
          product_id: row.idProducto,
          product_name: row.nombre,
          description: row.descripcion,
          price: row.precio,
          quantity_available: row.cantidadDisponible,
          available: row.disponible,
          user_id: row.idUsuario,
          photo: row.foto,
        });
      });
    } catch (error) {
      console.error('Error al obtener productos iniciales:', error);
      call.end();
      return;
    }
    const onProductUpdate = (update) => {
      call.write({
        product_id: update.idProducto,
        product_name: update.nombre,
        available: update.disponible,
        quantity_available: update.cantidadDisponible,
        description: update.descripcion,
        price: update.precio,
        photo: update.foto,
      });
    };

    // Escuchar actualizaciones de productos
    this.on('productUpdated', onProductUpdate);

    // Cuando el cliente termina la conexión
    call.on('end', () => {
      console.log('Cliente desconectado');
      this.removeListener('productUpdated', onProductUpdate);
      call.end();
    });
  }
}

module.exports = ProductService;
