Template.scenarioList.rendered = function () {

    // COULD BE REFACTORED WITH APPLY-ACTION
    if (Session.get('current_portfolio_doc')) {
        // If a Portfolio is alreay "selected", then use it
        $("#portfolioSelect").val( Session.get('current_portfolio_doc')._id ).change();
    } else {
        // Else init by choosing a random Portfolio from the current Estate doc
        var randomPortfolioId = Portfolios.findOne()._id ;
        $("#portfolioSelect").val(randomPortfolioId);
        // There's apparently a delay in the rendering, so delay the .change() for 300ms
        setTimeout(function(){
            $("#portfolioSelect").change();
        }, 300);
    }

    // On Portfolio selector change: set the correct current Portfolio Doc
    $("#portfolioSelect").change(function(){
        Session.set('current_portfolio_doc',
            Portfolios.findOne( $("#portfolioSelect").val() )
        );
    });
    /* --------------------------------------------- */

};

Template.scenarioList.helpers({
    getScenarios: function(){
        if (Session.get('current_portfolio_doc')) {
            return Scenarios.find({
               "portfolio_id": Session.get('current_portfolio_doc')._id
            }).fetch();
        }
    }
});

Template.scenarioList.events({
    'click .newScenario': function(e) {
        e.preventDefault();
        Session.set('current_scenario_doc', null);

        Router.go('scenarioForm');
    },
    'click .editScenario': function(e) {
        e.preventDefault();
        Session.set('current_scenario_doc', this);
        console.log(this);

        Router.go('scenarioForm');
    },
});
