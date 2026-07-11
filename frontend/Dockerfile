# Étape 1 — Builder l'application React
FROM node:18-alpine AS builder

WORKDIR /app

# Installer les dépendances
COPY package*.json .
RUN npm install

# Copier le code et builder
COPY . .
RUN npm run build

# Étape 2 — Servir avec Nginx
FROM nginx:alpine

# Copier le résultat du build dans Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]