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
    console.log(Session.get('update_fluid'));
    return Session.get('update_fluid') ? Session.get('update_fluid') : null;
  },
  beforeRemove: function () {
      return function (collection, id) {
        var doc = collection.findOne(id);
        console.log(doc);
        if (confirm('Really delete "' + doc.name + '"?')) {
          this.remove();
        }
      };
    },
    getFormTitle: function(){
      var tmpFluid = Session.get('update_fluid');
      if(tmpFluid){
        return tmpFluid.name;
      }
      return "New Fluid";
    }
});

Template.fluids.events({
  'click .addFluidBtn' : function(event){
     event.preventDefault();
    Session.set('update_fluid', null);
  },
  'click .update-fluid': function(){
    console.log("current fluid ",this);
    Session.set('update_fluid', this);
  }
});

AutoForm.hooks({
  fluidAutoForm: {
    onSubmit: function(insertDoc, updateDoc, currentDoc){
      console.log('SUBMIT');
      console.log(insertDoc, updateDoc, currentDoc);
      insertDoc.estate_id = Session.get('current_estate_doc')._id;
      var tmpId = Fluids.insert(insertDoc);
      this.done();
      return false;
   }
  }
});
