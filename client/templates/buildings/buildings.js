// Get list of all Portfolios for current Estate, sorted by alpha (on name)
Template.buildings.helpers({
    buildings_current: function(){

        // var curr_est_doc = Estates.findOne(Session.get('current_estate_doc')._id)

        var curr_portfolio_id = "8XfERHMp33sjeja93";

        // var result = Buildings.find({_id: curr_portfolio_id },
        //             {sort: {name:1}}
        //             ).fetch();
        var result = Buildings.find({},
                    {sort: {name:1}}
                    ).fetch();

        return result;

        // only return smthg if Session.get('current_estate_doc') has a value
        // if (curr_est_doc !== undefined && curr_est_doc.hasOwnProperty("portfolio_collection") ) {
        //     console.log("I was here");
        //     var result = Portfolios.find({_id: {$in : curr_est_doc.portfolio_collection} },
        //             {sort: {name:1}}
        //             ).fetch();
        //     console.log(result);
        //     return result;
        // };
    }
});
