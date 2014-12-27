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
  getFluidProviders: function () {
    return ;
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
  },
  'click .update-fluidTypes': function(e, template){ // ToDo for update
    Session.set('update_selector', this.valueOf());
    Session.set('update_selectorType', "fluid_type");
    // console.log(template.parentData());
  },
  'click .remove-fluidTypes': function(){
    if (confirm('Really delete "' + this.valueOf() +'"?')) {
        Meteor.call("updateSelector", "fluid_type", this.valueOf() );
    };
  }
});
