base:
  '*':
    - latest
    - sockets
    - webserver
    - fail2ban
    # - mongo_ubuntu
    - mongo_10gen
    - node
    # @TODO: Users and Group: Add a server profile
    # @TODO: Need a mongod restart upon configuration update
    # @TODO: Users and Oplog tailing for Mongo + Securizing for localhost only
    # @TODO: Pillar for password and secrets
    # @TODO: Apache with GZIP and sticky sessions
    # @TODO: Meteor bundling, copying, recompiling node-futures, launching with secrets
    # @TODO: Startup script using PM2
