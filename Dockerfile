FROM hub.hamdocker.ir/node:18-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

RUN yarn tsc

COPY . .

EXPOSE 4000

CMD [ "node", "dist/app.js" ]