Template.SelectEstate.events({
  'click .select_estate': function() {
    Session.set('current_estate_doc', this);
    Session.set('editingMasterCfg', false);
    $('#SelectEstateForm').modal('hide');
  }
});
