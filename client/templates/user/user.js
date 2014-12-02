var ERRORS_KEY = 'joinErrors';

Template.user.created = function() {
  Session.set(ERRORS_KEY, {});
};

Template.user.helpers({
  errorMessages: function() {
    _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function(key) {
    Session.get(ERRORS_KEY)[key] && 'error';
  }
});

Template.user.events({
  'submit': function(event, template) {
    event.preventDefault();
    var email = template.$('[name=email]').val();
     var username = template.$('[name=username]').val();
    var password = template.$('[name=password]').val();
    var confirm = template.$('[name=confirm]').val();
    var roles = template.$('[name=roles]').val();
    var errors = {};

    if (! email) {
      errors.email = 'Email required';
    }

    if (! username) {
      errors.email = 'username required';
    }

    if (! password) {
      errors.password = 'Password required';
    }

    if (confirm !== password) {
      errors.confirm = 'Please confirm your password';
    }

    Session.set(ERRORS_KEY, errors);
    if (_.keys(errors).length) {
      return;
    }

    Meteor.call("addUser", {
      profile:{username: username},
      email: email,
      password: password
    }, function(error, result){
      console.log(error, result);
        if(roles){
          Meteor.call("addRole", result, roles.split(','),function(error, result){
            console.log(error, result);
          });
        }
        template.$("#userform")[0].reset();
    });
    /*if(roles){
        var tmpUser = Meteor.users.find({email:email}).fetch();
        console.log(email,tmpUser);
       Roles.addUsersToRoles(tmpUser, roles.split(','));
      }*/
  }
});
