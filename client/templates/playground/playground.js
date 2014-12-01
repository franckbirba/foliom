Template.playground.helpers(
    {
        getBlobNames: function(){
            var labelList = [] ;
            var obj = {};

            Estates.find().forEach(function(estate) {
                labelList.push({
                    label: estate.estate_name
                });
            });
            return labelList;

            // Todos.find({listId: list._id}).forEach(function(todo) {
            //     Todos.remove(todo._id);
            // });
        }
    }
);
