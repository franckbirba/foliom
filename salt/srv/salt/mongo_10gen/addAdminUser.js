db = db.getSiblingDB('admin');
db.addUser({
  user: 'admin',
  pwd: 'admin',
  roles: [ 'userAdminAnyDatabase', 'clusterAdmin' ]
});
