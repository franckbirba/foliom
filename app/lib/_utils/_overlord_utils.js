/*   --------------     */
/*   Form utilities     */
/*   --------------     */
debugMode = true;

// Global variables
// conformity_options = ["compliant", "not_compliant_minor", "not_compliant_major"] ;

actualization_rate = 0.02;

technical_compliance_items = ['core_and_shell', 'facade', 'roof_terrasse', 'heat_production', 'chiller', 'power_supply', 'electrical_delivery', 'thermal_delivery', 'heating_terminal', 'chiller_terminal', 'lighting_terminal', 'GTC_GTB', 'air_system', 'ventilation_system', 'hot_water_production', 'hot_water_delivery', 'fire_security'];

conformity_information_items = ['accessibility', 'elevators', 'ssi', 'asbestos', 'lead', 'legionella', 'electrical_installation', 'DPE', 'indoor_air_quality', 'radon', 'chiller_terminal', 'lead_disconnector', 'automatic_doors', 'chiller_system'];



// Translate reactively
transr = function(key) {
  return function() {
    return TAPi18n.__(key);
  };
};

// Build label / value items from Array
buildOptions = function(param) {
  var optionsList = [];
  _.each(param, function(item) {
    if (typeof item === 'object' && item.value) {
      optionsList.push({
        label: transr(item.label),
        value: item.value
      });
    } else {
      optionsList.push({
        label: transr(item),
        value: item
      });
    }

  });
  return optionsList;
};

isAdmin = function() {
  if (!Meteor.user() || !Meteor.user().roles)
    return null;
  return (Meteor.user().roles.indexOf('admin') >= 0 ? true : null);
};

// fluidToObject: takes a Fluid in text form (eg. "EDF - fluid_heat") and returns an object
// with fluid_provider & fluid_type
fluidToObject = function(matchingFluid) {
  var curr_fluid = matchingFluid.split(" - ");
  var curr_fluid_provider = curr_fluid[0];
  var curr_fluid_type = curr_fluid[1];

  // Look for a match in the configuration
  var curr_config_fluids = Session.get('current_config').fluids;
  var correctFluid = _.where(curr_config_fluids, {
    fluid_provider: curr_fluid_provider,
    fluid_type: curr_fluid_type
  })[0]; // force the first element (where returns an array)

  return correctFluid;
};


/*TODO @FBI: performance optimisation*/
getSelectors = function(param) {
  var labelList2 = [];

  Selectors.find({
    name: param
  }).forEach(function(selector) {
    // Va passer dans la boucle .forEach "selector"
    // console.log(selector.labels);

    _.each(selector.labels, function(item) {
      labelList2.push({
        label: transr(item),
        value: item
      });
      // console.log(labelList2);
    });
  });

  //console.log(labelList2);
  return labelList2;
};

// Modifié suite aux modifs de Franck.
// getFluids = function () {
//     var labelList = [] ;

//     // Selectors.find({name:param}).forEach(function(selector) { // ToDo : ajouter Estate
//     Fluids.find().forEach(function(item) { // ToDo : ajouter Estate
//         console.log(item);

//         var fl_provider = transr(item.fluid_provider) ;
//         var fl_type = transr(item.fluid_type) ;
//         var complete_fluid = fl_provider() + " - " + fl_type();

//         console.log('complete_fluid var is: ');
//         console.log(complete_fluid);

//         labelList.push(
//             {label:complete_fluid, value: item._id }
//         );
//     });
//     return labelList;
// };

getFluids = function(limit_to_single_type) {
  var labelList = [];

  // Selectors.find({name:param}).forEach(function(selector) { // ToDo : ajouter Estate
  var allFluids = Configurations.findOne({
    estate_id: Session.get('current_estate_doc')._id
  }).fluids;

  // If a unit is passed in param
  if(limit_to_single_type !== undefined) {
      allFluids = _.where(allFluids, {fluid_unit: limit_to_single_type});
  }

  allFluids.forEach(function(item) { // ToDo : ajouter Estate

    var complete_fluid_EN = item.fluid_provider + ' - ' + item.fluid_type;

    var fl_provider = transr(item.fluid_provider);
    var fl_type = transr(item.fluid_type);
    var complete_fluid = fl_provider() + ' - ' + fl_type();

    // console.log('complete_fluid var is: ');
    // console.log(complete_fluid);

    labelList.push({
      label: complete_fluid,
      value: complete_fluid_EN
    });
  });

  return labelList;
};

getActions = function(curr_action) {
  var labelList = [];

  Actions.find({
    estate_id: {
      $exists: false
    },
    action_type: 'generic'
  }).forEach(function(item) {
    labelList.push({
      label: item.name,
      value: item._id
    });
  });

  Actions.find({
    estate_id: Session.get('current_estate_doc')._id,
    action_type: 'user_template'
  }).forEach(function(item) {
    labelList.push({
      label: item.name,
      value: item._id
    });
  });
  return labelList;
};


/*   --------------     */
/*   Calc utilities     */
/*   --------------     */

//CREATE SCALE FOR QUALITATIVE ASSESMENTS
// http://stackoverflow.com/questions/5294955/how-to-scale-down-a-range-of-numbers-with-a-known-min-and-max-value
qualitativeScaling = function(x) {
  //        (b-a)(x - min)
  // f(x) = --------------  + a
  //           max - min

  // min = calc_qualitative_assessment("good","good", "good"); //Get the lowest val
  min = 1/3; //Get the lowest val
  max = 1;
  a = 0;
  b = 1;

  return (b-a)*(x - min) / (max - min) + a;
};



calc_qualitative_value = function(param) {
  if (param == 'good' || param == 'new_dvr' || param == 'good_dvr' || param == 'compliant') {
    return 1;
  } else if (param == 'average' || param == 'average_dvr' || param == 'not_compliant_minor') {
    return 2;
  } else if (param == 'bad' || param == 'bad_dvr' || param == 'not_compliant_major') {
    return 3;
  } else {
    return 1;
  }
};

calc_qualitative_assessment = function(param1, param2, param3) {
  var total = calc_qualitative_value(param1) + calc_qualitative_value(param2) + calc_qualitative_value(param3);
  var total_scaled = qualitativeScaling(total / 9) ;
  return total_scaled.toFixed(2)*1;
};

calc_qualitative_assessment_class = function(classParam) {
  var total = 0;
  $(classParam).each(function() {
    total = total + calc_qualitative_value($(this).val());
  });

  var nbValues = $(classParam).length;
  var total_scaled = qualitativeScaling(total / (3 * nbValues));

  return total_scaled.toFixed(2)*1;
};

randomIntFromInterval = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

buildArrayWithZeroes = function(arraySize) {
  var tmp_array = [];
  for (var i = 0; i < arraySize; i++) {
    tmp_array.push(0);
  }
  return tmp_array;
};

addValuesForArrays = function(multipleArray) {
  // var multipleArray = [[1,2,3,4,5,6], [1,1,1,1,1,1], [2,2,2,2,2,2]];
  // Will return the sum, by index: [4, 5, 6, 7, 8, 9]
  result = _.map(_.zip.apply(_, multipleArray), function(pieces) {
    return _.reduce(pieces, function(m, p) {
      return m + p;
    }, 0);
  });
  // We only keep 2 decimals
  return _.map(result, function(num) {
    return num.toFixed(2) * 1;
  });
};
