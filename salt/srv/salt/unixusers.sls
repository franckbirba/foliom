# Create an eportfolio group for restricting file access
eportfolio_group:
  group.present:
    - name: eportfolio
    - system: True

# Create an eportfolio user for avoiding root execution of ePortfolio
eportfolio_user:
  user.present:
    - name: eportfolio
    - shell: /bin/bash
    - groups:
      - www-data
      - proxy
      - daemon
      - eportfolio
    - createhome: False
