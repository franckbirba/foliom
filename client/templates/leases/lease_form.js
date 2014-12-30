AutoForm.hooks({
    insertLeaseForm: {
        before: {
            insert: function(doc, template) {
                // doc.portfolio_id = Session.get('current_estate_doc')._id;
                doc.building_id = Session.get('current_building_id');
                return doc;
            }
            // update: function(docId, modifier, template) {},
            // "methodName": function(doc, template) {}

        },
        onSuccess: function(operation, result, template) {
            var nbLeases_2create = Session.get('nbLeases_2create');

            if(nbLeases_2create>1) {
                // One less lease to create, so we update the session var
                Session.set('nbLeases_2create', nbLeases_2create-1);

                Router.go('leaseForm', {
                            // _id: id
                        });
            } else {
                Session.set('nbLeases_2create', 0);
                Router.go('buildingDetail', {_id: Session.get('current_building_id') });
            }


        },
    }
});


// $("[title^='Tom']")

//<select name="technical_compliance.categories.0.conformity" required="" data-schema-key="technical_compliance.categories.0.conformity" autocomplete="off" class="form-control">

Template.leaseForm.rendered = function () {

    var currentConfigFluids = Configurations.findOne(
                {
                    "master": { $exists: false }
                }
            ).fluids;


        //Apply End-Use to correct field
        var endUses = EndUse.find().fetch() ; // ToDo: check possible collision?

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



        // Set values on change
        $(".tcc_lifetime").change(function(){
            $("[name='technical_compliance.global_lifetime']").val(
                calc_qualitative_assessment_class(".tcc_lifetime")
            )
        });

        $(".tcc_conformity").change(function(){
            $("[name='technical_compliance.global_conformity']").val(
                calc_qualitative_assessment_class(".tcc_conformity")
            )
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
                    // console.log("matchingFluid: "+matchingFluid);
                    // console.log("matchingYearlySubscription: "+matchingYearlySubscription);
                    // console.log("matchingFirstYearValue: "+matchingFirstYearValue);

                    var curr_fluid = matchingFluid.split(" - ");
                    var curr_fluid_provider = curr_fluid[0];
                    var curr_fluid_type = curr_fluid[1];

                    var correctFluid = _.where(currentConfigFluids,
                        {
                            fluid_provider: curr_fluid_provider,
                            fluid_type: curr_fluid_type
                        }
                    )[0]; // force the first element (where returns an array)

                    // console.log("correctFluid: ");
                    // console.log(correctFluid);

                    //target is for example fluid_consumption_meter.0.yearly_cost
                    $("[name='fluid_consumption_meter." + index + ".yearly_cost']").val(
                        matchingYearlySubscription +
                            matchingFirstYearValue * correctFluid.yearly_values[0].cost // cost et pas evolution_index
                    );

                    // Take advatage of this Loop to update totalHeatElecFluids
                    if (curr_fluid_type == "fluid_electricity" || curr_fluid_type == "fluid_heat") {
                        totalHeatElecFluids_array[index] = matchingFirstYearValue ;
                    } else {
                        totalHeatElecFluids_array[index] = 0;
                    }

                    // So now update the field
                    var totalHeatElecFluids = _.reduce(totalHeatElecFluids_array, function(memo, num){ return memo + num; }, 0);
                    $("[name='consumption_by_end_use_total']").val( totalHeatElecFluids );
                }

                // ToDo: create 30 yearly Values
            });
        });

        /* ---------------- */
        /* END-USE FORMULAS */
        /* ---------------- */

        // console.log("totalHeatElecFluids is:" + totalHeatElecFluids);


        // consumption_by_end_use - FORMULAS
        // interesting JQselector: $("[name^='consumption_by_end_use.'][name$='.end_use_name']")

        // var currentEnergyFluids = Configurations.findOne({"fluids.fluid_type": {$in: ["fluid_electricity", "fluid_heat"]}});

        // find all Elecrticity or Heat fluids

        // _.each(currentConfigFluids, function(item, i) {
        //     console.log(item.fluid_type);
        // });


        var ElecFluids = _.where(currentConfigFluids,
                {fluid_type: "fluid_electricity"}
            );
        var HeatFluids = _.where(currentConfigFluids,
                {fluid_type: "fluid_heat"}
            );
        var ElecAndHeatFluids = ElecFluids.concat(HeatFluids);

        // console.log("ElecAndHeatFluids");
        // console.log( JSON.stringify(ElecAndHeatFluids) );




};

/*
[Object fluid_provider: "EDF"fluid_type: "fluid_electricity"global_evolution_index: 0.029yearly_values: Array[31]0: Objectcost: 1evolution_index: 0year: 2014

*/

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
