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
            console.log("Creating a new Generic action");
            return null;
        }
        if( Session.get('masterAction') ) {
            console.log("Creating a UserTemplate action from a Generic action");
            return Session.get('masterAction');
        }
        if( Session.get('childActionToEdit') ) { // Child action update
            console.log('Editing a child action');
            return Session.get('childActionToEdit');
        }
        if ( Session.get('updateAction') ){ // Generic update case
            console.log("Editing a Generic or UserTemplate action");
            return Session.get('updateAction');
        }
    },
    getType: function(){
        if( Session.get('childActionToEdit') || Session.get('updateAction') ) {
            console.log("Type is: update");
            return "update";
        } else {
            console.log("Type is: insert");
            return "insert";
        }
    }
});

Template.actionForm.rendered = function () {
    // NOT NEEDED?
    // If updating a child Action, then prevent from changing the name
    // if ( Session.get('childActionToEdit') ) {
    //     $('[name="name"]').prop("readonly","readonly") ;
    // }


    allLeases = Leases.find({building_id:Session.get('current_building_doc')._id}).fetch();
    firstLease = allLeases[0];

    Tracker.autorun(function () {
        $("[name^='impact_assessment_fluids.'][name$='.or_kwhef']").each(function( index ) {

            var matchingEndUse = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids." + index + ".opportunity") ;
            var endUseInLease ;
            var meterInLease ;
            var confFluidToUse ;

            if (matchingEndUse) {
                // find the corresponding endUse in the Lease
                _.each(firstLease.consumption_by_end_use, function(endUse) {
                    if(endUse.end_use_name == matchingEndUse){
                        matchingEndUseInLease = endUse;
                        console.log("matchingEndUseInLease: ");
                        console.log(matchingEndUseInLease);
                    }
                });

                // NOT NECESSARILY USEFUL ???
                // find the corresponding fluid_consumption_meter in the Lease
                _.each(firstLease.fluid_consumption_meter, function(meter) {
                    if(meter.fluid_id == matchingEndUseInLease.fluid_id){
                        meterInLease = meter;
                        console.log("meter: ");
                        console.log(meter);
                    }
                });

                // find the corresponding fluid in the Conf
                confFluids = Session.get('current_config').fluids ;
                _.each(confFluids, function(fluid) {
                    completeFluideName = fluid.fluid_provider + " - " + fluid.fluid_type ;
                    if (completeFluideName == matchingEndUseInLease.fluid_id) {
                        confFluidToUse = fluid ;
                    }
                });
                console.log("confFluidToUse") ;
                console.log(confFluidToUse) ;

            }

            var matchingPerCent = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids." + index + ".per_cent") ;

            // If first 2 fields are entered, then set the kWef and yearly_budget
            if (matchingEndUse && matchingPerCent){
                var in_kwhef = matchingEndUseInLease.first_year_value * matchingPerCent/100 ;
                $("[name='impact_assessment_fluids." + index + ".or_kwhef']").val( in_kwhef );

                $("[name='impact_assessment_fluids." + index + ".yearly_budget']").val(
                    // Create loop for all YEARS here ??
                    in_kwhef * confFluidToUse.yearly_values[0].cost
                );
            }

        });

    });


};

Template.actionForm.destroyed = function () {
    Session.set('childActionToEdit', null);
    Session.set('updateAction', null);
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
