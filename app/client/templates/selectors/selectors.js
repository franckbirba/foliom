Template.selectors.helpers({
    fluidTypesForCurrentEstate: function () {
        return Selectors.find({
            $or: [
                { // get fluidTypes that are generic (no estate_id)
                    "name": "fluid_type",
                    "estate_id": { $exists: false }
                },
                { // and get fluidTypes that are linked to this estate
                    "name": "fluid_type",
                    "estate_id": Session.get('current_estate_doc')._id
                 }
            ]
        }).fetch();
    },
    fluidProvidersForCurrentEstate: function () {
        return Selectors.find({
            $or: [
                { // get fluidTypes that are generic (no estate_id)
                    "name": "fluid_provider",
                    "estate_id": { $exists: false }
                },
                { // and get fluidTypes that are linked to this estate
                    "name": "fluid_provider",
                    "estate_id": Session.get('current_estate_doc')._id
                 }
            ]
        }).fetch();
    },
    usageTypesForCurrentEstate: function () {
        return Selectors.find({
            $or: [
                { // get usage_type that are generic (no estate_id)
                    "name": "lease_usage",
                    "estate_id": { $exists: false }
                },
                { // and get usage_type that are linked to this estate
                    "name": "lease_usage",
                    "estate_id": Session.get('current_estate_doc')._id
                 }
            ]
        }).fetch();
    },
  // beforeRemoveFluidTypes: function () {
  //   return function (collection, name) {
  //     // var doc = collection.findOne(id);
  //     if (confirm('Really delete "' + name +'"?')) {
  //       Meteor.call("updateSelector", "fluid_type", name);
  //     }
  //   };
  // },
});

Template.selectors.events({
  'click .addFluidTypeBtn' : function(){
    Session.set('update_selector', null);
    Session.set('selectorType', "fluid_type");
  },
  'click .addFluidProviderBtn' : function(){
    Session.set('update_selector', null);
    Session.set('selectorType', "fluid_provider");
  },
  'click .addUsageTypeBtn' : function(){
    Session.set('update_selector', null);
    Session.set('selectorType', "lease_usage");
  },
  // 'click .update-fluidTypes': function(e, template){ // ToDo: update
  //   Session.set('update_selector', this.valueOf());
  //   // Session.set('update_selectorType', "fluid_type");
  // },
  'click .remove-fluidTypes': function(){
    if (confirm('Really delete "' + this.valueOf() +'"?')) {
        Meteor.call("updateSelector", "fluid_type", this.valueOf() );
    };
  },
  'click .remove-fluidProviders': function(){
    if (confirm('Really delete "' + this.valueOf() +'"?')) {
        Meteor.call("updateSelector", "fluid_provider", this.valueOf() );
    };
  },
  'click .remove-leaseUsage': function(){
    if (confirm('Really delete "' + this.valueOf() +'"?')) {
        Meteor.call("updateSelector", "lease_usage", this.valueOf() );
    };
  },
});
