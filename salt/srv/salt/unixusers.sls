# Create a server user for avoiding root execution of ePortfolio
eportfolio:
  user.present:
    - shell: /bin/bash
    - groups:
      - wheel
      - storage
    - createhome: False
