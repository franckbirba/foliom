Template.actionsList.helpers(
    {
        getActions: function(){
            return Actions.find().fetch();
        }
    }
);
