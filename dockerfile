FROM node:18.12.1-alpine

RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app

COPY . /usr/src/nuxt-app/
RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]