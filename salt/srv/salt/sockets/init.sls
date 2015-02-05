# Increase maximum number of sockets and files opening for Meteor user
/etc/security/limits.conf:
  file.managed:
    - source: salt://sockets/limits.conf
    - skip_verify: True
    - user: root
    - group: root
    - mode: 644

# Ensure proper limits depending on user's account
/etc/pam.d/common-session:
  file.managed:
    - source: salt://sockets/common-session
    - skip_verify: True
    - user: root
    - group: root
    - mode: 644
