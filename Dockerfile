FROM node:alpine

WORKDIR /node-app

COPY package*.json ./

# Utilizei 'npm ci' em vez de 'npm install' pois achei mais interessante o que vi no link abaixo
# https://stackoverflow.com/questions/52499617/what-is-the-difference-between-npm-install-and-npm-ci
RUN npm ci


# Set the timezone to UTC-4
RUN ln -sf /usr/share/zoneinfo/America/Porto_Velho /etc/localtime


# Depois copia o projeto (Isto torna mais rápido o build devido ao cache)
COPY . .


RUN npm run dist

# Comando para iniciar o servidor
ENTRYPOINT ["node", "dist/server.js"]
