// On Template rendered: make sure we display the Portfolios
Template.observatory.rendered = function () {
    Session.set('portfolio_level', true);

};

// Get list of all Portfolios for current Estate, sorted by alpha (on name)
Template.observatory.helpers({
    isBuilding: function(){
        if ( Session.get('current_portfolio_doc') !== undefined ) {
            return true ;
        }
    }
});


Template.observatory.events({
  'click .select_portfolio': function() {
      Session.set('current_portfolio_doc', this); // "this" is passed by Meteor - it's the current item

      if ( Session.get('portfolio_level') ) {
          Session.set('portfolio_level', false);
          $( "#building_list" ).fadeIn();
      };

      // Meteor.subscribe('configurations', this._id);
      // console.log('INSERT - update_estate_var is now: ' +  Session.get('update_estate_var'));
  },
  'click .glyphicon-globe': function() {
      Session.set('current_portfolio_doc', undefined);
  },
  'click .glyphicon-cog': function() {
      $("#buildingAndLeaseImport").modal('show');
  },
  'click .select_building': function(e) {
      e.preventDefault();
      Session.set('current_building_doc', this); // "this" is passed by Meteor - it's the current item
      Router.go('building-detail', this);
  },
});
