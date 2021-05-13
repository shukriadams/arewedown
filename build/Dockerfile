FROM node:12-alpine

MAINTAINER shukriadams

WORKDIR /etc/arewedown

# Update
RUN apk update \
    && apk upgrade

# Add "arewedown" user
RUN addgroup -S arewedown \
    && adduser -S arewedown -G arewedown \
    && chmod 700 -R /etc/arewedown \
    && chown -R arewedown /etc/arewedown

# Install GNU tar
RUN apk add --no-cache tar  

# Copy and unzip build
COPY ./build.tar.gz /tmp
RUN tar -xzvf /tmp/build.tar.gz -C /etc/arewedown --strip 2

# Delete build from /tmp
RUN rm /tmp/build.tar.gz

USER arewedown

EXPOSE 3000
CMD [ "node", "index.js" ]