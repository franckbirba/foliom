Router.configure({
  // we use the  appBody template to define the layout for the entire app
  layoutTemplate: 'appBody',

  // the appNotFound template is used for unknown routes and missing lists
  notFoundTemplate: 'appNotFound',

  // show the appLoading template whilst the subscriptions below load their data
  //loadingTemplate: 'appLoading',

  // wait on the following subscriptions before rendering the page to ensure
  // the data it's expecting is present
  waitOn: function() {
    return [
      Meteor.subscribe('publicLists'),
      Meteor.subscribe('privateLists'),
			Meteor.subscribe('configurationMaster'),
      Meteor.subscribe("userData"),
      Meteor.subscribe('estates', null),
      // Meteor.subscribe('portfolios', null), // Portfolio sub. is now done when Estate is set (in NAV.js)
      Meteor.subscribe('buildings', null),
      Meteor.subscribe('leases', null),
      Meteor.subscribe('fluids', null),
      Meteor.subscribe('selectors', null),
      Meteor.subscribe('endUses', null),
      Meteor.subscribe('messages', null),
      Meteor.subscribe('circles', null), // test
      Meteor.subscribe('images'),
      Meteor.subscribe('actions'),
    ];
  }
});

dataReadyHold = null;

if (Meteor.isClient) {
  // Keep showing the launch screen on mobile devices until we have loaded
  // the app's data
  dataReadyHold = LaunchScreen.hold();
	var requireLogin = function() {
		if(! Meteor.user()){
			this.render('signin');
		} else {
			this.next();
		}
	};
	Router.onBeforeAction(requireLogin);


  // Show the loading screen on desktop
  //Router.onBeforeAction('loading', {except: ['join', 'signin']});
  //Router.onBeforeAction('dataNotFound', {except: ['join', 'signin']}); //?? Pourquoi avoir retiré ?
}



Router.map(function() {
    this.route('join');
    this.route('signin');
    this.route('settings');
    this.route('estate');
    this.route('portfolios');
    this.route('buildings');
    this.route('observatory');
    this.route('user');
    this.route('fluids');
    this.route('playground');
    this.route('selectors');
    this.route('scenarioForm');
    this.route('timeline');
    this.route('home', {
        path: '/'
    });

    // this.route('/estate', {name: 'insertEstateForm'});
    this.route('insertEstateForm', {
        path: '/estate_form' }
    );
    this.route('insertBuildingForm', {
        path: '/building_form' }
    );
    this.route('newBuilding', {
        path: '/new_building' }
    );

    this.route('/buildings/:_id', {
      name: 'buildingDetail',
      data: function() {
            //console.log(this.params);
            var curr_building = Buildings.findOne( this.params._id);

            // Apparently the router goes several times through the loop
            // We have to catch this annoying behavior, and give it time to let the Data be ready
            if (!curr_building) {
                return false;
            }
            // console.log(curr_building);
            // console.log(curr_building.portfolio_id);

            curr_portfolio = Portfolios.findOne( {_id: curr_building.portfolio_id } ) ;
            curr_estate = Estates.findOne( {portfolio_collection: curr_portfolio._id} ) ;

            // Set Session var for Estate & Building
            Session.set('current_building_doc', curr_building);
            Session.set('current_portfolio_doc', curr_portfolio);
            Session.set('current_estate_doc', curr_estate);

            return curr_building;
        } // Used in case of direct link to building
    });

    this.route('leaseForm', {
        path: '/lease_form' }
    );

    this.route('actionForm', {
        path: '/action-form' }
    );

    this.route('actionsList', {
        path: '/actionsList' }
    );

    this.route('actionHome', {
        path: '/actionHome' }
    );

    this.route('applyActions', {
        path: '/applyActions' }
    );

    this.route('treeTplt', {
        path: '/tree' }
    );

  this.route('listsShow', {
    path: '/lists/:_id',
    // subscription, we'll just render the items as they arrive
    onBeforeAction: function () {

      if (this.ready()) {
        // Handle for launch screen defined in app-body.js
        dataReadyHold.release();
      }
    },
    data: function () {
      return Lists.findOne(this.params._id);
    },
    action: function () {
			if(!Meteor.user()){
				return Router.go('signin');
			}
      this.render();
    }
  });


});
