Template.actionsList.helpers(
    {
        getActions: function(){
            return Actions.find().fetch(); //ToDo : renvoyer les bonnes actions
        }
    }
    // {
    //     getActionLogo: function() {
    //          // var profile = Meteor.user().profile;
    //          console.log($(this));
    //          if(this.logo){
    //              return "/cfs/files/images/"+ this.logo;
    //          }
    //          return "";
    //     }
    // }
);

Template.actionsList.helpers(
    {
        getActionLogo: function() {
             // var profile = Meteor.user().profile;
             console.log($(this));
             if(this.logo){
                 return "/cfs/files/images/"+ this.logo;
             }
             return "";
        }
    }
);
