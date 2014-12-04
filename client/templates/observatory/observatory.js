// Get list of all Portfolios for current Estate, sorted by alpha (on name)
Template.observatory.helpers({
    portfolios_current: function(){
        //var curr_est_doc = Session.get('current_estate_doc');
        var curr_est_doc = Estates.findOne(Session.get('current_estate_doc')._id)

        console.log(Portfolios.find().fetch().length);

        // only return smthg if Session.get('current_estate_doc') has a value
        if (curr_est_doc !== undefined && curr_est_doc.hasOwnProperty("portfolio_collection") ) {
            console.log("I was here");
            var result = Portfolios.find({_id: {$in : curr_est_doc.portfolio_collection} },
                    {sort: {name:1}}
                    ).fetch();
            console.log(result);
            return result;
        };
    },
    // portfolio_level: function(){
    //     return Session.get('observatoryPortfolio');
    // }
});

Template.observatory.helpers({
    portfolio_level: function(){
        console.log("I was called!")
        return Session.get('observatoryPortfolio');
    }
});

Template.observatory.events({
    'click .select_portfolio': function() {
        Session.set('current_portfolio_doc', this);

        console.log("current Portfolio is: ");
        console.log(this);

        Session.set('observatoryPortfolio', "false");

        // Meteor.subscribe('configurations', this._id);
        // console.log('INSERT - update_estate_var is now: ' +  Session.get('update_estate_var'));
  }
});
