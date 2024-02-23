FROM node:16-alpine AS build
WORKDIR /app
COPY package.json /app/
RUN npm install
COPY . /app
ARG REACT_APP_VERSION=development
RUN npm run build && npm run build-server

FROM alpine:3.18
RUN apk add --no-cache nodejs
WORKDIR /app
COPY --from=build /app/build /app/build
COPY --from=build /app/dist /app/dist
EXPOSE 8080
ENTRYPOINT ["node", "./dist/server.js"]
