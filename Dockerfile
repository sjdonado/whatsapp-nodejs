FROM node:dubnium-jessie

WORKDIR /usr/src/app

RUN apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y \
  build-essential \
  ca-certificates \
  gcc \
  git \
  libpq-dev \
  make \
  python-pip \
  python2.7 \
  && apt-get autoremove \
  && apt-get clean

COPY ./package.json .

RUN npm install --only=prod

COPY . .

CMD ["node", "index.js"]
