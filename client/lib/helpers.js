// Super "session" Helper
Template.registerHelper('session', function(name) {
    return Session.get(name);
});

// Check if User is Admin
Template.registerHelper("isAdmin",
    function(){
        if(!Meteor.user() || !Meteor.user().roles)
            return null;
        return (Meteor.user().roles.indexOf('admin') >= 0 ? true : null);
     }
);

// Get list of all Estates, sorted by alpha (on name)
Template.registerHelper("estates",
    function(){
        return Estates.find({},
                    {sort: {estate_name:1}}
                    ).fetch();
    }
);

// Get list of all Portfolios
Template.registerHelper("portfolios",
    function(){
        // Pour l'instant on remonte tout
        return Portfolios.find({},
                    {sort: {name:1}}
                    ).fetch();
    }
);

// Get list of all Portfolios for current Estate, sorted by alpha (on name)
Template.registerHelper("getPortfolioList",
    function(){
        var curr_est_doc = Estates.findOne(Session.get('current_estate_doc')._id)

        // only return smthg if Session.get('current_estate_doc') has a value
        if (curr_est_doc !== undefined && curr_est_doc.hasOwnProperty("portfolio_collection") ) {
            //console.log("I display current Portfolios");
            var result = Portfolios.find({_id: {$in : curr_est_doc.portfolio_collection} },
                    {sort: {name:1}}
                    ).fetch();
            return result;
        };
    }
);

// Return current estate_name
Template.registerHelper("current_estate_name_H",
    function(){
        return Session.get('current_estate_doc')
            ? Session.get('current_estate_doc').estate_name
            : "ESTATE NOT DEFINED";
    }
);

// Return current estate_name
Template.registerHelper("current_portfolio_name_H",
    function(){
        return Session.get('current_portfolio_doc')
            ? Session.get('current_portfolio_doc').name
            : "PORTFOLIO NOT DEFINED";
    }
);

Template.registerHelper("getProfilePicture",
    function(){
        var profile = Meteor.user().profile;
        if(profile.picture){
            return "/cfs/files/images/"+ profile.picture;
        }
        return ""
    }
);

Template.registerHelper("getActionsList",
    function(){
        // ToDo : en cas d'update, il faut retirer l'Action en cours d'update. Sinon, cette même action va apparaître dans la liste (risque de référence circulaire)
        // var estate = Session.get('current_estate_doc');
        // Pour l'instant on remonte tout
        return Actions.find({},
                    {sort: {name:1}}
                    ).fetch();
    }
);

// Template.registerHelper("beforeRemove",
//     function () {
//       return function (collection, id) {
//         var doc = collection.findOne(id);
//         console.log(doc);
//         if (confirm('Really delete "' + doc.name + '"?')) {
//           this.remove();
//         }
//       };
//     }
// );
