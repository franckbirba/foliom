/etc/security/limits.conf:
  file.managed:
    - source: salt://sockets/limits.conf
    - skip_verify: True
    - user: root
    - group: root
    - mode: 644

/etc/pam.d/common-session:
  file.managed:
    - source: salt://sockets/common-session
    - skip_verify: True
    - user: root
    - group: root
    - mode: 644
