Template.SelectEstate.events({
    'click .select_estate': function() {
        Session.set('current_estate_doc', this);
        Session.get('editingMasterCfg', false);
        $('#SelectEstateForm').modal('hide');
        console.log("current estate in Session is: ");
        console.log(this);
        Meteor.subscribe('configurations', this._id);
        // console.log('INSERT - update_estate_var is now: ' +  Session.get('update_estate_var'));
  }
});
