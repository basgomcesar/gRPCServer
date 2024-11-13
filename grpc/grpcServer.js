const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const productController = require('../productController');

// Cargar el archivo proto
const PROTO_PATH = path.join(__dirname, '../proto/productos.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(packageDefinition).product;

function startGrpcServer() {
  const server = new grpc.Server();

  // Añadir el servicio y asociar los métodos de gRPC con el controlador
  server.addService(productProto.ProductService.service, {
    subscribeToProductUpdates: productController.subscribeToProductUpdates,
  });

  // Escuchar en el puerto 50051
  server.bindAsync(
    '0.0.0.0:50051', // Cambiado a 0.0.0.0 para aceptar conexiones externas
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Error al iniciar el servidor gRPC:', error);
        return;
      }
      console.log(`gRPC server running at http://localhost:${port}`);
    }
  );
}

module.exports = startGrpcServer;
