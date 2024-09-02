FROM hub.hamdocker.ir/node:18-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn tsc

EXPOSE 4000

CMD [ "yarn", "start:dev" ]