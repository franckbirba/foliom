Template.actionsList.rendered = function () {
    // init session vars
    Session.set('masterAction', null);
    Session.set('newActionType', null);

};



Template.actionsList.helpers(
    {
        getGenericActions: function(){
            return Actions.find({
               "estate_id": { $exists: false },
               "action_type": "generic"
            }).fetch();
        }
    }
);

Template.actionsList.helpers(
    {
        getUserTemplateActions: function(){
            return Actions.find({
               "estate_id": Session.get('current_estate_doc')._id,
               "action_type": "user_template"
            }).fetch();
        }
    }
);

Template.actionsList.helpers(
    {
        getChildActions: function(){
            return Actions.find({
               "estate_id": Session.get('current_estate_doc')._id,
               "action_type": "child"
            }).fetch();
        }
    }
);

Template.actionsList.helpers(
    {
        getActionLogo: function() {

             // console.log($(this));
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

Template.actionsList.events({
    'click .newGenericActionBtn': function(e) {
        e.preventDefault();
        Session.set('newActionType', "generic");

        Router.go('actionForm');
    },
    'click .newActionFromMaster': function(e) {
        e.preventDefault();
        Session.set('newActionType', "user_template");
        Session.set('masterAction', this);

        Router.go('actionForm');
    },
    'click .newUserTempalteAction': function(e) {
        e.preventDefault();
        Session.set('newActionType', "user_template");

        Router.go('actionForm');
    },
});
