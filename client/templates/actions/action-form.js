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
                // Session.set('childActionToEdit', null); // Always set "nul when template destroyed
                Router.go('applyActions');
            }
            else {
                // Session.set('newActionType', null); // Always set "nul when template destroyed
                Router.go('actionsList');
            }


        },
    }
});

Template.actionForm.destroyed = function () {
    Session.set('newActionType', null);
    Session.set('childActionToEdit', null);
    Session.set('updateAction', null);
    Session.set('masterAction', null);
};

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

    // Only apply formulas if we're editing a child action
    if ( Session.get('childActionToEdit') ) {
        /* -------------- */
        /* EndUse formula */
        /* -------------- */
        allLeases = Leases.find(
                {building_id:Session.get('current_building_doc')._id},
                {sort: {lease_name:1}}
            ).fetch();
        var allEndUseData = [];
        var confFluids = Session.get('current_config').fluids ;

        var all_yearly_savings = []; // Will contain all savings, for each EndUse
        // // Init this array
        // for (var i = 0; i < 31; i++)
        //     all_yearly_savings.push({
        //         "year": 0,
        //         "euro_savings": 0
        //     });
        // console.log(all_yearly_savings);

        this.autorun(function () {
            // Have this loop monitor all opportunity Selectors
            // Being in an autoRun, it's reactive
            $("[name^='impact_assessment_fluids.'][name$='.opportunity']").each(function( index ) {

                var matchingEndUse = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids." + index + ".opportunity") ;

                if (matchingEndUse !== "") { // We make sure that something is selected
                    var matchingEndUseInLease = []; // Array in which we'll store all relevant Data

                    // We now have an opportinity. We go through all Leases: for each one we find the corresponding endUse in the Lease
                    // Note: could be better with a "break" when the EndUse is found
                    _.each(allLeases, function(lease, leaseIndex) {
                        _.each(lease.consumption_by_end_use, function(endUse) {
                            if(endUse.end_use_name == matchingEndUse){
                                endUse.lease_name = lease.lease_name ;
                                endUse.consumption_by_end_use_total = lease.consumption_by_end_use_total;

                                // For each EndUse found, we search for the corresponding Fluid in the conf
                                _.each(confFluids, function(fluid) {
                                    completeFluideName = fluid.fluid_provider + " - " + fluid.fluid_type ;
                                    if (completeFluideName == endUse.fluid_id) {
                                        endUse.fluid = fluid ; // We store the Fluid in the array
                                    }
                                });

                                matchingEndUseInLease[leaseIndex] = endUse;
                            }
                        });
                    });
                    /* matchingEndUseInLease looks like
                    [{
                        "end_use_name":"end_use_heating",
                        "fluid_id":"EDF - fluid_heat",
                        "lease_name":"Lease1Test",
                        "first_year_value":12,
                        "consumption_by_end_use_total":98,
                        "fluid":{
                            "fluid_type":"fluid_heat",
                            "fluid_provider":"EDF",
                            "yearly_values":[
                                {"year":2014,"cost":10,"evolution_index":0},
                                {"year":2015,"cost":10,"evolution_index":0},
                                {"year":2016,"cost":10.1,"evolution_index":1},
                                ...
                                {"year":2043,"cost":10.5,"evolution_index":0},
                                {"year":2044,"cost":10.5,"evolution_index":0}
                            ],
                            "global_evolution_index":5
                        }
                    },
                    {
                        "end_use_name":"end_use_heating",
                        "fluid_id":"EDF - fluid_electricity",
                        "lease_name":"thisLease2",
                        "first_year_value":30,
                        "consumption_by_end_use_total":170,
                        "fluid":{
                            "fluid_type":"fluid_electricity",
                            "fluid_provider":"EDF",
                            "yearly_values":[{...}]
                    */
                    console.log("matchingEndUseInLease "+"for index: "+index);
                    console.log(matchingEndUseInLease);

                    allEndUseData[index] = matchingEndUseInLease; // Remeber: index is the line number in the form
                    console.log("allEndUseData: ");
                    console.log(allEndUseData);

                    // We now have all EndUses for all Leases
                    // -------------------------------------------------------


                    // -------------------------------------------------------
                    // If first EndUse and matchingPerCent fields are entered, then set the kWef

                    var matchingPerCent = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids." + index + ".per_cent")*1 ;
                    // var matchingKWhEF = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids." + index + ".or_kwhef")*1 ;

                    // if matchingPerCent has a value
                    if (matchingPerCent !== 0){
                        var in_kwhef = 0 ;

                        // matchingEndUseInLease contains all that we need - we're still in the loop that applies to each line
                        // We go through each endUse and sum the percent*EndUse_consumption
                        _.each(matchingEndUseInLease, function(endUse, tmp_index) {
                            // console.log("endUse.first_year_value is: " + endUse.first_year_value) ;
                            result = (endUse.first_year_value * matchingPerCent/100) ;
                            endUse.in_kwhef_lease = result;

                            in_kwhef += result;
                        });

                        // Now set the in_kwhef val
                        $("[name='impact_assessment_fluids." + index + ".or_kwhef']").val( in_kwhef.toFixed(2) ).change();
                    }

                    // -------------------------------------------------------
                    // If first matchingPerCent and in_kwhef are set, then set yearly_savings
                    // AND: create all yearly values
                    if (in_kwhef !== 0){

                        var yearly_savings = []; // In this array we'll store the total savings for this EndUse
                        // Init this array
                        for (var i = 0; i < 31; i++)
                            yearly_savings.push({
                                "year": 0,
                                "euro_savings": 0
                            });

                        _.each(matchingEndUseInLease, function(endUse, tmp_index) {
                            // For this endUse, create yearly values for in_kwhef
                            var impact_assessment = [];
                            _.each(endUse.fluid.yearly_values, function(year, year_index) {
                                //For each year, calc the euro reduction : in_kwhef_lease * yearly fuild cost
                                var euro_reduction = (endUse.in_kwhef_lease * year.cost).toFixed(2)*1;

                                //Save the result in the EndUse
                                impact_assessment[year_index] = {
                                    "year": year.year,
                                    "euro_savings": euro_reduction
                                }

                                //We also create the sum in the yearly_savings array
                                var yearly_total = (yearly_savings[year_index].euro_savings + euro_reduction).toFixed(2)*1
                                yearly_savings[year_index] = {
                                    "year": year.year,
                                    "euro_savings": yearly_total
                                };
                            });
                            endUse.impact_assessment_fluids = impact_assessment;

                        });

                        $("[name='impact_assessment_fluids." + index + ".yearly_savings']").val(yearly_savings[0].euro_savings ).change();

                        console.log("yearly_savings " + index + " is:");
                        console.log(yearly_savings);

                        // Save the yearly savings in the array that stores all savings
                        all_yearly_savings[index] = {
                            "opportunity": matchingEndUseInLease[0].end_use_name,
                            "savings": yearly_savings
                        }
                    }

                }
                console.log("all_yearly_savings");
                console.log(all_yearly_savings);
            });
        });


        /* ------------------ */
        /* Other form formula */
        /* ------------------ */

        // Investment ratio and cost
        $("[name='investment.ratio'], [name='investment.cost']").change(function() {
            var curr_field = $(this).val()*1;
            var target, estimate;
            var source = Session.get('current_building_doc').building_info.area_total ;

            if( $(this).attr("name") == "investment.ratio") {
                estimate = (curr_field * source).toFixed(2) ; //We're dealing with % and € so it's OK to only keep 2 decimals
                target = $('[name="investment.cost"]');
            } else {
                estimate = (curr_field / source).toFixed(2) ;
                target = $('[name="investment.ratio"]');
            }

            if ( ( 1*target.val() ).toFixed(2) !== estimate ) {
                    target.val(estimate).change() ;
            }

            // Special case: Trigger a fake change on investment ratio to make sure that the Subventions are correctly calculated
            $("[name='subventions.ratio']").change();
        });
        $("[name='investment.ratio'], [name='investment.cost']").change() ; // Execute once at form render


        // Subventions: ratio and cost in Euro
        $("[name='subventions.ratio'], [name='subventions.or_euro']").change(function() {
            var curr_field = $(this).val()*1;
            var target, estimate;
            // var source = $("[name='investment.cost']").val();
            var source = AutoForm.getFieldValue("insertActionForm", "investment.cost")*1 ;

            if( $(this).attr("name") == "subventions.ratio") {
                estimate = (curr_field/100 * source).toFixed(2) ;
                target = $('[name="subventions.or_euro"]');
            } else {
                estimate = (curr_field*100 / source).toFixed(2) ;
                target = $('[name="subventions.ratio"]');
            }

            if ( ( 1*target.val() ).toFixed(2) !== estimate ) {
                    target.val(estimate).change() ;
            }
        });
        $("[name='subventions.ratio'], [name='subventions.or_euro']").change() ; // Execute once at form Load


        // Subventions: residual cost
        this.autorun(function () {
            investment_cost = AutoForm.getFieldValue("insertActionForm", "investment.cost")*1 ;
            sub_euro = AutoForm.getFieldValue("insertActionForm", "subventions.or_euro")*1 ;
            cee_opportunity = AutoForm.getFieldValue("insertActionForm", "subventions.CEE_opportunity")*1 ;

            $("[name='subventions.residual_cost']").val(
                investment_cost - sub_euro - cee_opportunity
            ).change();
        });

        /* ----------------------- */
        // Operating ratio and cost
        $("[name='operating.ratio'], [name='operating.cost']").change(function() {
            var curr_field = $(this).val()*1;
            var target, estimate;
            var source = Session.get('current_building_doc').building_info.area_total*1 ;

            if( $(this).attr("name") == "operating.ratio") {
                estimate = (curr_field * source).toFixed(2) ;
                target = $('[name="operating.cost"]');
            } else {
                estimate = (curr_field / source).toFixed(2) ;
                target = $('[name="operating.ratio"]');
            }

            if ( ( 1*target.val() ).toFixed(2) !== estimate ) {
                    target.val(estimate).change() ;
            }
        });
        $("[name='operating.ratio'], [name='operating.cost']").change() ; // Execute once at form render

        // --------------------------------------
        // savings_first_year.fluids.euro_peryear
        var totalSavings = [];
        this.autorun(function () {
            $("[name^='impact_assessment_fluids.'][name$='.yearly_savings']").each(function( index ) {
                var val = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids." + index + ".yearly_savings") ;
                totalSavings[index] = val*1;
            });
            var totalSavingsValue = _.reduce(totalSavings, function(memo, num){ return memo + num; }, 0);

            $("[name='savings_first_year.fluids.euro_peryear']").val( totalSavingsValue ) ;
        });


        /* -------------------------- */
        /* FORMULAS: efficiency_calc  */
        /* -------------------------- */

        //target raw_roi
        //= "Coût d'investissement" / ("Impact Fluide en €/an" + "Coût en fonctionnement en €/an")
        this.autorun(function () {
            investment_cost = AutoForm.getFieldValue("insertActionForm", "investment.cost")*1 ;
            operating_cost = AutoForm.getFieldValue("insertActionForm", "operating.cost")*1 ;

            // ToDo: changer savings_first_year pour prendre les 31 vals + faire tab projections >> sera utile ici

            // $("[name='raw_roi']").val(
            //     investment_cost - sub_euro - cee_opportunity
            // ).change();
        });

    }
};
