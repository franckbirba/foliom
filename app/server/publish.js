Meteor.publish('configurationMaster', function() {
  return Configurations.find({master: true});
});

Meteor.publish('configurations', function(estateId) {
  return Configurations.find({estate_id: estateId});
});

Meteor.publish('estates', function(userId, admin) {
  // If the current user is an Admin, return all Estates. Otherwise, return relevant Estates
  if (admin) {
    return Estates.find();
  }
  else {
    return Estates.find({users: userId});
  }
});

Meteor.publish('images', function() {
  return Images.find();
});

Meteor.publish('portfolios_buildings_leases', function(estateId) {
    // return Portfolios.find(); // TODO : if(!Admin) then : only send relevant Portfolios
    var portforlio_cursor, building_cursor, leases_cursor;
    var cursor_arrray = [];
    var curr_est_doc = Estates.findOne(estateId);

    // only return smthg if curr_est_doc is defined and has a "portfolio_collection"
    if (curr_est_doc !== undefined && curr_est_doc.hasOwnProperty("portfolio_collection") ) {
      // Portfolios
      portforlio_cursor = Portfolios.find({_id: {$in : curr_est_doc.portfolio_collection} },
                          {sort: {name:1}}
                          );
      cursor_arrray.push(portforlio_cursor);

      if (portforlio_cursor.count() > 0){
        // Buildings
        building_cursor = Buildings.find({portfolio_id: {$in: curr_est_doc.portfolio_collection}});
        cursor_arrray.push(building_cursor);

        if (building_cursor.count() > 0){
          // Leases
          buildings = building_cursor.fetch();
          buildingIds = _.pluck(buildings, '_id');
          leases_cursor = Leases.find({building_id: {$in: buildingIds}});
          cursor_arrray.push(leases_cursor);
        }
      }
    } else {
      console.log("- EMPTY ESTATE -")
    }

    return cursor_arrray;
});



// Meteor.publish('leases', function(portfolioId) {
//   return Leases.find(); // TODO : only send relevant Leases
// });

Meteor.publish('endUses', function(portfolioId) {
  return EndUse.find(); // TODO : only send relevant EndUses
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


Meteor.publish('fluids', function() {
  return Fluids.find();
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
