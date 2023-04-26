#FROM node:18.12.1-alpine

#RUN mkdir -p /usr/src/nuxt-app
#WORKDIR /usr/src/nuxt-app

#COPY package*.json /usr/src/nuxt-app/
#RUN npm install
#COPY . /usr/src/nuxt-app/
#RUN npm run build

#EXPOSE 3000

#CMD ["npm", "start"]

# Stage 1 - build
FROM node:lts-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run generate

# Stage 2 - production
FROM nginx:stable-alpine as final
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]