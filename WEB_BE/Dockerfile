FROM node:20.9.0-alpine

WORKDIR /app

COPY package.json /app

COPY . /app

RUN cd /app && npm i

CMD npm run prod

EXPOSE 4001