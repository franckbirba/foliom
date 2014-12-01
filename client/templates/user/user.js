var ERRORS_KEY = 'joinErrors';

Template.user.created = function() {
  //Session.set(ERRORS_KEY, {});
};

Template.user.helpers({
  errorMessages: function() {
    return ;//_.values(Session.get(ERRORS_KEY));
  },
  errorClass: function(key) {
    return ;//Session.get(ERRORS_KEY)[key] && 'error';
  }
});

Template.user.events({
  'submit': function(event, template) {
    event.preventDefault();
    var email = template.$('[name=email]').val();
    var password = template.$('[name=password]').val();
    var confirm = template.$('[name=confirm]').val();
    var roles = template.$('[name=roles]').val();
    var errors = {};

    if (! email) {
      errors.email = 'Email required';
    }

    if (! password) {
      errors.password = 'Password required';
    }

    if (confirm !== password) {
      errors.confirm = 'Please confirm your password';
    }

   // Session.set(ERRORS_KEY, errors);
    if (_.keys(errors).length) {
      return;
    }

    Accounts.createUser({
      email: email,
      password: password
    }, function(error) {
      if (error) {
        console.log("CREATE USER ERROR", error);
        return;
        //return Session.set(ERRORS_KEY, {'none': error.reason});
      }
      if(roles){
        var tmpUser = Meteor.users.findOne({email:email});
        console.log(email,tmpUser);
       Roles.addUsersToRoles(tmpUser, roles.split(','));
      }

      Router.go('home');
    });
  }
});
