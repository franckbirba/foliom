mongodb:
  file:
    - managed
    - name: /etc/apt/sources.list.d/10gen.list
    - source: salt://mongo_10gen/10gen.list
    - skip_verify: True
  cmd:
    - run
    - name: sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
    - unless: apt-key list | grep -q 7F0CEB10
    - require:
      - file: /etc/apt/sources.list.d/10gen.list
  pkg:
    # @NOTE: Use '- name: mongodb-org' for 2.6.X releases
    - name: mongodb-10gen
    - version: 2.4.12
    - installed
    - refresh: True
    - require:
      - cmd: mongodb
  /etc/mongodb.conf:
    file.managed:
      - source: salt://mongo_10gen/mongodb.conf
      - skip_verify: True
      - user: root
      - group: root
      - mode: 644
