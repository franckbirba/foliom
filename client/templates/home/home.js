Template.home.events({
  'click .js-logout': function() {
    Meteor.logout();
		Router.go('signin');

    // if we are on a private list, we'll need to go to a public one
    // var current = Router.current();
 //    if (current.route.name === 'listsShow' && current.data().userId) {
 //
 //      Router.go('listsShow', Lists.findOne({userId: {$exists: false}}));
 //    }
  	},
	'click #login-buttons-logout': function() {
    Meteor.logout();
		Router.go('signin');
	},
	'click .en-lang': function() {
		TAPi18n.setLanguage('en');
	},
	'click .fr-lang': function() {
		TAPi18n.setLanguage('fr');
	},
    'click .sextan': function() {
        Router.go('observatory');
    },
    'click .compass': function() {
        Router.go('actionHome');
    },
});

Template.home.helpers({
  username: function () {
     return Meteor.user() && Meteor.user().emails.shift().address;
   },
	 lang: function() {
		 return TAPi18n.getLanguage();
	 },
	 langActiv: function(lang) {
		 if(TAPi18n.getLanguage() === lang)
			 return 'active';
		 return '';
	 }
});

// On Template rendered: Display Modal to choose Estate if Session Var is empty and User is linked to multiple Estates
Template.home.rendered = function () {
	/* FBI: commented annoying behavior*/
    if ( Meteor.user().roles.indexOf('admin') >= 0 && !Session.get('current_estate_doc')){
        $('#SelectEstateForm').modal('show');
    };

};
