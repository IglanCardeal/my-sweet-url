FROM node:14.15.0-alpine

COPY package*.json ./

RUN yarn install

COPY . .

CMD [ "yarn", "build" ]
