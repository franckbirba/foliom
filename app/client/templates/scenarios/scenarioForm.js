//https://github.com/oorabona/reactive-table

Template.scenarioForm.helpers({

});

Template.scenarioForm.rendered = function() {
    console.log(this);

    // Init sortable function
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();

    var curr_scenario = this.data;

    // If we're editing a Scenario (eg. this.data isn't false)
    if ( curr_scenario ){
        $('#scenario_name').val(curr_scenario.name);
        $('#duration').val(curr_scenario.duration);
        $('#total_expenditure').val(curr_scenario.total_expenditure);
        $('#roi_less_than').val(curr_scenario.roi_less_than);

        //Set techField if it exists >> @BSE: make it work for several techFields
        _.each(curr_scenario.criterion_list, function(criterion) {
            if (criterion.label == "priority_to_techField") {
                $('#addTechfield').val(criterion.input);
            }
        });
    }

    //Remove item on click
    $(".removeCriterion").click(function() {
        // $(this).remove();
        console.log( $(this).parents( ".criterion" )[0].remove() );
    });


};

Template.scenarioForm.helpers({
    getActionLogo: function(){
        var logoList = ["&#58880;", "&#58881;", "&#58882;", "&#58883;", "&#58884;", "&#58885;", "&#58886;", "&#58887;"];
        //max-height: 175px;
        //overflow-y: auto;
        // return Selectors.findOne({name: 'action_logo'}, {reactive: false}).labels;
        return logoList;
    },
    isCheckbox: function(type){
        return (type == "checkbox") ? true : false;
    },
    isSelectorTechfield: function(type){
        return (type == "selector_techfield") ? true : false;
    },
    isChecked: function(param){
        // return (param === "checked");
        return (param === "checked");
    },
    isSelected: function(input, value){
        // console.log(input + " "+ value);
        return (input === value);
    },
    getTechnical_compliance_items: function() {
        return result = _.map(technical_compliance_items, function(item){
            return { label: item, value: item }
        });
    },
    getCriterion: function(toAdd){
        var current_criterion_list ;
        var toAddCriterionList = [
            {"label": "yearly_expense_max", "unit": "u_euro_year", "weight": 0},
            {"label": "energy_consum_atLeast_in_E_year", "unit": "u_percent", "weight": 0},
            {"label": "wait_for_obsolescence", "type":"checkbox", "desc": "wait_for_obsolescence_desc", "weight": 0},
            {"label": "priority_to_gobal_obsolescence", "type":"checkbox", "desc": "priority_to_gobal_obsolescence_desc", "weight": 0},
            {"label": "priority_to_techField", "type":"selector_techfield", "weight": 0}
            ];

        if (toAdd == 'toAdd') return toAddCriterionList;

        var curr_scenario = this; // we're in a helper, so the current scenario (already defined in Template.rendered) is an implicit context

        // console.log("curr_scenario from this in HELPER");
        // console.log(curr_scenario);

        if ( curr_scenario.hasOwnProperty('criterion_list') ) {
            current_criterion_list = curr_scenario.criterion_list;
        } else {
            current_criterion_list = toAddCriterionList;
        }
        console.log("current_criterion_list");
        console.log(current_criterion_list);

        return current_criterion_list;
    },
    // sc_data: function(param){
    //     if(param =="name") return "Jelly";
    // },
    displayActions: function() {
        if ( this.hasOwnProperty('planned_actions') ) {
            return _.map(this.planned_actions, function(action){
                return Actions.findOne(action.action_id);
            });
        }
    },
});

