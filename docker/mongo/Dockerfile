FROM mongo
MAINTAINER Pierre-Eric Marchandet <pemarchandet@gmail.com>

ADD mongodb.conf /etc/mongodb.conf

# mongo admin -u {{ pillar['mongo_users']['admin']['user'] }} -p {{ pillar['mongo_users']['admin']['pwd'] }} --quiet --eval "rs.initiate(); rs.status(); db.addUser({ user:'{{ pillar['mongo_users']['oplog']['user'] }}', pwd:'{{ pillar['mongo_users']['oplog']['pwd'] }}', roles:[], otherDBRoles:{ local: ['read'] }});"
