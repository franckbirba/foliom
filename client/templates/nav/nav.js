Template.nav.rendered = function () {


};

// Subscribe for the correct configurations
    Tracker.autorun(function () {
        if (Session.get('current_estate_doc') ) {
            // console.log("Estate doc changed to: " + Session.get('current_estate_doc').estate_name);
            var estate_doc_id = Session.get('current_estate_doc')._id ;

            // CONFIGURATIONS
            //Subscribe to the Estate config
            Meteor.subscribe('configurations',  estate_doc_id) ;

            //Also set a Session var
            var curr_config = Configurations.findOne( { "master": false }) ;
            if (curr_config) { Session.set('current_config', curr_config ) ; }


            //PORTFOLIOS
            Meteor.subscribe('portfolios',  estate_doc_id) ;
            Session.set('current_portfolio_doc', undefined ); // Empty the current Portfolio doc
        }
    });

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
		'click .select_estate': function() { //??
	        var est = Estates.findOne({_id : this._id});
            // console.log("tmp var est is: ");
            // console.log(est);

            Session.set('current_estate_doc', est );
	        Session.set('editingMasterCfg', false);

	        // console.log('INSERT - update_estate_var is now: ' +  Session.get('update_estate_var'));
		}
	}
);


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
				// console.log(menuEntry, current);

		if(current === menuEntry)
			return 'active';
		return "";
	},
	// getProfilePicture: NOW A GLOBAL HELPER
	// 	var profile = Meteor.user().profile;
	// 	if(profile.picture){
	// 		return "/cfs/files/images/"+ profile.picture;
	// 	}
	// 	return ""
	// },
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

Template.nav.rendered = function () {
    /* FBI: commented annoying behavior*/
    if ( Meteor.user().roles.indexOf('admin') >= 0 && Session.get('current_estate_doc') == undefined ){
        $('#SelectEstateForm').modal('show');
    };

};
