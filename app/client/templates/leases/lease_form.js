AutoForm.hooks({
  insertLeaseForm: {
    before: {
      insert: function(doc) {
        //  var testDoc = jQuery.extend(true, {}, doc);
        // console.log(testDoc);

        //Hack for textfields that we always want in English
        //If language is not English
            // if ( TAPi18n.getLanguage() !== 'en') {
            //     _.each(doc.consumption_by_end_use, function(end_use, i) {
            //          // var endUseinEN = Meteor.call("toEnglish", end_use.end_use_name);
            //          var endUseinEN = TAPi18n.__(end_use.end_use_name, null, 'fr' );
            //          doc.consumption_by_end_use[i].end_use_name = endUseinEN;
            //     });
            // }
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
        doc.building_id = Session.get('current_building_doc')._id;
        return doc;
      }
    },
    onSuccess: function(formType, result) {

      // If update: go back to buildingDetail
      if( Session.get('leaseToEdit') ) {
          Router.go('building-detail', {_id: Session.get('current_building_doc')._id });
      }
      else { /* Manage the number of Leases to create */
        var nbLeases_2create = Session.get('nbLeases_2create');

        if(nbLeases_2create>1) {
            // One less lease to create, so we update the session var
            Session.set('nbLeases_2create', nbLeases_2create-1);

            Router.go('lease-form', {
                        // _id: id
                    });
        } else {
            Session.set('nbLeases_2create', 0);
            Router.go('building-detail', {_id: Session.get('current_building_doc')._id });
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

Template.leaseForm.created = function () {
  AutoForm.debug();
};

Template.leaseForm.rendered = function () {

  // Activate auto-fill for new leases if needed
  if( !Session.get('leaseToEdit') ){
    fillLeaseForm(false); // Set to true to activate
  }

  //Apply End-Use to correct field
  var endUses = EndUse.find().fetch() ; // ToDo: check possible collision?

  // Set textfields that have to be auto-filled and make them readonly
  if( !Session.get('leaseToEdit') ){
    // end_use_name
    $(".end_use_name").each(function( index ) {
        $(this).val( transr(endUses[index].end_use_name) );
        $(this).prop("readonly","readonly") ;
    });

  }

  // tcc_lifetime & tcc_conformity: monitor all selects, then calc the value and sets it
    $(".tcc_lifetime").change(function(){
        var tcc_lifetime = $(".tcc_lifetime").map(function() {
          return $(this).val();
        });

        $("[name='technical_compliance.global_lifetime']").val(
            calc_qualitative_assessment_array(tcc_lifetime)
        ).change();
    });

    $(".tcc_conformity").change(function(){
        var tcc_conformity = $(".tcc_conformity").map(function() {
          return $(this).val();
        });

        $("[name='technical_compliance.global_conformity']").val(
            calc_qualitative_assessment_array(tcc_conformity)
        ).change();
    });




  /* --------------------- */
  // FLUID_CONSUMPTION_METER
  var total_kWhef_Fluids = 0;
  var total_kWhef_Fluids_array = [];

  if (Session.get('leaseToEdit')){ // Init array with the values from the Lease
    total_kWhef_Fluids_array = _.map(Session.get('leaseToEdit').fluid_consumption_meter, function(item){
      var fluid = fluidToObject(item.fluid_id);
      if (fluid.fluid_unit == "u_euro_kwhEF") { return item.first_year_value ;}
      else {return 0;}
    })
  }

  // Get the table
  var fluidConsumptionMeter_table = $(".fluidConsumptionMeter_fluidID").parents("table");
  // Monitor all changes and apply formulas
  fluidConsumptionMeter_table.on('change', 'input, select', function() {
    index = $(this).attr("name").split(".")[1]*1;

    var matchingFluid = fluidConsumptionMeter_table.find("[name='fluid_consumption_meter."+index+".fluid_id']").val();
    var matchingYearlySubscription = fluidConsumptionMeter_table.find("[name='fluid_consumption_meter."+index+".yearly_subscription']").val()*1;
    var matchingFirstYearValue = fluidConsumptionMeter_table.find("[name='fluid_consumption_meter."+index+".first_year_value']").val()*1;

    if (matchingFluid) {
      var correctFluid = fluidToObject(matchingFluid); // gets the Fluid obj in the conf. from a txt like "EDF - fluid_heat"
      var yearly_cost = matchingYearlySubscription + matchingFirstYearValue * correctFluid.yearly_values[0].cost ;
      $("[name='fluid_consumption_meter." + index + ".yearly_cost']").val( yearly_cost );

      /* ---------------------------------------------- */
      /* END-USE FORMULAS: consumption_by_end_use_total */
      // 1- Take advatage of this Loop to update total_kWhef_Fluids
      if (correctFluid.fluid_unit == "u_euro_kwhEF") {
          total_kWhef_Fluids_array[index] = matchingFirstYearValue ;
      } else {
          total_kWhef_Fluids_array[index] = 0;
      }
      // 2- reduce array and update the field
      total_kWhef_Fluids = _.reduce(total_kWhef_Fluids_array, function(memo, num){ return memo + num; }, 0);
      $("[name='consumption_by_end_use_total']").val( total_kWhef_Fluids );
    }

  });



  /* ---------------- */
  /* END-USE FORMULAS */
  /* ---------------- */

  var endUseVal_array = $("[name^='consumption_by_end_use.'][name$='.first_year_value']").map(function() {
    return $(this).val()*1;
  }).toArray();
  endUseVal_array[6] = 0; // Force the "specific" field to be nutral in the calc

  var consumption_by_end_use_table = $("[name='consumption_by_end_use.0.end_use_name']").parents("table");
  // Monitor all changes and apply formulas
  consumption_by_end_use_table.on('change', "[name^='consumption_by_end_use.'][name$='.first_year_value']", function() {
    index = $(this).attr("name").split(".")[1]*1;

    if (index != 6) { // Exclude 6 as it's the specific field
        var firstYearValue = consumption_by_end_use_table.find("[name='consumption_by_end_use."+index+".first_year_value']").val()*1;
        console.log("firstYearValue is ", firstYearValue)
        if(!isNaN(firstYearValue)) {endUseVal_array[index] = firstYearValue ;}
    } else {
        endUseVal_array[index] = 0;
    }

    var totalFields_exceptSpecific = _.reduce(endUseVal_array, function(memo, num){ return memo + num; }, 0);
    var totalConsumption = $("[name='consumption_by_end_use_total']").val()*1;
    $("[name='consumption_by_end_use.6.first_year_value']").val( totalConsumption - totalFields_exceptSpecific ) ;
  });


  /* ------------------- */
  /* CONFORMITY FORMULAS */
  /* ------------------- */

  // Props that are only set for new Leases
  if( !Session.get('leaseToEdit') ){
    // SSI : default: (‘checked’ & ‘Selector: ‘every year’)
    this.$('[name="conformity_information.ssi.eligibility"]').prop('checked', true);
    this.$('[name="conformity_information.ssi.periodicity"]').val('yearly');

    // Amiante: if (Building construit < 01/07/97) then (checked & ’date’: ’31/01/2021’)
    var construction_year = Session.get('current_building_doc').building_info.construction_year ;
    if (construction_year < 1998) {
      this.$('[name="conformity_information.asbestos.eligibility"]').prop('checked', true);
      this.$('[name="conformity_information.asbestos.due_date"]').val('2021-01-31');
    }

    // Installations électriques: default: (‘checked’ & ‘Selector: ‘every year’)
    this.$('[name="conformity_information.electrical_installation.eligibility"]').prop('checked', true);
    this.$('[name="conformity_information.electrical_installation.periodicity"]').val('yearly');

    // Systèmes de climatisation: default: (‘checked’ & ‘Selector: ‘every 5 years’)
    this.$('[name="conformity_information.chiller_terminal.eligibility"]').prop('checked', true);
    this.$('[name="conformity_information.chiller_terminal.periodicity"]').val('5_years');

    // Groupe Froid: default: (‘checked’ & ‘Selector: ‘every year’)
    this.$('[name="conformity_information.chiller_system.eligibility"]').prop('checked', true);
    this.$('[name="conformity_information.chiller_system.periodicity"]').val('yearly');
  }

  $('[name="erp_status"]').change(function(){
    var erp_status = $(this).val();
    var building_area = Session.get('current_building_doc').building_info.area_total ;

    if (isERP(erp_status)){
      // Accessibilité : if (ERP) then (‘checked’ & ’date’: ’31/12/2014’)
      $('[name="conformity_information.accessibility.eligibility"]').prop('checked', true);
      $('[name="conformity_information.accessibility.due_date"]').val("2014-12-31");

      // Legionelle : if (ERP) then (‘checked’ & ‘Selector: ‘every year’)
      $('[name="conformity_information.legionella.eligibility"]').prop('checked', true);
      $('[name="conformity_information.legionella.periodicity"]').val('yearly');

      // Qualité de l'air intérieur: if (ERP) then (‘checked’ & ‘Selector: ‘every 7 years’)
      $('[name="conformity_information.indoor_air_quality.eligibility"]').prop('checked', true);
      $('[name="conformity_information.indoor_air_quality.periodicity"]').val('7_years');

      // DPE: if (ERP && building.surface >250m²) then (checked & ‘Selector: ‘every 10 years’)
      if (building_area > 250) {
        $('[name="conformity_information.dpe.eligibility"]').prop('checked', true);
        $('[name="conformity_information.dpe.periodicity"]').val('10_years');
      }
    }
  });

  $('[name="igh"]').change(function(){
    var igh = $(this).val();
    if (igh == "yes"){
      // Ascenseurs: if (IGH) then (checked & Selector:’every 6 months’) else (checked & Selector:’every 5 years’)
      $('[name="conformity_information.elevators.eligibility"]').prop('checked', true);
      $('[name="conformity_information.elevators.periodicity"]').val('bi_annual');
    } else {
      $('[name="conformity_information.elevators.eligibility"]').prop('checked', true);
      $('[name="conformity_information.elevators.periodicity"]').val('5_years');
    }
  });



  /* -------------------------------------- */
  // WARNINGS for conformity_information_items
  //conformity_information_items = ['accessibility', 'elevators', 'ssi', 'asbestos', 'lead', 'legionella', 'electrical_installation', 'dpe', 'indoor_air_quality', 'radon', 'chiller_terminal', 'lead_disconnector', 'automatic_doors', 'chiller_system'];

  conformity_information_items_div = $(".CiS_block");

  _.each(conformity_information_items, function(item){
    var last_diagnostic_selector = '[name="conformity_information.'+item+'.last_diagnostic"]';
    var diagnostic_alert_selector = '[name="conformity_information.'+item+'.diagnostic_alert"]';

    conformity_information_items_div.on('change', "[name^='conformity_information.'][name$='.last_diagnostic'],[name^='conformity_information.'][name$='.periodicity'],[name^='conformity_information.'][name$='.due_date']", function() {

      var last_diagnostic_val = conformity_information_items_div.find("[name='conformity_information."+item+".last_diagnostic']").val();
      var periodicity = conformity_information_items_div.find("[name='conformity_information."+item+".periodicity']").val();
      var due_date = conformity_information_items_div.find("[name='conformity_information."+item+".due_date']").val();

      var last_diagnostic_moment = moment(last_diagnostic_val);
      var periodicity_moment = periodicityToMoment(periodicity);
      var due_date_moment = moment(due_date);
      var today = moment();

      var span_item = $(last_diagnostic_selector).siblings('span');

      /* Alert cases:
      IF (last_diagnostic + periodicity) < today
      OR IF due_date >= last_diagnostic
      OR IF last_diagnostic is empty
      */
      if (last_diagnostic_moment.add(periodicity_moment) < today || due_date >= last_diagnostic_val || last_diagnostic_val == null) {
        var warning_text = transr("last_diagnostic_obsolete");
        span_item.text(warning_text).css( "color", "red" );
        $(diagnostic_alert_selector).val(true);
      } else {
        span_item.text("");
        $(diagnostic_alert_selector).val(false);
      }

    });


  });



};


