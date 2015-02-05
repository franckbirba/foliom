# Install Mongo package from Ubuntu's official repository
mongodb:
  pkg:
    - installed
  service.running:
    - require:
      - pkg: mongodb
