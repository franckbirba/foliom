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

// Get list of all Portfolios for current Estate, sorted by alpha (on name)
Template.registerHelper("portfolios",
    function(){
        // var estate = Session.get('current_estate_doc');
        // Pour l'instant on remonte tout
        return Portfolios.find({},
                    {sort: {name:1}}
                    ).fetch();
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

Template.registerHelper("beforeRemove",
    function () {
      return function (collection, id) {
        var doc = collection.findOne(id);
        console.log(doc);
        if (confirm('Really delete "' + doc.name + '"?')) {
          this.remove();
        }
      };
    }
);
