# Insert 10gen's repository
/etc/apt/sources.list.d/10gen.list:
    file.managed:
    - source: salt://mongo_10gen/10gen.list
    - skip_verify: True

# Extract a key from 10gen's PKI
createkey:
  cmd.run:
    - name: sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
    - unless: apt-key list | grep -q 7F0CEB10
    - require:
      - file: /etc/apt/sources.list.d/10gen.list

# Refresh 10gen's repository and install Mongo
mongodb-10gen:
  pkg.installed:
    # @NOTE: Use '- name: mongodb-org' for 2.6.X releases
    - version: 2.4.12
    - refresh: True
    - require:
      - cmd: createkey

# Create Mongo's admin user before setting authentification
createAdmin:
  cmd.run:
    - name: |
        mongo --quiet --eval "db = db.getSiblingDB('admin'); db.addUser({user: '{{ pillar['mongo_users']['admin']['user'] }}', pwd: '{{ pillar['mongo_users']['admin']['pwd'] }}', roles: [ 'userAdminAnyDatabase', 'clusterAdmin' ] });"
    - unless: test -f /var/lib/mongodb/admin.0

# Ensure service is started at beginning or restarted upon configuration changes
mongo_restart:
  service.running:
    - name: mongodb
    - enable: True
    - reload: True
    - require:
      - pkg: mongodb-10gen
    - watch:
      - pkg: mongodb-10gen
      - file: /etc/mongodb.conf

# Create a configuration file for Mongo
/etc/mongodb.conf:
  file.managed:
    - source: salt://mongo_10gen/mongodb.conf
    - skip_verify: True
    - user: root
    - group: root
    - mode: 644

# Create Oplog user and initiate ReplicaSet
#createOplog:
#  cmr.run:
#    - name: |



# @TODO: With the updated configuration
# mongo --authenticationDatabase admin -u admin -p admin eportfoliodb /srv/salt/mongo_10gen/createEportfolioDbAndUser.js
