Template.estateForm.rendered = function () {
    AutoForm.debug();
};

Template.estateForm.helpers({
    users: function(){
        var labelList2 = [] ;

        Meteor.users.find().forEach(function(user) {
                // console.log(user.profile.username);
                var name = user.profile.firstName + " " + user.profile.lastName ;
                labelList2.push({label:name, value:name});
        });
        return labelList2;
    },
    getEstate: function(){
        if (Session.get('update_estate_var')) {
            console.log( Session.get('update_estate_doc') );
            return Session.get('update_estate_doc');
        } else {
            return "";
        };
    },
    getFormType: function(){
        if(Session.get('update_estate_var')) {
            return "update";
        } else {
            return "insert";
        }
    }
});

AutoForm.addHooks(null, {
    onError: function(){
        console.log(arguments);
    }
});

AutoForm.hooks({
    AFestateForm: {
        onSuccess: function(operation, result, template) {
            console.log(operation, result, template);

            // console.log("Success : operation is " + operation);
            if (operation == "insert") {
                $('#estateForm').modal('hide');
                Meteor.call("copyMasterCfg", result, function(error, result){
                    if (error) {
                        console.log(error);
                    }
                });
            } else if (operation == "update") {
                $('#estateForm').modal('hide');
            }
        },
    }
});
