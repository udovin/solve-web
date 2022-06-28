FROM node:14-alpine

COPY package.json /app/

WORKDIR /app

RUN npm install

COPY . /app

RUN npm run build && npm run build-server

EXPOSE 8080

ENTRYPOINT ["node", "dist/server.js"]
