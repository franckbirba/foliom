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
  userSchema: function () {
    return Schema.User;
  },
  roles: function(){
    all_roles = Meteor.roles.find({},{sort: {name:1}}).fetch().map(function(item){
      return item.name;
    });
    return buildOptions(all_roles);
  },
  getType: function(){
    var curUser = Session.get('update_user');
      return curUser ? true : false;
  },
  getUser: function(){
    return Session.get('update_user') ? Session.get('update_user') : null;
  },
  getFormTitle: function(){
    var tmpUser = Session.get('update_user');
    if(tmpUser){
      return tmpUser.profile.firstName + " " + tmpUser.profile.lastName;
    } else {
      return TAPi18n.__("new_user");
    }
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
  }
});

AutoForm.hooks({
  userAutoForm: {
    onSubmit: function(insertDoc, updateDoc, currentDoc){
      // console.log(insertDoc, updateDoc, currentDoc);
      if(!Session.get('update_user')){
        var tmpDoc = {
          email: insertDoc.emails.shift().address,
          profile: insertDoc.profile,
          password: insertDoc.field_for_password
        };

        Meteor.call("addUser", tmpDoc, function(error, result) {
          if(insertDoc.roles){
            Meteor.call("addRole", result, insertDoc.roles,function(error, result) {
              $('#userformmodal').modal('hide');
              Session.set('update_user', null);
            });
          }
        });
      } else {
        // Check if the password was changed: if so, call the corresponding method
        if (updateDoc.$set.hasOwnProperty('field_for_password') && updateDoc.$set.field_for_password.length>0){
          Meteor.call("setPassword", {userId: currentDoc._id, newPassword: updateDoc.$set.field_for_password}, function(error, result){
            console.log(error,result);
          });
        }
        // Remove password from saved doc
        updateDoc.$set.field_for_password = "";
        // Update user
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
