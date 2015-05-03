// For dates: check http://momentjs.com/

AutoForm.hooks({
  insertActionForm: {
    before: {
      insert: function(doc) {
        // Get the Action type
        doc.action_type = Session.get('newActionType');

        // If type is user_template, then save the EstateId
        if (Session.get('newActionType') == "user_template") {
            doc.estate_id = Session.get('current_estate_doc')._id ;
        }

        return doc;
      }
    },
    onSuccess: function(operation, result) {
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

  Session.set('gain_kwhef_euro', null);
  Session.set('gain_water_euro', null);
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

  // If editing a child action, then hide the logo field
  if( Session.get('childActionToEdit') ) { $('[data-schema-key="logo"]').parent().parent().hide(); }


  // Only apply formulas if we're editing a child action
  //or if we're in the actions-apply screen
  if ( Session.get('childActionToEdit') || curr_route === "actions-apply") {

    /* -------------- */
    /*      Init      */
    /* -------------- */
    ao = new ActionObject();
    d = {}; // A data object in which we'll store temp results, to set values in the form.

    /* -------------- */
    /* EndUse formula */
    /* -------------- */

    this.autorun(function () {
      // Have this loop monitor all opportunity Selectors
      $("[name^='gain_fluids_kwhef.'][name$='.opportunity']").each(function( index ) {

        var endUseOpportunity = AutoForm.getFieldValue("gain_fluids_kwhef." + index + ".opportunity", "insertActionForm") ;

        if (endUseOpportunity !== "") { // We make sure that something is selected
            // For each line, we find the matching EndUse in the Lease(s). This is why we have an array: one cell per lease.
            ao.getMatchingEndUseInLease(index, endUseOpportunity); // index is the line # in the form. Considering that we're inside a loop: we now have all EndUses for all Leases



            // If first EndUse and per_cent fields are entered, then set the kWef per_cent
            var per_cent = AutoForm.getFieldValue("gain_fluids_kwhef." + index + ".per_cent", "insertActionForm")*1 ;
            // var matchingKWhEF = AutoForm.getFieldValue("insertActionForm", "gain_fluids_kwhef." + index + ".or_kwhef")*1 ;

            if (per_cent !== 0){
              // Calc the Gain in kWhef and set the value
              var kwhef_gain = ao.kWhEFGainFromPercent(index, per_cent);
              $("[name='gain_fluids_kwhef." + index + ".or_kwhef']").val( kwhef_gain ).change();
            }

            // -------------------------------------------------------
            // If first per_cent and kwhef_gain are set, then calc euro gain (for all years)
            if (kwhef_gain !== 0){
              // Transform the kwhef gain in an array of euro savings (by multiplying by yearly fluid cost)
              ao.transform_EndUseGain_kwhef_inEuro(index);

              // Calc total savings by adding the savings of each endUse, then set the (first) value in Euro field
              var total_endUseGain_inEuro = ao.sum_endUseGains_inEuro ( index );
              $("[name='gain_fluids_kwhef." + index + ".yearly_savings']").val(total_endUseGain_inEuro[0] ).change();
            }

        }

      });
      //in case a line is removed: make sure we don't keep outdated lines
      fluids_nb = $("[name^='gain_fluids_kwhef.'][name$='.opportunity']").length;
      if ( ao.gain.kwhef_euro.length > fluids_nb ) {
        ao.removeExtraEndUse(fluids_nb);
        //BUG: methode above only works when removing the last EndUse
      }

      // d.total_endUseGain_inEuro = addValuesForArrays(all_yearly_savings_simplyValues);
      Session.set('gain_kwhef_euro', ao.gain.kwhef_euro); // Reactive var to trigger futur calc
      // Session.set('gain_kwhef_euro_merged', addValuesForArrays(ao.gain.kwhef_euro) );
    });

    /* -------------- */
    /* Water formula  */
    /* -------------- */
    this.autorun(function () {
      var per_cent = AutoForm.getFieldValue("gain_fluids_water.0.per_cent", "insertActionForm")*1 ;

      if (per_cent !== 0){
        // Calc the Gain in m3 and set the value
        var total_m3_gain = ao.waterGainFromPercent(per_cent);
        $("[name='gain_fluids_water.0.or_m3']").val( total_m3_gain ).change();

        // Calc the Gain in Euro and set the value
        ao.transform_WaterGain_inEuro();
        d.total_waterGain_inEuro = ao.sum_waterGains_inEuro();
        $("[name='gain_fluids_water.0.yearly_savings']").val( d.total_waterGain_inEuro[0] ).change();
        Session.set('gain_water_euro', d.total_waterGain_inEuro); // Reactive var to trigger futur calc
      }

    });

    /* ------------------ */
    /* Other gain formula */
    /* ------------------ */

    // gain_operating: ratio and cost
    $("[name='gain_operating.ratio'], [name='gain_operating.cost']").change(function() {
      var curr_field = $(this).val()*1;
      var target, estimate;
      var source = Session.get('current_building_doc').building_info.area_total*1 ;

      if( $(this).attr("name") == "gain_operating.ratio") {
        estimate = (curr_field * source).toFixed(2) ;
        target = $('[name="gain_operating.cost"]');
      } else {
        estimate = (curr_field / source).toFixed(2) ;
        target = $('[name="gain_operating.ratio"]');
      }

      if ( ( 1*target.val() ).toFixed(2) !== estimate ) {
        target.val(estimate).change() ;
      }
    });
    $("[name='gain_operating.ratio'], [name='gain_operating.cost']").change() ; // Execute once at form render



    // savings_first_year.fluids.euro_peryear & operating_total_gain
    // var total_fluid_savings_a = [];
    this.autorun(function () {
      // savings_first_year.fluids.euro_peryear
      var total_fluid_savings_a = ao.sum_all_fluids_inEuro(Session.get('gain_kwhef_euro'), Session.get('gain_water_euro'));
      Session.set("total_fluid_savings_a", total_fluid_savings_a);
      // console.log("total_fluid_savings_a");
      // console.log(total_fluid_savings_a);
      $("[name='savings_first_year.fluids.euro_peryear']").val( total_fluid_savings_a[0] ) ;

      // operating_total_gain
      var gain_operating_cost = AutoForm.getFieldValue("gain_operating.cost", "insertActionForm")*1 ;
      var operating_total_gain = gain_operating_cost + total_fluid_savings_a[0];

      $("[name='operating_total_gain.cost']").val( operating_total_gain ) ;
      var ratio = (operating_total_gain / Session.get('current_building_doc').building_info.area_total).toFixed(2)*1;
      $("[name='operating_total_gain.ratio']").val( ratio ) ;
    });



    /* ------------------ */
    /*    INVESTMENTS     */
    /* ------------------ */

    // Investment ratio and cost
    $("[name='investment.ratio'], [name='investment.cost']").change(function() {
      var curr_field = $(this).val()*1;
      var target, estimate;
      var source = Session.get('current_building_doc').building_info.area_total ;

      if( $(this).attr("name") == "investment.ratio") {
        estimate = (curr_field * source).toFixed(2) ;
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
      var source = $("[name='investment.cost']").val()*1;

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
    // $("[name='subventions.ratio'], [name='subventions.or_euro']").change() ; // Execute once at form Load



    // Subventions: residual cost
    this.autorun(function () {
      investment_cost = AutoForm.getFieldValue("investment.cost", "insertActionForm")*1 ;
      sub_euro = AutoForm.getFieldValue("subventions.or_euro", "insertActionForm")*1 ;
      cee_opportunity = AutoForm.getFieldValue("subventions.CEE_opportunity", "insertActionForm")*1 ;

      $("[name='subventions.residual_cost']").val(
        investment_cost - sub_euro - cee_opportunity
      ).change();
    });


    /* -------------------------- */
    /* FORMULAS: efficiency_calc  */
    /* -------------------------- */

    this.autorun(function () {
      action_lifetime = AutoForm.getFieldValue("action_lifetime", "insertActionForm")*1 ;
      residual_cost = AutoForm.getFieldValue("subventions.residual_cost", "insertActionForm")*1 ;
      gain_operating_cost = AutoForm.getFieldValue("gain_operating.cost", "insertActionForm")*1 ;
      var YS_array = Session.get('gain_kwhef_euro');
      var total_fluid_savings_a = Session.get('total_fluid_savings_a');


      // RAW_ROI
      var raw_roi = ao.calc_raw_roi(residual_cost, total_fluid_savings_a[0], gain_operating_cost);
      $("[name='raw_roi']").val( raw_roi );


      // VALUE_ANALYSIS
      var value_analysis = ao.calc_value_analysis(action_lifetime, residual_cost);
      $("[name='value_analysis']").val( value_analysis );


      /* -------------------------- */
      /*          TRA / TRI         */

      // PREPARE INVESTMENT_COST_ARRRAY (for residual_cost)
      // ACTUALIZE INVESTMENT_COST_ARRRAY (for residual_cost)
      ao.prepare_investment_arrays(action_lifetime, residual_cost);
      var ic_array = ao.investment.values;
      var ic_array_actualized = ao.investment.values_act;


      // PREPARE ENERGY SAVINGS
      var merged_fluids_euro_actualized = ao.actualize_merged_fluids_euro();
      // console.log("merged_fluids_euro_actualized", merged_fluids_euro_actualized);

      // Operating savings (économie de frais d'exploitation) - a appliquer chaque année
      var operatingSavings_array = buildArrayWithZeroes(action_lifetime);
      for (var i = 0; i < action_lifetime; i++) {
        operatingSavings_array[i] = gain_operating_cost ;
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
                + total_fluid_savings_a[tmp_index] ; //check suite aux retours de @Blandine sur l'actualisation des fluides
      });
      // console.log("flux");
      // console.log(flux);

      // PREPARE FLUX NOT ACTUALIZED (savings - investments)
      var flux_notActualized = _.map(ic_array, function(num, tmp_index){
        return - ic_array[tmp_index] // Pas actualisé
                + operatingSavings_array[tmp_index] // Pas actualisé
                + total_fluid_savings_a[tmp_index] ; // Pas actualisé : check suite aux retours de @Blandine sur l'actualisation des fluides
      });
      // console.log("flux_notActualized");
      // console.log(flux_notActualized);
      Session.set("flux_notActualized", flux_notActualized);

      // IRR (TRI)
      var irr = IRR( Session.get("flux_notActualized") );
      $("[name='internal_return']").val( (irr*100).toFixed(2) ) ;


      // FLUX ACCUMULATION (savings - investments over all the previous years)
      var total_YS_val_actualized = addValuesForArrays (merged_fluids_euro_actualized) ; // Sum all actualized savings by year

      var flux_accumulation = _.map(ic_array_actualized, function(num, tmp_index){
        var sum = 0
        for (var i = 0; i < tmp_index+1; i++) { // +1 is necessary as the tmp_index starts at 0
            sum += - ic_array_actualized[i]
                + operatingSavings_array_actualized[i] // Pas actualisé
                + total_YS_val_actualized[i] ;
            }
        return sum.toFixed(2)*1;
      });
      // console.log("flux_accumulation");
      // console.log(flux_accumulation);


      // TRA
      //We find the first positive value in the flux_accumulation
      var firstPositive = _.find(flux_accumulation, function(num){
        if (num >= 0) return num;
      });
      var TRA = _.indexOf(flux_accumulation, firstPositive); // if value is not found: returns -1
      // console.log("TRA: " + TRA);
      if (TRA !== -1) { $("[name='actualised_roi']").val( TRA ) ; }


      // LEC
      // = coût d'investissement (ie. 'reduce' du tableau) / (durée vie * éco d'énergie en kWh pour chaque fluide)
      var total_investment = _.reduce(ic_array_actualized, function(memo, num){ return memo + num; }, 0);
      var LEC = total_investment / (action_lifetime * ao.gain.fluidImpact_in_kwhef);
      $("[name='lec']").val( LEC.toFixed(2)*1 ) ;

    });


  }
};
