FROM node:alpine
WORKDIR /node-app
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run dist

# Comando para iniciar o servidor
CMD ["node", "dist/src/server.js"]
