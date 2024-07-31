FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci
COPY . /app
ARG REACT_APP_VERSION=development
RUN npm run build && npm run build-server

FROM alpine:3.18
RUN apk add --no-cache nodejs
WORKDIR /app
COPY --from=build /app/build /app/build
COPY --from=build /app/dist/server.js /app/server.js
EXPOSE 8080
ENTRYPOINT ["node", "server.js"]
