base:
  '*':
    - latest
    - sockets
    - fail2ban
    # Ubutu's official Mongo (outdated): - mongo_ubuntu
    - mongo_10gen # Create the mongodb group used by state unixusers
    - unixusers   # Create the meteor group and user used by state webserver
    - webserver
    - node
    # @TODO: Apache with GZIP and sticky sessions
    - meteorApp
    # @TODO: Startup script using PM2
