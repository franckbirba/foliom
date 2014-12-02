var isUpdate = false;

Template.insertEstateForm.helpers(
    {
        users: function(){
            //console.log(Meteor.users.find().fetch());
            // return Meteor.users.find().fetch();

            var labelList2 = [] ;

            Meteor.users.find().forEach(function(user) {

                    console.log(user.username);
                    labelList2.push({label:user.profile.username, value:user.profile.username});
            });
            return labelList2;
        }
    });
Template.insertEstateForm.helpers(
    {
        getEstate: function(){
            var toto = Estates.findOne(
                        // "77" en dur pour l'instant
                        {"estate_name":"77"},
                        {sort: {estate_name:1}}
                        ); // sans .fetch() ?

            var toto2 = Estates.findOne();

            console.log("toto is: ");
            console.log(toto);

            return toto ;
            // return Estates.find({estate_name:"1"});
        }
    });
Template.insertEstateForm.helpers(
    {
        getType: function(){
            if(isUpdate) {
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
    insertEstateForm: {
        before: {
            onSubmit: function(insertDoc, updateDoc, currentDoc){
                console.log('onSubmit', arguments);
            }
        }
    }
});
