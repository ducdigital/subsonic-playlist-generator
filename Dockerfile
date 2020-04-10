FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install


# Bundle app source
COPY . .

EXPOSE 8089
CMD [ "node", "server.js" ]