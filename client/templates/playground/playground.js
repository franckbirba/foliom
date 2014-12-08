Template.playground.helpers(
    {
        getEstateNames: function(){
            var labelList = [] ;

            Estates.find().forEach(function(estate) {
                labelList.push({
                    label: estate.estate_name
                });
                console.log(estate.estate_name);
            });
            return labelList;

            // Todos.find({listId: list._id}).forEach(function(todo) {
            //     Todos.remove(todo._id);
            // });
        }
    }
);


Template.playground.events({
  'keyup [name="rent"]': function(event) {
    console.log("KEYUP");
    var curr_field = $('[name=rent]').val();
    var estimate = curr_field * 2;
    var update_origin = $('[name=last_significant_renovation]');

    if ( update_origin !== estimate ) {
        $('[name=last_significant_renovation]').val(estimate) ;
    }
  },
  'keyup [name="last_significant_renovation"]': function(event) {
    // console.log("KEYUP");
    var curr_field = $('[name=last_significant_renovation]').val();
    var estimate = curr_field / 2;
    var update_origin = $('[name=rent]');

    if ( update_origin !== estimate ) {
        $('[name=rent]').val(estimate) ;
    }
  },
});
