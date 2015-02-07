base:
  '*':
    - latest
    - sockets
    - fail2ban
    # Ubutu's official Mongo (outdated): - mongo_ubuntu
    - mongo_10gen
    - unixusers
    - webserver
    - node
    # @TODO: Users and Oplog tailing for Mongo + Securizing for localhost only
    # @TODO: Pillar for password and secrets
    # @TODO: Apache with GZIP and sticky sessions
    # @TODO: Meteor bundling, copying, recompiling node-futures, launching with secrets
    # @TODO: Startup script using PM2
