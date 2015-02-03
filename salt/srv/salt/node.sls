python-software-properties:
  pkg.installed

nodejs:
  pkgrepo.managed:
    - ppa: chris-lea/node.js
    - require:
      - pkg: python-software-properties
  pkg.latest:
    - names:
      - nodejs
    - refresh: True

npm:
  pkg.installed:
    - require:
      - pkg: nodejs

pm2:
  npm.installed:
    - require:
      - pkg: npm
