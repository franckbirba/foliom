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

# Create Mongo's admin user, project's db and user before setting authentification
createAdmin:
  cmd.run:
    - name: |
        mongo admin --quiet --eval "db.addUser({ user: '{{ pillar['mongo_users']['admin']['user'] }}', pwd: '{{ pillar['mongo_users']['admin']['pwd'] }}', roles: ['userAdminAnyDatabase', 'readWriteAnyDatabase', 'dbAdminAnyDatabase', 'clusterAdmin'] }); db = db.getSiblingDB('{{ pillar['project']['name'] }}'); db.addUser({user: '{{ pillar['mongo_users']['app']['user'] }}', pwd: '{{ pillar['mongo_users']['app']['pwd'] }}', roles: ['readWrtite']});"
    - unless: test -f /var/lib/mongodb/admin.0
    - require:
      - pkg: mongodb-10gen

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
createOplog:
  cmd.run:
    - name: |
        sleep 1;
        initctl start mongodb;
        sleep 1;
        mongo admin -u {{ pillar['mongo_users']['admin']['user'] }} -p {{ pillar['mongo_users']['admin']['pwd'] }} --quiet --eval "rs.initiate(); rs.status(); db.addUser({ user:'{{ pillar['mongo_users']['oplog']['user'] }}', pwd:'{{ pillar['mongo_users']['oplog']['pwd'] }}', roles:[], otherDBRoles:{ local: ['read'] }});"
    - require:
        - service: mongodb
        - file: /etc/mongodb.conf
    - unless: |
        mongo admin -u {{ pillar['mongo_users']['admin']['user'] }} -p {{ pillar['mongo_users']['admin']['pwd'] }} --quiet --eval "rs.status().ok" | grep 1
