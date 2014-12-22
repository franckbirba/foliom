Template.applyActions.rendered = function () {

    if ($("#portfolioSelect").val()){
        Session.set('current_portfolio_doc',
                Portfolios.findOne( $("#portfolioSelect").val() )
            );
    }

    $("#portfolioSelect").change(function(){
        Session.set('current_portfolio_doc',
            Portfolios.findOne( $("#portfolioSelect").val() )
        );
    });


};

Template.applyActions.helpers(
    {
        getUsableActions: function(){
            return Actions.find({
                $or: [
                    { // generic actions
                        "estate_id": { $exists: false },
                        "action_type": "generic"
                    },
                    { // user_template actions
                        "estate_id": Session.get('current_estate_doc')._id,
                        "action_type": "user_template"
                    }
                ]
            }).fetch();
        }
    }
);