Template.scenarioForm.events({
  'change #addCriterionSelect': function(e, tplt){
    console.log($(e.currentTarget).val());
    console.log(tplt.this);
  },
  'submit form': function(e, scenarioForm_template) {
    e.preventDefault();

    var scenario = {
      name: $(e.target).find('#scenario_name').val(),
      duration: $(e.target).find('#duration').val()*1,
      total_expenditure: $(e.target).find('#total_expenditure').val()*1,
      roi_less_than: $(e.target).find('#roi_less_than').val()*1,
      logo: $(e.target).find('input:radio[name=logo]:checked').val(),
    };

    //Get all criterion
    var criterion_list = [];
    criterion_list.length = 0; // make sure the array is emptied when the user saves

    $(".criterionContainer .criterion-label").each(function( index ) {
        criterion_list.push( {
            label: $(this).attr("true_label"),
            unit: $(this).attr("unit"),
            type: $(this).attr("type"),
            desc: $(this).attr("desc"),
            }
        );
    });
    console.log("criterion_list is", criterion_list);
    debugger

    $(".criterionContainer :input").each(function( index ) {
        //get all values, except for the last input (used to add a criterion)
        if (index < $(".criterionContainer .criterion-label").length ){
            // if (type == "number") _.extend(criterion_list[index], {input: $(this).val()});
            if ($(this).attr("type") == "checkbox") {
                var checked = ( $(this).prop( "checked" ) == true) ? "checked" : "";
                _.extend(criterion_list[index], {input: checked});
            }
            else {
                _.extend(criterion_list[index], {input: $(this).val()});
            }
        }
    });

    scenario.criterion_list = criterion_list;
    scenario.estate_id = Session.get('current_estate_doc')._id;


    // CREATE BUILDING LIST AND ACTION LIST (for the Estate)
    var building_list = _.map(Session.get('current_estate_doc').portfolio_collection , function(portfolio_id) {
        return Buildings.find({portfolio_id: portfolio_id },
                            {sort: {name:1}}
                            ).fetch();
    });
    building_list = _.flatten(building_list);


    // Method to get all Actions for Each building + build a children list for the Tree
    function planActionsForBuilding(id_param) {
        var action_list = Actions.find({
                            "action_type":"child",
                            "building_id": id_param
                        },
                        {sort: {name:1}}
                        ).fetch();

        _.each(action_list, function(action) {
            // console.log(action);

          // Ensure 1st empty table
          if(!(scenario.planned_actions instanceof Array)) {
            scenario.planned_actions = [];
          }

            scenario.planned_actions.push( // Pour l'update: passer par un tableau intermédiaire
                {
                    action_id : action._id,
                    start : new Date()
                    // savings_first_year_fluids_euro_peryear: action.savings_first_year.fluids.euro_peryear //@BSE: FROM HERE
                }
            );
        });

    }

    _.each(building_list, function(item) {
        planActionsForBuilding(item._id);
    });

    //SORT ACTIONS
    //Default sort
    scenario.planned_actions = _.sortBy(scenario.planned_actions, function(item){
        return item.internal_return; //sortBy ranks in ascending order (use a - to change order)
    });
    //For each Criterion
    _.each(scenario.criterion_list, function(criterion) {
        if (criterion.label == "priority_to_techField") {
            console.log(criterion.input);
        }
    });

    console.log("scenario");
    console.log(scenario);

    var curr_scenario = scenarioForm_template.data;
    console.log("curr_scenario");
    console.log(curr_scenario);
    if ( curr_scenario ) { // UPDATE case
        console.log("update!");
        Scenarios.update(
            curr_scenario._id,
            {
              $set: {
                name: scenario.name,
                duration: scenario.duration,
                total_expenditure: scenario.total_expenditure,
                roi_less_than: scenario.roi_less_than,
                logo: scenario.logo,
                criterion_list: scenario.criterion_list,
                planned_actions: scenario.planned_actions,
              }
            }
        );
        //Re-render template to make sure everything is in order
        Router.go('scenario-form', {_id: curr_scenario._id});
    } else { // INSERT
        var newScenario_id = Scenarios.insert(scenario);
        //Re-render template to go to EDIT mode
        Router.go('scenario-form', {_id: newScenario_id});
    }
    Session.set('current_scenario_doc', scenario );

  }
});
