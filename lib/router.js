Router.configure({
  // we use the  appBody template to define the layout for the entire app
  layoutTemplate: 'appBody',

  // the appNotFound template is used for unknown routes and missing lists
  notFoundTemplate: 'appNotFound',

  // show the appLoading template whilst the subscriptions below load their data
  loadingTemplate: 'appLoading',

  // wait on the following subscriptions before rendering the page to ensure
  // the data it's expecting is present
  waitOn: function() {
    return [
      Meteor.subscribe('publicLists'),
      Meteor.subscribe('privateLists')
    ];
  }
});

dataReadyHold = null;

if (Meteor.isClient) {
  // Keep showing the launch screen on mobile devices until we have loaded
  // the app's data
  dataReadyHold = LaunchScreen.hold();
	var requireLogin = function() {
		console.log('requireLogin');
		if(! Meteor.user()){
			console.log('not logged in');
			if(Meteor.loggingIn()){
				this.render('signin');
				//this.render(this.loadingTemplate);
			} else {
				this.render('signin');
			}
		} else {
			console.log('logged in');
			this.next();
		}
	}
	Router.onBeforeAction(requireLogin);
	

  // Show the loading screen on desktop
  //Router.onBeforeAction('loading', {except: ['join', 'signin']});
  //Router.onBeforeAction('dataNotFound', {except: ['join', 'signin']});
}



Router.map(function() {
  this.route('join');
  this.route('signin');
	this.route('settings');

  this.route('listsShow', {
    path: '/lists/:_id',
    // subscribe to todos before the page is rendered but don't wait on the
    // subscription, we'll just render the items as they arrive
    onBeforeAction: function () {

      this.todosHandle = Meteor.subscribe('todos', this.params._id);

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

  this.route('home', {
    path: '/'
  });
});

