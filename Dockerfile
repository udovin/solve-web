FROM node:16-alpine AS build
WORKDIR /app
COPY package.json /app/
RUN npm install
COPY . /app
ARG PUBLIC_VERSION=development
RUN npm run build && npm run build-server

FROM alpine:3.17
RUN apk add --no-cache nodejs
WORKDIR /app
COPY --from=build /app/build /app/build
COPY --from=build /app/dist/server.js /app/server.js
EXPOSE 8080
ENTRYPOINT ["node", "server.js"]
