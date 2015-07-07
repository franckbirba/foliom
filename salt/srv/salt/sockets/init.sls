# Increase maximum number of sockets and files opening for Meteor user
limits:
  file.managed:
    - name: /etc/security/limits.conf
    - source: salt://sockets/limits.jinja
    - template: jinja
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
