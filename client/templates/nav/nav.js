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
		},
		'click .select_estate': function() {
	        Session.set('current_estate_doc', this);
	        Session.set('editingMasterCfg', false);
	        $('#SelectEstateForm').modal('hide');
	        console.log("current estate in Session is: ");
	        console.log(this);
	        Meteor.subscribe('configurations', this._id);
	        // console.log('INSERT - update_estate_var is now: ' +  Session.get('update_estate_var'));
		}
	}
);

Template.nav.events({
    'click .update_estate': function() {
        // console.log('_id is: ' + this._id);
        Session.set('update_estate_doc', this);
        Session.set('editingMasterCfg', false);
        Session.set('update_estate_var', true);
        // console.log('update_estate_var activated: ' +  Session.get('update_estate_var'));
  }
});


Template.nav.helpers({
	currentEstate: function(){
		var estate = Session.get('current_estate_doc');
		return estate ? estate.estate_name : "Estates";
	},
	isAdminEstate: function(){
		var estate = Session.get('current_estate_doc');
		return estate === -1;
	},
	activPage: function(menuEntry){
		var current = document.URL.split("/").pop();
				console.log(menuEntry, current);

		if(current === menuEntry)
			return 'active';
		return "";
	},
	activEstate: function(estate_id){
		return Session.get('current_estate_doc')._id === estate_id ? 'active' : '';
	},
	estates: function(){
		return Estates.find().fetch();
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
});
