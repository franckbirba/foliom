Template.nav.events(
	{
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
		}
	}
);

Template.nav.helpers({
	activPage: function(menuEntry){
		var current = document.URL.split("/").pop();
				console.log(menuEntry, current);

		if(current === menuEntry)
			return 'active';
		return "";
	},
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
})
