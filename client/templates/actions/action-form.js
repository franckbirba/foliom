AutoForm.hooks({
    insertActionForm: {
        before: {
            insert: function(doc, template) {

                // Get the Action type
                doc.action_type = Session.get('newActionType');

                // If type is user_template, then save the EstateId
                if (Session.get('newActionType') == "user_template") {
                    doc.estate_id = Session.get('current_estate_doc')._id ;
                }

                return doc;
            }
            // update: function(docId, modifier, template) {},
            // "methodName": function(doc, template) {}

        },
        onSuccess: function(operation, result, template) {
            if (Session.get('childActionToEdit')) {
                Session.set('childActionToEdit', null) ;
                Router.go('applyActions');
            }
            else {
                Session.set('newActionType', null) ;
                Router.go('actionsList');
            }


        },
    }
});

Template.actionForm.helpers({
    getAction: function(){
        if( Session.get('newActionType') == "generic") {
            return null;
        }
        if( Session.get('masterAction') ) {
            return Session.get('masterAction');
        }
        if( Session.get('childActionToEdit') ) {
            // console.log('gonna update child');
            return Session.get('childActionToEdit');
        }
    },
    getType: function(){
        if( Session.get('childActionToEdit') ) {
            console.log('gonna UPDATE child');
            return "update";
        } else return "insert";
    }
});

Template.actionForm.rendered = function () {
    // If updating a child Action, then prevent from changing the name
    if ( Session.get('childActionToEdit') ) {
        $('[name="name"]').prop("readonly","readonly") ;

        // Set the selector
        // $("[name^='impact_assessment_fluids.'][name$='.opportunity']").each(function( index ) {

        // });
    }

};

Template.actionForm.destroyed = function () {
    Session.set('childActionToEdit', null);
};

    // var current_building_doc_id = Session.get('current_building_doc')._id;
    // var allLeases = Leases.find({building_id:current_building_doc_id}).fetch();

    // // Build the text domain and the Data
    // _.each(allLeases, function(entry, i) {
    //     dataHolder[i] = {
    //         _id: entry._id
    //     };

    //     dataHolder[i].text_domain = entry.consumption_by_end_use.map(function(item){
    //         return item.end_use_name; // returns an array of the EndUse names
    //     });

// Template.actionForm.events({
//   'keyup [name="investment.ratio"]': function(event) {
//     // console.log("hi");
//     var curr_field = $('[name="investment.ratio"]').val();

//     // Need to associate the Action to the Building!
//     // var current_building = Buildings.find({id:Session.get('current_building_doc')}).fetch();

//     var estimate = curr_field * Session.get('current_building_doc');
//     var update_origin = $('[name="investment.cost"]');

//     if ( update_origin !== estimate ) {
//         $('[name="investment.cost"]').val(estimate) ;
//     }
//   },
//   'keyup [name="investment.cost"]': function(event) {
//     // console.log("KEYUP2");
//     var curr_field = $('[name="investment.cost"]').val();
//     var estimate = curr_field / 2 ;
//     $('[name="investment.ratio"]').val(estimate) ;
//   },

// });
