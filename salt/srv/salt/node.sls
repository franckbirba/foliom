python-software-properties:
  pkg.installed

nodejs:
  pkgrepo.managed:
    - ppa: chris-lea/node.js
  pkg.latest:
    - names:
      - nodejs
    - refresh: True
