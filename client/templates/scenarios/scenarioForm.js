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
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();
};

Template.scenarioForm.helpers({
    criterionName: function(){
        return TAPi18n.__("yearly_expense_max");
    },
    getCriterion: function(){
        return [
            {"label": "yearly_expense_max"},
            {"label": "energy_consumption_atLeast_in_euro_year"},
            {"label": "wait_for_obsolescence", "type":"checkbox"},
            {"label": "priority_to_gobal_obsolescence"}
            ];
    },
});
