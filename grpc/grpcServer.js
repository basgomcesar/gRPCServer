const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const ProductService = require('../services/productService');

// Carga el archivo .proto
const PROTO_PATH = __dirname + '/../proto/productos.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(packageDefinition).product;

// Inicializar servicio de productos
const productService = new ProductService();

async function main() {
  // Inicializa la conexión a MySQL y comienza a monitorear
  await productService.initDbConnection();
  productService.pollDatabaseForUpdates();

  // Configurar servidor gRPC
  const server = new grpc.Server();

  server.addService(productProto.ProductService.service, {
    SubscribeToProductUpdates: (call) => productService.subscribeToUpdates(call),
  });

  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Error al iniciar el servidor:', err);
      return;
    }
    console.log(`Servidor gRPC escuchando en el puerto ${port}`);
  });
}

main();
