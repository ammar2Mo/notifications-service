FROM node:lts-alpine
RUN apk add --update python

RUN apk update && apk add --no-cache nmap && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
      chromium \
      harfbuzz \
      "freetype>2.8" \
      ttf-freefont \
      nss
WORKDIR /var/code
COPY package.json /var/code/
RUN npm install --production
COPY . /var/code
EXPOSE 5000
ENTRYPOINT [ "node", "src/server.js" ]
