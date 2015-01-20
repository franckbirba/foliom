AutoForm.hooks({
    insertLeaseForm: {
        before: {
            insert: function(doc, template) {

                //  var testDoc = jQuery.extend(true, {}, doc);
                // console.log(testDoc);

                //Hack for textfields that we always want in English
                //If language is not English
                if ( TAPi18n.getLanguage() !== 'en') {
                    _.each(doc.consumption_by_end_use, function(end_use, i) {
                         // var endUseinEN = Meteor.call("toEnglish", end_use.end_use_name);
                         var endUseinEN = TAPi18n.__(end_use.end_use_name, null, 'fr' );
                         doc.consumption_by_end_use[i].end_use_name = endUseinEN;
                    });
                }

                // console.log(doc);
                // debugger

                /* ------------------------------------- */
                /* --- Insert EndUse data in Estate --- */
                /* ------------------------------------- */
                var leaseEndUses = _.pluck(doc.consumption_by_end_use, "end_use_name"); // extract all EndUses from the Lease doc
                console.log(leaseEndUses);

                var currEstate = Estates.findOne(Session.get('current_estate_doc')._id) ;

                if(currEstate.estate_properties && currEstate.estate_properties.endUseList) {
                    var estateEndUseList = currEstate.estate_properties.endUseList ;
                } else {
                    estateEndUseList = [] ;
                }
                // Use union method to keep all unique endUses
                var newEndUseList = _.union(estateEndUseList, leaseEndUses) ;

                Estates.update(Session.get('current_estate_doc')._id,
                    { $set: {
                        "estate_properties.endUseList" : newEndUseList
                      }
                    },
                    {validate: false}
                );

                /* ------------------------------------- */
                /* --- Insert relevant data in Lease --- */
                /* ------------------------------------- */
                doc.building_id = Session.get('current_building_id');
                return doc;
            }
            // update: function(docId, modifier, template) {},
            // "methodName": function(doc, template) {}

        },
        onSuccess: function(operation, result, template) {

            // If update: go back to buildingDetail
            if( Session.get('leaseToEdit') ) {
                Router.go('building-detail', {_id: Session.get('current_building_doc')._id });
            }
            else {
                /* ------------------------------------- */
                /* Manage the number of Leases to create */
                /* ------------------------------------- */
                var nbLeases_2create = Session.get('nbLeases_2create');

                if(nbLeases_2create>1) {
                    // One less lease to create, so we update the session var
                    Session.set('nbLeases_2create', nbLeases_2create-1);

                    Router.go('lease-form', {
                                // _id: id
                            });
                } else {
                    Session.set('nbLeases_2create', 0);
                    Router.go('building-detail', {_id: Session.get('current_building_id') });
                }
            }

        },
    }
});

Template.leaseForm.destroyed = function () {
    Session.set('leaseToEdit', null);
};

Template.leaseForm.helpers({
    getLeaseToEdit: function(){
        if( Session.get('leaseToEdit') ) {
            return Session.get('leaseToEdit');
        }
        else return null;
    },
    getType: function(){
        if( Session.get('leaseToEdit') ) {
            return "update";
        } else {
            return "insert";
        }
    }
});


