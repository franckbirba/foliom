Template.actionsList.rendered = function () {
  // init session vars
  Session.set('masterAction', null);
  Session.set('newActionType', null);
};


Template.actionsList.helpers({
  getGenericActions: function(){
    return Actions.find({
       "estate_id": { $exists: false },
       "action_type": "generic"
    }).fetch();
  },
  getUserTemplateActions: function(){
    return Actions.find({
       "estate_id": Session.get('current_estate_doc')._id,
       "action_type": "user_template"
    }).fetch();
  }
});


Template.actionsList.events({
    'click .newGenericActionBtn': function(e) {
        e.preventDefault();
        Session.set('newActionType', "generic");

        Router.go('action-form');
    },
    'click .newActionFromMaster': function(e) {
        e.preventDefault();
        Session.set('newActionType', "user_template");
        Session.set('masterAction', this);

        Router.go('action-form');
    },
    'click .newUserTempalteAction': function(e) {
        e.preventDefault();
        Session.set('newActionType', "user_template");

        Router.go('action-form');
    },
    'click .editItem': function(e) { //Sends to the Action form for updating
        e.preventDefault();
        Session.set('updateAction', this);
        Router.go('action-form');
    },
    'click .dropdownBtn': function(e) {
        // e.preventDefault(); // Prevent other events
        e.stopPropagation(); // Prevent propagation
        $('#'+ this._id).dropdown('toggle');
    },
});
