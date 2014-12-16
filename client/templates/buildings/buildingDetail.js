// Get list of all Portfolios for current Estate, sorted by alpha (on name)
Template.buildingDetail.helpers({
    getLeases: function(){
        var result = Leases.find( { building_id: Session.get('current_building_doc') },
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
