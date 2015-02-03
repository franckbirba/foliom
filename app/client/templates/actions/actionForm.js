// For dates: check http://momentjs.com/

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
    },
    onSuccess: function(operation, result, template) {
      if (Session.get('childActionToEdit')) {
          // Session.set('childActionToEdit', null); // Always set "nul when template destroyed
          Router.go('actions-apply');
      }
      else {
          // Session.set('newActionType', null); // Always set "nul when template destroyed
          Router.go('actions-list');
      }
    },
  }
});

Template.actionForm.destroyed = function () {
  Session.set('newActionType', null);
  Session.set('updateAction', null);
  Session.set('masterAction', null);

  Session.set('YS_values', null);
  Session.set("flux_notActualized", null);

  if (Router.current().route.getName() !== "action-form"){
    Session.set('childActionToEdit', null);
  }
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
  curr_route = Router.current().route.getName();


  // Only apply formulas if we're editing a child action
  //or if we're in the actions-apply screen
  if ( Session.get('childActionToEdit') || curr_route === "actions-apply") {

    /* -------------- */
    /* EndUse formula */
    /* -------------- */
    var allLeases = Leases.find(
                {building_id:Session.get('current_building_doc')._id},
                {sort: {lease_name:1}}
            ).fetch();
    var allEndUseData = [];

    var all_yearly_savings = []; // Will contain all savings, for each EndUse
    var all_yearly_savings_simplyValues = []; // Will contain all savings, for each EndUse


    this.autorun(function () {
      // Have this loop monitor all opportunity Selectors
      // Being in an autoRun, it's reactive
      $("[name^='impact_assessment_fluids_kwhef.'][name$='.opportunity']").each(function( index ) {

        var matchingEndUse = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids_kwhef." + index + ".opportunity") ;

        if (matchingEndUse !== "") { // We make sure that something is selected
            var matchingEndUseInLease = getMatchingEndUseInLease(allLeases, matchingEndUse);

            allEndUseData[index] = matchingEndUseInLease; // Remember: index is the line number in the form
            console.log("allEndUseData: ");
            console.log(allEndUseData);

            // We now have all EndUses for all Leases
            // -------------------------------------------------------


            // -------------------------------------------------------
            // If first EndUse and matchingPerCent fields are entered, then set the kWef

            var matchingPerCent = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids_kwhef." + index + ".per_cent")*1 ;
            // var matchingKWhEF = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids_kwhef." + index + ".or_kwhef")*1 ;

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
                $("[name='impact_assessment_fluids_kwhef." + index + ".or_kwhef']").val( in_kwhef.toFixed(2) ).change();
            }

            // -------------------------------------------------------
            // If first matchingPerCent and in_kwhef are set, then set yearly_savings
            // AND: create all yearly values
            if (in_kwhef !== 0){

                var yearly_savings = []; // In this array we'll store the total savings for this EndUse
                var yearly_savings_complete = []; // In this array we'll store the total savings for this EndUse
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

                        //@BSE : test to have a simple array
                        yearly_savings_complete[year_index] = yearly_total;

                    });
                    endUse.impact_assessment_fluids_kwhef = impact_assessment;

                });

                $("[name='impact_assessment_fluids_kwhef." + index + ".yearly_savings']").val(yearly_savings[0].euro_savings ).change();

                // console.log("yearly_savings " + index + " is:");
                // console.log(yearly_savings);

                // Save the yearly savings in the array that stores all savings
                all_yearly_savings[index] = {
                    "opportunity": matchingEndUseInLease[0].end_use_name,
                    "savings": yearly_savings
                }
                all_yearly_savings_simplyValues[index] = yearly_savings_complete;
            }

        }

      });
      //in case a line is removed: make sure we don't keep outdated lines
      fluids_nb = $("[name^='impact_assessment_fluids_kwhef.'][name$='.opportunity']").length;
      if ( all_yearly_savings.length > fluids_nb ) {
        all_yearly_savings = all_yearly_savings.slice(0, fluids_nb);
        all_yearly_savings_simplyValues = all_yearly_savings_simplyValues.slice(0, fluids_nb);
      }

      console.log("all_yearly_savings");
      console.log(all_yearly_savings);

      console.log("all_yearly_savings_simplyValues");
      console.log(all_yearly_savings_simplyValues);

      Session.set('YS_values', all_yearly_savings_simplyValues);
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

    /* ----------------------- */
    // Savings_first_year: Operating ratio and cost
    $("[name='savings_first_year.operations.euro_persquare'], [name='savings_first_year.operations.or_euro_peryear']").change(function() {
      var curr_field = $(this).val()*1;
      var target, estimate;
      var source = Session.get('current_building_doc').building_info.area_total*1 ;

      if( $(this).attr("name") == "savings_first_year.operations.euro_persquare") {
        estimate = (curr_field * source).toFixed(2) ;
        target = $('[name="savings_first_year.operations.or_euro_peryear"]');
      } else {
        estimate = (curr_field / source).toFixed(2) ;
        target = $('[name="savings_first_year.operations.euro_persquare"]');
      }

      if ( ( 1*target.val() ).toFixed(2) !== estimate ) {
        target.val(estimate).change() ;
      }
    });
    $("[name='savings_first_year.operations.euro_persquare'], [name='savings_first_year.operations.or_euro_peryear']").change() ; // Execute once at form render

    // --------------------------------------
    // savings_first_year.fluids.euro_peryear
    var total_savings_array = [];
    this.autorun(function () {
      total_savings_array = addValuesForArrays( Session.get('YS_values') );

      console.log("total_savings_array");
      console.log(total_savings_array);

      $("[name='savings_first_year.fluids.euro_peryear']").val( total_savings_array[0] ) ;
    });


    /* -------------------------- */
    /* FORMULAS: efficiency_calc  */
    /* -------------------------- */

    this.autorun(function () {
      action_lifetime = AutoForm.getFieldValue("insertActionForm", "action_lifetime")*1 ;
      residual_cost = AutoForm.getFieldValue("insertActionForm", "subventions.residual_cost")*1 ;
      operating_cost = AutoForm.getFieldValue("insertActionForm", "operating.cost")*1 ;
      operating_savings = AutoForm.getFieldValue("insertActionForm", "savings_first_year.operations.or_euro_peryear")*1 ;
      var YS_array = Session.get('YS_values');

      // PREPARE INVESTMENT_COST_ARRRAY (for residual_cost)
      // create an array for investment cost with as many 0 as the action_lifetime
      // Array size is action_lifetime and not (action_lifetime+1): OK by Blandine Melay 2015-01-15
      var ic_array = buildArrayWithZeroes(action_lifetime);
      ic_array[0]= residual_cost; //Set the first value to the residual_cost

      /* -------------------------- */
      /*     target raw_roi         */
      // = "Coût d'investissement" / ("Impact Fluide en €/an" + "Coût en fonctionnement en €/an")
      var operatingCost_array = buildArrayWithZeroes(action_lifetime);
      operatingCost_array[0]=operating_cost;

      var raw_roi = residual_cost / (total_savings_array[0] + operating_cost); //@Blandine : année 0 des économies d'énergie - OK

      $("[name='raw_roi']").val( raw_roi.toFixed(2)*1 );
      console.log("raw_roi");
      console.log(raw_roi);


      /* -------------------------- */
      /*    target value_analysis   */
      var value_analysis = 0;
      var fluidImpact_in_kwhef =0 ;

      $("[name^='impact_assessment_fluids_kwhef.'][name$='.or_kwhef']").each(function( index ) {
        fluidImpact_in_kwhef += AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids_kwhef." + index + ".or_kwhef")*1 ;
      });
      console.log("fluidImpact_in_kwhef is: "+fluidImpact_in_kwhef);
      value_analysis = action_lifetime * fluidImpact_in_kwhef / residual_cost;
      $("[name='value_analysis']").val( value_analysis.toFixed(2)*1 );


      /* -------------------------- */
      /*          TRA / TRI         */

      // ACTUALIZE INVESTMENT_COST_ARRRAY (for residual_cost)
      //Actualize the array: =current_year_val*(1+actualization_rate)^(-index)
      var ic_array_actualized = _.map(ic_array, function(num, ic_index){
        var result = num * Math.pow( 1+actualization_rate , -ic_index);
        return result.toFixed(2)*1;
      });
      console.log("ic_array_actualized");
      console.log(ic_array_actualized);

      // PREPARE ENERGY SAVINGS
      //@Blandine: l'économie de fluides est basée sur le coût du fluide (qui évolue) >> besoin d'actualiser (seulement inflater) ? >> 14/1: YES
      // check all_yearly_savings_simplyValues
      var all_yearly_savings_simplyValues_actualized = [];
      // debugger
      _.each(YS_array, function(allYSavings, tmp_index) {
        actualized_energy = _.map(allYSavings, function(num, allYSavings_index){
                var result = num * Math.pow( 1+actualization_rate , -allYSavings_index);
                return result.toFixed(2)*1;
            });
        all_yearly_savings_simplyValues_actualized.push(actualized_energy);
      });
      console.log("all_yearly_savings_simplyValues_actualized");
      console.log(all_yearly_savings_simplyValues_actualized);

      // Operating savings (économie de frais d'exploitation) - a appliquer chaque année
      var operatingSavings_array = buildArrayWithZeroes(action_lifetime);
      for (var i = 0; i < action_lifetime; i++) {
        operatingSavings_array[i] = operating_savings ;
      }

      //Actualize the array: =current_year_val*(1+actualization_rate)^(-index)
      var operatingSavings_array_actualized = _.map(operatingSavings_array, function(num, ic_index){
        var result = num * Math.pow( 1+actualization_rate , -ic_index);
        return result.toFixed(2)*1;
      });

      // PREPARE FLUX (savings - investments)
      var flux = _.map(ic_array_actualized, function(num, tmp_index){
        return - ic_array_actualized[tmp_index]
                + operatingSavings_array_actualized[tmp_index]
                + total_savings_array[tmp_index] ; //check suite aux retours de @Blandine sur l'actualisation des fluides
      });
      console.log("flux");
      console.log(flux);

      // PREPARE FLUX NOT ACTUALIZED (savings - investments)
      var flux_notActualized = _.map(ic_array, function(num, tmp_index){
        return - ic_array[tmp_index] // Pas actualisé
                + operatingSavings_array[tmp_index] // Pas actualisé
                + total_savings_array[tmp_index] ; // Pas actualisé : check suite aux retours de @Blandine sur l'actualisation des fluides
      });
      console.log("flux_notActualized");
      console.log(flux_notActualized);
      Session.set("flux_notActualized", flux_notActualized);

      // IRR (TRI)
      var irr = IRR( Session.get("flux_notActualized") );
      $("[name='internal_return']").val( (irr*100).toFixed(2) ) ;


      // FLUX ACCUMULATION (savings - investments over all the previous years)
      var total_YS_val_actualized = addValuesForArrays (all_yearly_savings_simplyValues_actualized) ; // Sum all actualized savings by year

      var flux_accumulation = _.map(ic_array_actualized, function(num, tmp_index){
        var sum = 0
        for (var i = 0; i < tmp_index+1; i++) { // +1 is necessary as the tmp_index starts at 0
            sum += - ic_array_actualized[i]
                + operatingSavings_array_actualized[i] // Pas actualisé
                + total_YS_val_actualized[i] ;
            }
        return sum.toFixed(2)*1;
      });
      console.log("flux_accumulation");
      console.log(flux_accumulation);


      // TRA
      //We find the first positive value in the flux_accumulation
      var firstPositive = _.find(flux_accumulation, function(num){
        if (num >= 0) return num;
      });
      var TRA = _.indexOf(flux_accumulation, firstPositive); // if value is not found: returns -1
      console.log("TRA: " + TRA);
      if (TRA !== -1) { $("[name='actualised_roi']").val( TRA ) ; }


      // LEC
      // = coût d'investissement (ie. 'reduce' du tableau) / (durée vie * éco d'énergie en kWh pour chaque fluide)
      var total_investment = _.reduce(ic_array_actualized, function(memo, num){ return memo + num; }, 0);
      var LEC = total_investment / (action_lifetime * fluidImpact_in_kwhef);
      $("[name='lec']").val( LEC.toFixed(2)*1 ) ;

    });


  }
};
