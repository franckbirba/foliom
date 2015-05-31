FROM debian:latest
MAINTAINER Pierre-Eric Marchandet <pemarchandet@gmail.com>

# ENV MONGO_URL="mongodb://url" MONGO_OPLOG_URL="mongodb://oplog_url" ROOT_URL="http://yourapp.com"
ADD bundle /app
WORKDIR /app
USER root

# Update system
RUN apt-get update
RUN apt-get autoremove

# Install the necessary package
RUN apt-get install -y curl

# Install Meteor
RUN curl https://install.meteor.com/ | sh

# @NOTE Build file from dev environment are removed using .dockerignore file

# Environment variables
EXPOSE 3000

# Launch Meteor
ENTRYPOINT ["meteor"]
CMD ["--production"]
