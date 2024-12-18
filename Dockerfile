# Usar una imagen base de Node.js
FROM node:18

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar el package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto que usa el servicio gRPC (por ejemplo, 50051)
EXPOSE 50051

# Comando para iniciar el servidor
CMD ["npm", "start"]