Template.leaseForm.rendered = function () {

    //Apply End-Use to correct field
    var endUses = EndUse.find().fetch() ; // ToDo: check possible collision?

    Tracker.autorun(function () {

        // Set values on change
        $(".tcc_lifetime").change(function(){
            $("[name='technical_compliance.global_lifetime']").val(
                calc_qualitative_assessment_class(".tcc_lifetime")
            ).change();
        });

        $(".tcc_conformity").change(function(){
            $("[name='technical_compliance.global_conformity']").val(
                calc_qualitative_assessment_class(".tcc_conformity")
            ).change();
        });

        if( !Session.get('leaseToEdit') ){
            $(".end_use_name").each(function( index ) {
                $(this).val( transr(endUses[index].end_use_name) );
                $(this).prop("readonly","readonly") ;
                // $(this).val( index );
            });

            $(".technical_compliance_name").each(function( index ) {
                $(this).val( transr( technical_compliance_items[index]) );
                $(this).prop("readonly","readonly") ;
                // $(this).val( index );
            });


            /* ------------------------------------------------------------------------ */
            /* conformity_information (Conformité réglementaire / audits / diagnostics) */
            /* ------------------------------------------------------------------------ */

            // Set the Names
            $("[name^='conformity_information.'][name$='.name']").each(function( index ) {
                $(this).val( transr( conformity_information_items[index]) );
                $(this).prop("readonly","readonly") ;
                // i18n.t($(this).val(), { lng: 'en' });
                // console.log( TAPi18n.__($(this).val(), null, 'en' ) );
            });

            var lease_autovalues = false;
            if (lease_autovalues){

                $("[name^='fluid_consumption_meter.'][name$='.first_year_value']").each(function( index ) {
                    $(this).val( randomIntFromInterval(0,100) );
                });
                $("[name^='fluid_consumption_meter.'][name$='.yearly_subscription']").each(function( index ) {
                    $(this).val( randomIntFromInterval(0,100) );
                });

                $("[name^='technical_compliance.categories.'][name$='.lifetime']").each(function( index ) {
                    $(this).val( "bad_dvr" );
                });

                $("[name^='technical_compliance.categories.'][name$='.conformity']").each(function( index ) {
                    $(this).val( "compliant" );
                });

                $("[name^='conformity_information.'][name$='.eligibility']").each(function( index ) {
                    if(randomIntFromInterval(0,1)>0){
                        $(this).prop("checked", true);
                    }
                });

                var fakeOptionInput = function (name1, name2){
                    var options = $("[name='"+name1+".0."+name2+"'] option").map(function() { return $(this).val(); });
                    $("[name^='"+name1+".'][name$='."+name2+"']").each(function( index ) {
                        $(this).val( options[randomIntFromInterval(1,options.length-1)] );
                    });
                }

                fakeOptionInput("conformity_information", "periodicity");
                fakeOptionInput("conformity_information", "conformity");

                $("[name^='conformity_information.'][name$='.due_date']").each(function( index ) {
                    $(this).val("2015-01-16");
                });
                $("[name^='conformity_information.'][name$='.last_diagnostic']").each(function( index ) {
                    $(this).val("2015-01-16");
                });

                var options = $("[name='consumption_by_end_use.0.fluid_id'] option").map(function() { return $(this).val(); });
                $("[name^='consumption_by_end_use.'][name$='.fluid_id']").each(function( index ) {
                    $(this).val( options[3] );
                });

            }

        }
    });

    var totalHeatElecFluids = 0;
    var totalHeatElecFluids_array = [];

    // Monitor fluid_consumption_meter and apply formulas
    Tracker.autorun(function () {

        $("[name^='fluid_consumption_meter.'][name$='.yearly_cost']").each(function( index ) {
        // "fluid_consumption_meter.0.yearly_cost"

            var matchingFluid = AutoForm.getFieldValue("insertLeaseForm", "fluid_consumption_meter." + index + ".fluid_id") ;
            var matchingYearlySubscription = AutoForm.getFieldValue("insertLeaseForm", "fluid_consumption_meter." + index + ".yearly_subscription") ;
            var matchingFirstYearValue = AutoForm.getFieldValue("insertLeaseForm", "fluid_consumption_meter." + index + ".first_year_value") ;

            if (matchingFluid) {

                var correctFluid = fluidToObject(matchingFluid); // gets the Fluid obj in the conf. from a txt like "EDF - fluid_heat"

                // console.log("correctFluid: ");
                // console.log(correctFluid);

                //target is for example fluid_consumption_meter.0.yearly_cost
                $("[name='fluid_consumption_meter." + index + ".yearly_cost']").val(
                    matchingYearlySubscription +
                        matchingFirstYearValue * correctFluid.yearly_values[0].cost // cost et pas evolution_index
                );

                /* ---------------------------------------------- */
                /* END-USE FORMULAS: consumption_by_end_use_total */
                /* ---------------------------------------------- */
                    // 1- Take advatage of this Loop to update totalHeatElecFluids
                    if (correctFluid.fluid_type == "fluid_electricity" || correctFluid.fluid_type == "fluid_heat") {
                        totalHeatElecFluids_array[index] = matchingFirstYearValue ;
                    } else {
                        totalHeatElecFluids_array[index] = 0;
                    }

                    // So now update the field
                    totalHeatElecFluids = _.reduce(totalHeatElecFluids_array, function(memo, num){ return memo + num; }, 0);
                    $("[name='consumption_by_end_use_total']").val( totalHeatElecFluids );
            }

            // ToDo: create 30 yearly Values
        });
    });

    /* ---------------- */
    /* END-USE FORMULAS */
    /* ---------------- */

    // 1 - Set "Specific" field: always field #06
    var endUseVal_array = [];

    Tracker.autorun(function () {
        $("[name^='consumption_by_end_use.'][name$='.first_year_value']").each(function( index ) {
            // console.log(index);
            if (index != 6) { // Exclude 6 as it's the specific field
                var firstYearValue = AutoForm.getFieldValue("insertLeaseForm", "consumption_by_end_use." + index + ".first_year_value") ;
                if(firstYearValue) {endUseVal_array[index] = firstYearValue ;}
            } else {
                endUseVal_array[index] = 0;
            }
        });
        console.log("endUseVal_array is: "+ endUseVal_array);
        var specificFieldValue = _.reduce(endUseVal_array, function(memo, num){ return memo + num; }, 0);
        var totalConsumption = AutoForm.getFieldValue("insertLeaseForm", "consumption_by_end_use_total") ;
        $("[name='consumption_by_end_use.6.first_year_value']").val(
            totalConsumption - specificFieldValue
        ) ;
    });


};


// Template.leaseForm.events({
//   'keyup [name^="rent"]': function(event) {
//     console.log("KEYUP");
//     var curr_field = $('[name=rent]').val();
//     var estimate = curr_field * 2;
//     var update_origin = $('[name=last_significant_renovation]');

//     if ( update_origin !== estimate ) {
//         $('[name=last_significant_renovation]').val(estimate) ;
//     }
//   },
//   'keyup [name="last_significant_renovation"]': function(event) {
//     // console.log("KEYUP");
//     var curr_field = $('[name=last_significant_renovation]').val();
//     var estimate = curr_field / 2;
//     var update_origin = $('[name=rent]');

//     if ( update_origin !== estimate ) {
//         $('[name=rent]').val(estimate) ;
//     }
//   },
// });
