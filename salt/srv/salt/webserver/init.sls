# Install or check Apache installation
apache2:
  pkg:
    - installed
  service.running:
    - enable: True
    - reload: True
    - require:
      - pkg: apache2

# Create a directory for ePortfolio static assets
/var/www/eportfolio:
  file.directory:
    - makedirs: True
    - user: eportfolio
    - group: eportfolio
    - mode: 755

# Set a simple test page
/var/www/eportfolio/test.html:
  file.managed:
    - source: salt://webserver/test.html
    - skip_verify: True
    - user: eportfolio
    - group: eportfolio
    - mode: 644
    - require:
      - file: /var/www/eportfolio

# Create the ePortfolio's configuration for Apache
/etc/apache2/sites-available/010-eportfolio.conf:
  file.managed:
    - source: salt://webserver/010-eportfolio.conf
    - skip_verify: True
    - mode: 644

# Enable ePortfolio's configuration
/etc/apache2/sites-enabled/010-eportfolio.conf:
  file.symlink:
    - target: /etc/apache2/sites-available/010-eportfolio.conf
    - require:
      - file: /etc/apache2/sites-available/010-eportfolio.conf
