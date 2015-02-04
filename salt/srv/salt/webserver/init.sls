apache2:
  pkg:
    - installed
  service:
    - running
    - require:
      - pkg: apache2

/etc/apache2/sites-available/010-eportfolio.conf:
  file.managed:
    - source: salt://webserver/010-eportfolio.conf
    - skip_verify: True
    - user: root
    - group: root
    - mode: 644

/var/www/eportfolio:
  file.directory:
    - makedirs: True
    - user: root
    - group: root
    - mode: 755

/var/www/eportfolio/test.html:
  file.managed:
    - source: salt://webserver/test.html
    - skip_verify: True
    - user: root
    - group: root
    - mode: 644
    - require: /var/www/eportfolio
