var ERRORS_KEY = 'signinErrors';

Template.signin.created = function() {
  Session.set(ERRORS_KEY, {});
};

Template.signin.helpers({
  errorMessages: function() {
    return _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function(key) {
    return Session.get(ERRORS_KEY)[key] && 'error';
  },
  emailPlaceholder: function() {
    return TAPi18n.__('your_email');
  },
  passwordPlaceholder: function() {
    return TAPi18n.__('your_password');
  }
});

Template.signin.events({
  'submit': function(event, template) {
    event.preventDefault();

    var email = template.$('[name=email]').val();
    var password = template.$('[name=password]').val();

    var errors = {};

    if (! email) {
      errors.email = TAPi18n.__('email_required');
    }

    if (! password) {
      errors.password = TAPi18n.__('password_required');
    }

    Session.set(ERRORS_KEY, errors);
    if (_.keys(errors).length) {
      return;
    }

    Meteor.loginWithPassword(email, password, function(error) {
      if (error) {
        return Session.set(ERRORS_KEY, {'none': error.reason});
      }
       TAPi18n.setLanguage(Meteor.user().profile.lang)
        .done(function () {
        })
      .fail(function (error_message) {
        // Handle the situation
        console.log(error_message);
      });
      Router.go('home', Meteor.user);
    });
  }
});
