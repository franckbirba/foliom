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

# Create a configuration file for Mongo
/etc/mongodb.conf:
  file.managed:
    - source: salt://mongo_10gen/mongodb.conf
    - skip_verify: True
    - user: root
    - group: root
    - mode: 644
