# Ensure Python's extension are installed for manipulating PPA repository
python-software-properties:
  pkg.installed

# Install PPA for Node.js, refresh repository and install Node.js
nodejs:
  pkgrepo.managed:
    - ppa: chris-lea/node.js
    - require:
      - pkg: python-software-properties
  # @NOTE: This automatically install NPM
  pkg.latest:
    - names:
      - nodejs
    - refresh: True

# Install PM2's NPM package: Used for launching and monitoring Node.js apps
pm2:
  npm.installed:
    - require:
      - pkg: nodejs
