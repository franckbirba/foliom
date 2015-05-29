#!/bin/bash
mongo admin -u admin -p admin --quiet \
  --eval "rs.initiate(); rs.status(); db.addUser({ user:'oplogger', pwd:'admin', roles:[], otherDBRoles:{ local: ['read'] }});"
