# Install or check Apache installation
apache2:
  pkg:
    - installed

# Ensure service is started at beginning or restarted upon configuration changes
apache2_restart:
  service.running:
    - name: apache2
    - enable: True
    - reload: True
    - require:
      - pkg: apache2
    - watch:
      - pkg: apache2
      - file: apacheVirtualHost
      - file: apacheEnableLink

# Create a directory for Meteor static assets
apacheDir:
  file.directory:
    - name: /var/www/{{pillar['project']['name']}}
    - makedirs: True
    - user: {{pillar['project']['name']}}
    - group: {{pillar['project']['name']}}
    - mode: 755

# Set a simple test page
apacheTestPage:
  file.managed:
    - name: /var/www/{{pillar['project']['name']}}/test.html
    - source: salt://webserver/test.jinja
    - template: jinja
    - skip_verify: True
    - user: {{pillar['project']['name']}}
    - group: {{pillar['project']['name']}}
    - mode: 644
    - require:
      - file: apacheDir

# Create the Meteor's configuration for Apache
apacheVirtualHost:
  file.managed:
    - name: /etc/apache2/sites-available/{{pillar['apache']['priority']}}-{{pillar['project']['name']}}.conf
    - source: salt://webserver/virtualHost.jinja
    - template: jinja
    - skip_verify: True
    - mode: 644

# Enable Meteor's configuration
apacheEnableLink:
  file.symlink:
    - name: /etc/apache2/sites-enabled/{{pillar['apache']['priority']}}-{{pillar['project']['name']}}.conf
    - target: /etc/apache2/sites-available/{{pillar['apache']['priority']}}-{{pillar['project']['name']}}.conf
    - require:
      - file: apacheVirtualHost
