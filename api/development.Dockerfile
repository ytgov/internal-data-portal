FROM node:20.10.0-alpine3.19

WORKDIR /usr/src/api

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x ./bin/boot-app.sh

CMD ["/usr/src/api/bin/boot-app.sh"]
