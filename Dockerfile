# Dockerfile
FROM node:lts

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 3002
CMD npm start