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
	  	},
		'click #login-buttons-logout': function() {
	   		Meteor.logout();
			Router.go('signin');
		},
		'click .en-lang': function() {
			setLanguage('en');
		},
		'click .fr-lang': function() {
			setLanguage('fr');
		},
		'click .select_estate': function() { //??
	    var est = Estates.findOne({_id : this._id});
      Session.set('current_estate_doc', est );
	    Session.set('editingMasterCfg', false);
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
