FROM node:17

WORKDIR /opt/app

COPY . .
RUN npm i

CMD node index.js