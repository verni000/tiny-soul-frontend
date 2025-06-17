# Dockerfile (untuk backend - Node.js)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

EXPOSE 4000
CMD ["node", "server.js"]