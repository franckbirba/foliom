# Create a Meteor group for restricting file access
meteorGroup:
  group.present:
    - name: {{pillar['project']['name']}}
    - system: True

# Create a Meteor user for avoiding root execution of Meteor
meteorUser:
  user.present:
    - name: {{pillar['project']['name']}}
    - shell: /bin/bash
    - groups:
      - www-data
      - proxy
      - daemon
      - mongodb
      - {{pillar['project']['name']}}
    - createhome: False
    - require:
        - group: meteorGroup
