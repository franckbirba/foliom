var ERRORS_KEY = 'joinErrors';

Template.fluids.created = function() {
  Session.set(ERRORS_KEY, {});
};

Template.fluids.helpers({
  errorMessages: function() {
    _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function(key) {
    Session.get(ERRORS_KEY)[key] && 'error';
  },
  fluids: function () {
    return Fluids.find().fetch();
  },
  fluidCollection: function(){
    return Fluids;
  },
  fluidSchema: function () {
    return Schema.Fluids;
  },
  getEstate: function() {
    return Session.get('current_estate_doc') ? Session.get('current_estate_doc')._id : null ;
  },
  getType: function(){
    var curFluid = Session.get('update_fluid');
      return curFluid ? true : false;
  },
  getFluid: function(){
    return Session.get('update_fluid') ? Session.get('update_fluid') : null;
  },
  beforeRemove: function () {
    return function (collection, id) {
      var doc = collection.findOne(id);
      if (confirm('Really delete "' + doc.fluid_type + ' ' +doc.fluid_provider+'"?')) {
        this.remove();
      }
    };
  },
  getFormTitle: function(){
    var tmpFluid = Session.get('update_fluid');
    if(tmpFluid){
      return tmpFluid.fluid_type + " " + tmpFluid.fluid_provider;
    }
    return "New Fluid";
  }
});

// Helpers for Fluid types and Fluid providers
Template.fluids.helpers({
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
});

Template.fluids.events({
  'click .addFluidBtn' : function(event){
     event.preventDefault();
    Session.set('update_fluid', null);
  },
  'click .update-fluid': function(){
    Session.set('update_fluid', this);
  }
});
