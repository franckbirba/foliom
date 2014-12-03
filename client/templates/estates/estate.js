Template.estate.events({
    'click .update_estate': function() {
        // console.log('_id is: ' + this._id);
        Session.set('update_estate_doc', this);
        Session.set('update_estate_var', true);
        // console.log('update_estate_var activated: ' +  Session.get('update_estate_var'));
  }
});

Template.estate.events({
    'click .insert_estate': function() {
        Session.set('update_estate_var', false);
        // console.log('INSERT - update_estate_var is now: ' +  Session.get('update_estate_var'));
  },
});
