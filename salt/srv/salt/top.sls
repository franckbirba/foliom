base:
  '*':
    - latest
    - webserver
    - fail2ban
    # - mongo_ubuntu
    - mongo_10gen
    - node
    # @TODO: Socket configuration at kernel level
    # @TODO: Users and Oplog tailing for Mongo + Securizing for localhost only
    # @TODO: Pillar for password and secrets
    # @TODO: Apache with GZIP and sticky sessions
    # @TODO: NPM packages: pm2, mongo-hacker
    # @TODO: Meteor bundling, copying, recompiling node-futures, launching with secrets
