Template.scenarioList.rendered = function () {

};

Template.scenarioList.helpers({
    getScenarios: function(){
        if (Session.get('current_estate_doc')) {
            return Scenarios.find().fetch();
        }
    }
});

Template.scenarioList.events({
    'click .newScenario': function(e) {
        e.preventDefault();
        Session.set('current_scenario_doc', null);

        Router.go('scenario-form');
    },
    'click .editScenario': function(e) {
        e.preventDefault();
        // Session.set('current_scenario_doc', this);

        Router.go('scenario-form', this);
    },
});
