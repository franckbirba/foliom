/*
- http://stackoverflow.com/questions/426258/checking-a-checkbox-with-jquery

*/


Template.applyActions.rendered = function () {

    // clear building_doc session var
    Session.set('current_building_doc', null);

    if (Session.get('current_portfolio_doc')) {
        // If a Portfolio is alreay "selected", then use it
        $("#portfolioSelect").val( Session.get('current_portfolio_doc')._id ).change();
    } else {
        // Else init by choosing a random Portfolio from the current Estate doc
        $("#portfolioSelect").val(Portfolios.findOne()._id).change();
    }

    // On Portfolio selector change: set the correct current Portfolio Doc
    $("#portfolioSelect").change(function(){
        Session.set('current_portfolio_doc',
            Portfolios.findOne( $("#portfolioSelect").val() )
        );
    });

};

Template.applyActions.helpers(
    {
        getUsableActions: function(){
            return Actions.find({
                $or: [
                    { // generic actions
                        "estate_id": { $exists: false },
                        "action_type": "generic"
                    },
                    { // user_template actions
                        "estate_id": Session.get('current_estate_doc')._id,
                        "action_type": "user_template"
                    }
                ]
            }).fetch();
        }
    }
);

Template.applyActions.helpers({
    currentBuildingName: function(){
        if (Session.get('current_building_doc')) {
            return Session.get('current_building_doc').building_name;
        }
    }
});

Template.applyActions.events({
    'change .checkbox': function(event) {
        // console.log(this);
        // var childActionToCreate = this;

        var childActionToCreate = jQuery.extend(true, {}, this);

        var original_id = this._id ; // need to save it otherwise destroyed by the delete??
        console.log("original_id is: " + original_id);

        if (event.target.checked) {
            //Set the correct properties for the Child Action
            delete childActionToCreate._id ;
            childActionToCreate.action_type = "child";
            childActionToCreate.estate_id = Session.get('current_estate_doc')._id;
            childActionToCreate.building_id = Session.get('current_building_doc')._id;

            // childActionToCreate.action_template_id = this._id;
            childActionToCreate.action_template_id = original_id;

            var newActionID = Actions.insert(childActionToCreate);

            // console.log("child action is:");
            // console.log(childActionToCreate);
            // console.log("id is: " + newActionID);
        } else {
            // In this case we want to remove the child action
            var childId = Actions.findOne({
                "action_type":"child",
                "building_id": Session.get('current_building_doc')._id,
                "action_template_id": original_id
                })._id;
            Actions.remove(childId);
        }

        // To finish: click the correct node
        var itemToClick = '#' + Session.get('current_building_doc').building_name;

        // But first give the time to reload the graph
        setTimeout(function(){
            $(itemToClick).d3Click();
        },1000);
  }
});
