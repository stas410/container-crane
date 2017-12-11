FROM node:7-alpine

MAINTAINER Stas Filippov <stas410@gmail.com>

RUN apk update && apk add --no-cache docker openssh
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk add --no-cache py-pip && pip install docker-compose

# install the app
COPY package.json /usr/src/app/
COPY . /usr/src/app

RUN yarn

# This is needed to get around ssh host key question in a non-interactive shell
ENV GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no"

EXPOSE 3000

CMD [ "yarn", "start" ]
