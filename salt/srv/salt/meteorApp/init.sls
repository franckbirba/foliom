bundledApp:
  file.managed:
    - name: /var/www/{{pillar['project']['name']}}/{{pillar['project']['name']}}.tgz
    - source: salt://meteorApp/{{pillar['project']['name']}}.tgz
    - skip_verify: True
    - user: {{pillar['project']['name']}}
    - group: {{pillar['project']['name']}}
    - mode: 644
    - require:
      - file: apacheDir
