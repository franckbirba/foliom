Template.home.events({
  'click .sextan': function() {
    Router.go('observatory');
  },
  'click .compass': function() {
    Router.go('actions-home');
  },
});

Template.home.helpers({
  username: function () {
     return Meteor.user() && Meteor.user().emails.shift().address;
   }
});

// On Template rendered: Display Modal to choose Estate if Session Var is empty and User is linked to multiple Estates
Template.home.rendered = function () {
	/* FBI: commented annoying behavior*/
    if ( Meteor.user().roles.indexOf('admin') >= 0 && !Session.get('current_estate_doc')){
        $('#SelectEstateForm').modal('show');
    }
};
