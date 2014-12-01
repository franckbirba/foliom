Meteor.publish('configurationMaster', function() {
  return Configurations.find({master: true});
});

Meteor.publish('configurations', function(estateId) {
  return Configurations.find({estate_id: estateId});
});

Meteor.publish('estates', function(estateId) {
  return Estates.find();
});

Meteor.publish("userData", function () {
  if (this.userId) {
    var tmp = Meteor.users.findOne({_id: this.userId});
    if(tmp && tmp.roles && tmp.roles.indexOf('admin') >= 0 ){
      console.log('ADMIN USER DATA');
      return Meteor.users.find();
    }
    else
      return Meteor.users.find({_id: this.userId});
  } else {
    this.ready();
  }
});


Meteor.publish('fluids', function() {
  return Fluids.find();
});

Meteor.publish('selectors', function() {
  return Selectors.find();
});

Meteor.publish('publicLists', function() {
  return Lists.find({userId: {$exists: false}});
});

Meteor.publish('privateLists', function() {
  if (this.userId) {
    return Lists.find({userId: this.userId});
  } else {
    this.ready();
  }
});

Meteor.publish("roles", function (){ 
  return Meteor.roles.find({})
});

Meteor.publish('todos', function(listId) {
  check(listId, String);

  return Todos.find({listId: listId});
});
