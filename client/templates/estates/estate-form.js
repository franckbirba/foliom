Template.insertEstateForm.helpers(
    {
        users: function(){
            var labelList2 = [] ;

            Meteor.users.find().forEach(function(user) {
                    // console.log(user.profile.username);
                    labelList2.push({label:user.profile.username, value:user.profile.username});
            });
            return labelList2;
        }
    });
Template.insertEstateForm.helpers(
    {
        getEstate: function(){
            if (Session.get('update_estate_var')) {
                return Session.get('update_estate_doc');
            } else {
                return "";
            };

            // var est = Estates.findOne(
            //             // "77" en dur pour l'instant
            //             {_id:this._id}
            //             ); // sans .fetch() ?
        }
    });
Template.insertEstateForm.helpers(
    {
        getFormType: function(){
            // var isUpdate = Session.get('update_estate_var');
            // console.log('isUpdate value: ' + isUpdate);

            if(Session.get('update_estate_var')) {
                return "update";
            } else {
                return "insert";
            }
             //Configurations.findOne({master:true});
        }
    }
);



AutoForm.addHooks(null, {
    onError: function(){
        console.log(arguments);
    }
});

AutoForm.hooks({
    AFinsertEstateForm: {
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
