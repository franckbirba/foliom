/*
- http://stackoverflow.com/questions/426258/checking-a-checkbox-with-jquery

*/


Template.applyActions.rendered = function () {

    // clear session var
    Session.set('current_building_doc', null);

    if ($("#portfolioSelect").val()){
        Session.set('current_portfolio_doc',
                Portfolios.findOne( $("#portfolioSelect").val() )
            );
    }

    $("#portfolioSelect").change(function(){
        Session.set('current_portfolio_doc',
            Portfolios.findOne( $("#portfolioSelect").val() )
        );
    });

    // monitor current_building_doc and set the checkboxes accordingly
    // Tracker.autorun(function () {
    //     var currBuilding = Session.get('current_building_doc');

    //     var existingChildActions = Actions.find({
    //                                 "action_type":"child",
    //                                 "building_id": currBuilding._id
    //                                 },
    //                                 {sort: {name:1}}
    //                                 ).fetch();

    //     $( "input[type=checkbox]" ).each(function( index ) {
    //         var currentAction = Actions.find({_id: $(this).val()}).fetch();

    //         if ( _.contains(existingChildActions, $(this).val() ) ) { // check if current Action has a child associated to the building

    //         }
    //         // $(this).is(':checked')
    //     });



    // });


    // $( "input[type=checkbox]" ).on( "click", function() {
    //     console.log( $(this).val() + " is checked!" );
    // });
    // $("input[type=checkbox]:checked").each(
        //     function() {
        //        // Insérer son code ici
        //        alert($(this).attr("id"));
        //     }
        // );


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

// Template.applyActions.helpers({
//     isChecked: function(){
//         //get all child Actions of the current Building
//         existingChildActions = Actions.find({
//                                     "action_type":"child",
//                                     "building_id": currBuilding._id
//                                     },
//                                     {sort: {name:1}}
//                                     ).fetch();

//         if ( _.contains(existingChildActions, this.name) ) {
//             return "checked";
//         }
//     }
// });

Template.applyActions.events({
    'change .checkbox': function(event) {
        // console.log(this);
        if (event.target.checked) {
            var childActionToCreate = this;
            // console.log("original action is:");
            // console.log(this);

            //Set the correct properties for the Child Action
            delete childActionToCreate._id ;
            childActionToCreate.action_type = "child";
            childActionToCreate.building_id = Session.get('current_building_doc')._id;

            var newActionID = Actions.insert(childActionToCreate);

            // console.log("child action is:");
            // console.log(childActionToCreate);
            // console.log("id is: " + newActionID);

        }

        //Check if the Action is already associated
        // var actionExists = Actions.findOne({
        //     action_type: "child",
        //     name: this.name,
        //     building_id: Session.get('current_building_doc')._id,
        // });

        // console.log(actionExists);
  }
});
