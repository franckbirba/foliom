Meteor.publish('configurationMaster', function() {
  return Configurations.find({master: true});
});

Meteor.publish('configurations', function(estateId) {
  return Configurations.find({estate_id: estateId});
});

Meteor.publish('estates', function(userId, admin) {
  // If the current user is an Admin, return all Estates. Otherwise, return relevant ones
  if (admin) {
    return Estates.find();
  }
  else {
    return Estates.find({users: userId});
  }
});

Meteor.publish('images', function() {
  return Images.find(); // TODO : see if it's possible to add Estate_id to Images & docs
});

Meteor.publish('portfolios', function(portfolio_collection, admin) {
  // If the current user is an Admin, return all Portfolios. Otherwise, return relevant ones
  if (admin) {
    return Portfolios.find();
  }
  else {
    return Portfolios.find({_id: {$in : portfolio_collection} },
                        {sort: {name:1}}
                        );
  }
});
Meteor.publish('buildings', function(portfolio_collection) {
  return Buildings.find({portfolio_id: {$in: portfolio_collection}});
});
Meteor.publish('leases', function(building_Ids) {
  return Leases.find({building_id: {$in: building_Ids}});
});

Meteor.publish('endUses', function(portfolioId) {
  return EndUse.find(); // TODO : REMOVE EndUses
});
Meteor.publish('fluids', function() {
  return Fluids.find(); // TODO : REMOVE fluids
});

Meteor.publish('messages', function(estateId) {
  // Only send Messages linked to the current Estate, or sent by 'EGIS-news'
  return Messages.find({ $or: [ {estate_id: estateId}, {name: 'EGIS-news'} ] });
});

Meteor.publish('actions', function(estateId) {
  // Only send Actions linked to the current Estate, or that are generic Actions
  return Actions.find({ $or: [ {estate_id: estateId}, {"action_type": "generic"} ] });
});

Meteor.publish('scenarios', function(estateId) {
  return Scenarios.find({"estate_id": estateId });
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

Meteor.publish('selectors', function(estateId) {
  // Return Selectors that have the estate_id prop, or have no estate_id set
  return Selectors.find({ $or: [ {estate_id: estateId}, {estate_id: { $exists: false }} ] });
});

Meteor.publish('roles', function (){
  // Return roles list if authorized
  if (Roles.userIsInRole(this.userId, ['admin', 'estate_manager'])) {
    return Meteor.roles.find({});
  } else {
    // user not authorized. do not publish roles
    this.stop();
    return;
  }
});
