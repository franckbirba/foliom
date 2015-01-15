Template.scenarioForm.helpers({
  name_pl: function() {
    return TAPi18n.__('name');
  },
  duration_pl: function() {
    return TAPi18n.__('In') + " " + TAPi18n.__('u_years');
  },
  total_expenditure_pl: function() {
    return TAPi18n.__('In') + " " + TAPi18n.__('u_euros');
  }
});

Template.scenarioForm.rendered = function() {
    // Init sortable function
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();

    //Remove item on click
    $(".removeCriterion").click(function() {
        // $(this).remove();
        console.log( $(this).parents( ".criterion" )[0].remove() );
    });

    // If we're editing a Scenario
    if (Session.get('current_scenario_doc') !== null){
        $('#scenario_name').val(Session.get('current_scenario_doc').name);
        $('#duration').val(Session.get('current_scenario_doc').duration);
        $('#total_expenditure').val(Session.get('current_scenario_doc').total_expenditure);
        $('#roi_less_than').val(Session.get('current_scenario_doc').roi_less_than);
    }
};

Template.scenarioForm.helpers({
    isCheckbox: function(type){
        return (type == "checkbox") ? true : false;
    },
    isSelectorTechfield: function(type){
        return (type == "selector_techfield") ? true : false;
    },
    getTechnical_compliance_items: function() {
        return result = _.map(technical_compliance_items, function(item){
            return { label: item, value: item }
        });
    },
    getCriterion: function(){
        if ( Session.get('current_scenario_doc') ) {
            return Session.get('current_scenario_doc').criterion_list;
        } else return [
            {"label": "yearly_expense_max", "unit": "u_euro_year"},
            {"label": "energy_consum_atLeast_in_E_year", "unit": "u_percent"},
            {"label": "wait_for_obsolescence", "type":"checkbox", "desc": "wait_for_obsolescence_desc"},
            {"label": "priority_to_gobal_obsolescence", "type":"checkbox", "desc": "priority_to_gobal_obsolescence_desc"},
            {"label": "priority_to_techField", "type":"selector_techfield"}
            ];
    },
    sc_data: function(param){
        if(param =="name") return "Jelly";
    },
});

Template.scenarioForm.events({
  'submit form': function(e) {
    e.preventDefault();

    var scenario = {
      name: $(e.target).find('#scenario_name').val(),
      duration: $(e.target).find('#duration').val()*1,
      total_expenditure: $(e.target).find('#total_expenditure').val()*1,
      roi_less_than: $(e.target).find('#roi_less_than').val()*1,
    };

    //Get all criterion
    var criterion_list = [];
    criterion_list.length = 0; // make sure the array is emptied when the user saves

    $(".criterion .criterion-label").each(function( index ) {
        criterion_list.push( {label: $(this).attr("true_label")} );
    });
    $(".criterion :input").each(function( index ) {
        //get all values, except for the last input (used to add a criterion)
        if (index < $(".criterion .criterion-label").length ){
            // if (type == "number") _.extend(criterion_list[index], {input: $(this).val()});
            if ($(this).attr("type") == "checkbox") {
                _.extend(criterion_list[index], {input: $(this).prop( "checked" )});
            }
            else {
                _.extend(criterion_list[index], {input: $(this).val()});
            }

            console.log("criterion_list[index]");
            console.log(criterion_list[index]);
        }
    });

    scenario.criterion_list = criterion_list;

    scenario.portfolio_id = Session.get('current_portfolio_doc')._id;

    //Set action_id
    var building_list = Buildings.find({portfolio_id: scenario.portfolio_id },
                            {sort: {name:1}}
                            ).fetch();

    // Method to get all Actions for Each building + build a children list for the Tree
    function planActionsForBuilding(id_param) {
        var action_list = Actions.find({
                            "action_type":"child",
                            "building_id": id_param
                        },
                        {sort: {name:1}}
                        ).fetch();

        _.each(action_list, function(action) {
          // Ensure 1st empty table
          if(!(scenario.planned_actions instanceof Array)) {
            scenario.planned_actions = [];
          }
            scenario.planned_actions.push( // Pour l'update: passer par un tableau intermédiaire
                {
                    action_id : action._id,
                    start : new Date()
                }
            );
        });
    }

    _.each(building_list, function(item) {
        planActionsForBuilding(item._id);
    });

    console.log(scenario);

    if ( Session.get('current_scenario_doc') ) { // UPDATE case
        Scenarios.update(Session.get('current_scenario_doc')._id, {$set: scenario} );
    } else { // INSERT
        var newScenario_id = Scenarios.insert(scenario);
    }
    Session.set('current_scenario_doc', scenario );


    // Router.go('postPage', post);
  }
});
