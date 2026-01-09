# --- ETAPA 1: Construcción (Build) ---
FROM node:18-alpine as build-stage

WORKDIR /app

# Copiamos primero los package.json para aprovechar la caché de Docker
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Construimos la aplicación para producción
# NOTA: Si usas Vite, esto crea la carpeta 'dist'. 
# Si usas Create-React-App, crea la carpeta 'build'.
RUN npm run build

# --- ETAPA 2: Producción (Nginx) ---
FROM nginx:alpine as production-stage

# Copiamos el archivo de configuración de Nginx que creamos arriba
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos compilados desde la ETAPA 1
# OJO: Si usas Create-React-App, cambia 'dist' por 'build' abajo
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]