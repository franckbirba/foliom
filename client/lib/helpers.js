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