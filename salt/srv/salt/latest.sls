# Ensure server is at its latests package with security updates
# package update and no unused package except thus installed either
# by sysadmins with CLI operations or by SaltStack.
pkg.upgrade:
  module.run:
    - refresh: True
apt-get autoremove --purge -y:
  cmd.run
