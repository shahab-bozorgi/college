FROM hub.hamdocker.ir/node:18-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn tsc

RUN [ -d dist ] || (echo "Build directory not found!" && exit 1)

EXPOSE 4000

CMD [ "yarn", "start" ]