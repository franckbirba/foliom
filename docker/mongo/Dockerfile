FROM mongo
MAINTAINER Pierre-Eric Marchandet <pemarchandet@gmail.com>

COPY mongodb.conf /etc/mongodb.conf
# COPY create_user.sh /create_user.sh
# ENTRYPOINT ['/create_user.sh']

# RUN mongo admin --eval \
#   "db.addUser({ user: 'admin', pwd: 'admin', roles: ['userAdminAnyDatabase', 'readWriteAnyDatabase', 'dbAdminAnyDatabase', 'clusterAdmin'] }); \
#   db = db.getSiblingDB('eportfolio'); \
#   db.addUser({user: 'admin', pwd: 'admin', roles: ['readWrtite']});"

# Not necessary but clearer in development
EXPOSE 27017
