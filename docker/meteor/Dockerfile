FROM node
MAINTAINER Pierre-Eric Marchandet <pemarchandet@gmail.com>

# Import the complete app
ADD bundle /bundle

ENV NODE_PATH /usr/local/lib/node_modules

# Install node-fiber
RUN npm -g install fibers

# Launch application
ENV PORT 3000
ENV MONGO_URL 127.0.0.1
ENV MONGO_OPLOG_URL 127.0.0.1

# Not necessary but clearer in development
EXPOSE 3000

# Lauch app
RUN node /bundle/main.js
