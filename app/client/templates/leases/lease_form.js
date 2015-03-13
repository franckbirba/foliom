AutoForm.hooks({
  insertLeaseForm: {
    before: {
      insert: function(doc, template) {
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
    onSuccess: function(operation, result, template) {

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


Template.leaseForm.rendered = function () {

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

  this.autorun(function () {

    // Set values on change
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

    if( !Session.get('leaseToEdit') ){
      // $(".end_use_name").each(function( index ) {
      //     $(this).val( transr(endUses[index].end_use_name) );
      //     $(this).prop("readonly","readonly") ;
      //     // $(this).val( index );
      // });


      /* ------------------------------------------------------------------- */
      /* Auto-values: used to auto-fill part of the form - for dev. purposes */
      /* ------------------------------------------------------------------- */

      var lease_autovalues = false;
      if (lease_autovalues){
        $("[name^='fluid_consumption_meter.'][name$='.first_year_value']").each(function( index ) { $(this).val( randomIntFromInterval(0,100) ); });
        $("[name^='fluid_consumption_meter.'][name$='.yearly_subscription']").each(function( index ) { $(this).val( randomIntFromInterval(0,100) ); });
        $("[name^='technical_compliance.categories.'][name$='.lifetime']").each(function( index ) { $(this).val( "bad_dvr" ); });
        $("[name^='technical_compliance.categories.'][name$='.conformity']").each(function( index ) { $(this).val( "compliant" ); });

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

  var total_kWhef_Fluids = 0;
  var total_kWhef_Fluids_array = [];

  // Monitor fluid_consumption_meter and apply formulas
  this.autorun(function () {

    $("[name^='fluid_consumption_meter.'][name$='.yearly_cost']").each(function( index ) {
    // "fluid_consumption_meter.0.yearly_cost"

        var matchingFluid = AutoForm.getFieldValue("insertLeaseForm", "fluid_consumption_meter." + index + ".fluid_id") ;
        var matchingYearlySubscription = AutoForm.getFieldValue("insertLeaseForm", "fluid_consumption_meter." + index + ".yearly_subscription") ;
        var matchingFirstYearValue = AutoForm.getFieldValue("insertLeaseForm", "fluid_consumption_meter." + index + ".first_year_value") ;

        if (matchingFluid) {

            var correctFluid = fluidToObject(matchingFluid); // gets the Fluid obj in the conf. from a txt like "EDF - fluid_heat"
            var yearly_cost = matchingYearlySubscription + matchingFirstYearValue * correctFluid.yearly_values[0].cost ;

            // console.log("correctFluid: ");
            // console.log(correctFluid);

            //target type: fluid_consumption_meter.0.yearly_cost
            $("[name='fluid_consumption_meter." + index + ".yearly_cost']").val( yearly_cost );

            /* ---------------------------------------------- */
            /* END-USE FORMULAS: consumption_by_end_use_total */
            /* ---------------------------------------------- */
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

        // ToDo: create 30 yearly Values
    });
  });

  /* ---------------- */
  /* END-USE FORMULAS */
  /* ---------------- */


  var endUseVal_array = [];

  this.autorun(function () {
    $("[name^='consumption_by_end_use.'][name$='.first_year_value']").each(function( index ) {

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



  this.autorun(function () {
    // WARNINGS
    //conformity_information_items = ['accessibility', 'elevators', 'ssi', 'asbestos', 'lead', 'legionella', 'electrical_installation', 'dpe', 'indoor_air_quality', 'radon', 'chiller_terminal', 'lead_disconnector', 'automatic_doors', 'chiller_system'];

    _.each(conformity_information_items, function(item){
      var last_diagnostic_selector = '[name="conformity_information.'+item+'.last_diagnostic"]';
      var diagnostic_alert_selector = '[name="conformity_information.'+item+'.diagnostic_alert"]';

      var last_diagnostic_val = AutoForm.getFieldValue("insertLeaseForm", 'conformity_information.'+item+'.last_diagnostic');
      var periodicity = AutoForm.getFieldValue("insertLeaseForm", "conformity_information."+item+".periodicity");
      var due_date = AutoForm.getFieldValue("insertLeaseForm", "conformity_information."+item+".due_date");

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

// Template.leaseForm.events({
//   "change [name='erp_status']": function (event, tplt) {
//     if( isERP(event.target.value) ) {
//       category = "accessibility";
//       eligibility = "true";
//       date = ;

//       tplt.$('[name="conformity_information.accessibility.eligibility"]').prop('checked', true);
//       tplt.$('[name="conformity_information.accessibility.due_date"]').val(date);
//     }

//   }
// });


