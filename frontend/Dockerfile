FROM node:20-alpine as build
WORKDIR /web
COPY package.json ./
RUN npm i
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /web
COPY --from=build /web /web
EXPOSE 3000
CMD ["npm","run","preview"]
