# Usamos una versión ligera de Node
FROM node:18-alpine

WORKDIR /app

# Instalamos dependencias
COPY package*.json ./
RUN npm install --production

# Copiamos el código
COPY . .

# Exponemos el puerto interno
EXPOSE 3001

# Arrancamos
CMD ["node", "index.js"]