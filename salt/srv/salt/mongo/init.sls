mongodb:
  cmd.run:
    - name: sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
    - unless: apt-key list | grep -q 7F0CEB10
    - require:
      - file: /etc/apt/sources.list.d/10gen.list
  file:
    - managed
    - name: /etc/apt/sources.list.d/10gen.list
    - source: salt://mongo/10gen.list
    - skip_verify: True
  pkg:
    - name: mongodb-org
    - installed
    - refresh: True
