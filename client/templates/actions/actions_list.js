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
                // Check if the img URL links to images in the public folder
                if(this.logo.charAt(0) == "/") {
                    return this.logo;
                }
                else {
                    return "/cfs/files/images/"+ this.logo;
                }
             }
             return "";
        }
    }
);
