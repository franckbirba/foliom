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
        return [
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

    var criterion_list = [];
    $(".criterion .criterion-label").each(function( index ) {
        criterion_list.push( {label: $(this).attr("true_label")} );
    });

    scenario.criterion_list = criterion_list;

    scenario.portfolio_id = Session.get('current_portfolio_doc')._id;

    console.log(scenario);

    // scenario._id = Scenarios.insert(scenario);
    Scenarios.insert(scenario);

    // $(".criterion .criterion-label")
    // $(".criterion .criterion-label, .criterion :input")
    // $(".criterion :input").prop( "checked" )
    // Router.go('postPage', post);
  }
});
