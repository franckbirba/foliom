db = db.getSiblingDB('admin');
db.addUser({
  user: {{ pillar['mongo_users']['admin']['user'] }},
  pwd: {{ pillar['mongo_users']['admin']['pwd'] }},
  roles: [ 'userAdminAnyDatabase', 'clusterAdmin' ]
});
