# Create a Meteor group for restricting file access
meteor_group:
  group.present:
    - name: meteor
    - system: True

# Create a Meteor user for avoiding root execution of Meteor
meteoro_user:
  user.present:
    - name: meteor
    - shell: /bin/bash
    - groups:
      - www-data
      - proxy
      - daemon
      - meteor
    - createhome: False
    - require:
        - group: meteor_group
