FROM node:7-alpine

MAINTAINER v-braun <v-braun@live.de>

RUN apk update && apk add docker openssh
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# install the app
COPY package.json /usr/src/app/
COPY . /usr/src/app

RUN npm install

# This is needed to get around ssh host key question in a non-interactive shell
ENV GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no"

EXPOSE 3000

CMD [ "npm", "start" ]
