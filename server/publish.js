Meteor.publish('configurationMaster', function() {
  return Configurations.find({master: true});
});

Meteor.publish('configurations', function(estateId) {
  return Configurations.find({estate_id: estateId});
});

Meteor.publish('estates', function() {
  return Estates.find();
});

Meteor.publish('images', function() {
  return Images.find();
});

Meteor.publish('portfolios', function(estateId) {
    // return Portfolios.find(); // TODO : if(!Admin) then : only send relevant Portfolios
    var curr_est_doc = Estates.findOne(estateId);

    // only return smthg if curr_est_doc is defined and has a "portfolio_collection"
    if (curr_est_doc !== undefined && curr_est_doc.hasOwnProperty("portfolio_collection") ) {
        return Portfolios.find({_id: {$in : curr_est_doc.portfolio_collection} },
                            {sort: {name:1}}
                            );
    }
});

Meteor.publish('buildings', function(portfolioId) {
  return Buildings.find(); // TODO : only send relevant Buildings
});

Meteor.publish('leases', function(portfolioId) {
  return Leases.find(); // TODO : only send relevant Leases
});

Meteor.publish('endUses', function(portfolioId) {
  return EndUse.find(); // TODO : only send relevant EndUses
});

Meteor.publish('messages', function(portfolioId) {
  return Messages.find(); // TODO : only send relevant Messages
});

Meteor.publish('actions', function(portfolioId) {
  return Actions.find(); // TODO : only send relevant Actions
});

// Test
Meteor.publish('circles', function() {
  return Circles.find();
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
