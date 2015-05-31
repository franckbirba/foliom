FROM debian:latest
MAINTAINER Pierre-Eric Marchandet <pemarchandet@gmail.com>

# Import sources
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

# Set environment variables for Meteor
ENV MONGO_URL "mongodb://mongo-eportfolio:27017"
# MONGO_OPLOG_URL="mongodb://oplog_url"
# ROOT_URL="http://yourapp.com"

# Launch Meteor
COPY startMeteor.sh /app/startMeteor.sh
CMD ["/app/startMeteor.sh"]
