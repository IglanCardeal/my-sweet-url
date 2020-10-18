FROM node:12

WORKDIR /app

COPY package.json ./

# RUN npm install -g yarn
RUN yarn install

COPY . .

ENV PORT=3000

EXPOSE 3000

CMD ["yarn", "dev"]
