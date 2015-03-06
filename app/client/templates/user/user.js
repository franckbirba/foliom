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
  },
  getAllUsers: function () {
    return Meteor.users.find().fetch();
  },
  users: function () {
    return Meteor.users;
  },
  creation: function(){
    var curUser = Session.get('update_user');
      return curUser ? false : true;
  },
  userSchema: function () {
    return Schema.User;
  },
  roles: function(){
    return [{label:'admin', value:'admin'}, {label:'user', value:'user'}];
  },
  getType: function(){
    var curUser = Session.get('update_user');
      return curUser ? true : false;
  },
  getUser: function(){
    return Session.get('update_user') ? Session.get('update_user') : null;
  },
  // beforeRemove: function () {
  //     return function (collection, id) {
  //       var doc = collection.findOne(id);
  //       console.log(doc);
  //       if (confirm('Really delete "' + doc.profile.firstName + '"?')) {
  //         this.remove();
  //       }
  //     };
  //   },
    getFormTitle: function(){
      var tmpUser = Session.get('update_user');
      if(tmpUser){
        return tmpUser.profile.firstName + " " + tmpUser.profile.lastName;
      }
      return "New User";
    }
});

Template.user.events({
  'click .addUserBtn' : function(){
    Session.set('update_user', null);
  },
  'click .update-user': function(){
    Session.set('update_user', this);
  },
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

AutoForm.hooks({
  userAutoForm: {
    onSubmit: function(insertDoc, updateDoc, currentDoc){
      console.log(insertDoc, updateDoc, currentDoc);
      if(!Session.get('update_user')){
        var tmpDoc = {
          email: insertDoc.emails.shift().address,
          profile: insertDoc.profile,
          password: insertDoc.services.password.bcrypt
        };

        Meteor.call("addUser", tmpDoc, function(error, result) {
            if(insertDoc.roles){
              Meteor.call("addRole", result, insertDoc.roles,function(error, result) {
                $('#userformmodal').modal('hide');
                Session.set('update_user', null);
              });
            }
            // if(roles){
            //   Meteor.call("addRole", result, roles.split(','),function(error, result){
            //     console.log(error, result);
            //   });
            // }
        });
      } else {
        Meteor.call("updateUser", {update: updateDoc, id: currentDoc._id}, function(error, result){
          console.log(error,result);
          $('#userformmodal').modal('hide');
          Session.set('update_user', null);
        });
      }
        this.done();
        return false;
      }
  }
});
