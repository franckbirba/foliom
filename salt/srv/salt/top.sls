base:
  '*':
    #- latest
    #- sockets
    - webserver
    #- fail2ban
    # Ubutu's official Mongo (outdated): - mongo_ubuntu
    #- mongo_10gen
    #- node
    # @TODO: Users and Group: Add a server profile
    # @TODO: Set permissions on Apache's ePortfolio inner site
    # @TODO: Need a mongod restart upon configuration update
    # @TODO: Need a Apache2 restart upon configuration update and enabling site
    # @TODO: Users and Oplog tailing for Mongo + Securizing for localhost only
    # @TODO: Pillar for password and secrets
    # @TODO: Apache with GZIP and sticky sessions
    # @TODO: Meteor bundling, copying, recompiling node-futures, launching with secrets
    # @TODO: Startup script using PM2
