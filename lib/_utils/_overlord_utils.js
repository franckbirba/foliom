// Translate reactively
// Template.registerHelper('transr', function(key) {
//         return function() {
//             return TAPi18n.__(key);
//         };
//     }
// );

// Translate reactively
transr = function(key) {
    return function() {
        return TAPi18n.__(key);
    };
};


getSelectors = function(param){
    var labelList2 = [] ;

    Selectors.find({name:param}).forEach(function(selector) {
            // Va passer dans la boucle .forEach "selector"
            // console.log(selector.labels);

            _.each(selector.labels, function(item) {
                labelList2.push({label:transr(item)});
                // console.log(labelList2);
            });
    });

    return labelList2;
};

getFluids = function () {
    var labelList = [] ;

    // Selectors.find({name:param}).forEach(function(selector) { // ToDo : ajouter Estate
    Fluids.find().forEach(function(item) { // ToDo : ajouter Estate
        console.log(item);

        // var fl_provider = transr(item.fluid_provider) ;
        // var fl_type = transr(item.fluid_type) ;
        // var complete_fluid = fl_provider.valueOf() + " - " + fl_type;

        // console.log('complete_fluid var is: ');
        // console.log(complete_fluid);

        labelList.push(
            {label:transr(item.fluid_provider)}
            // {label:complete_fluid}
        );
    });
    return labelList;
};

calc_formula = function (form, calling_field, update) {
    var curr_field = AutoForm.getFieldValue(form, calling_field);
    var update_origin = AutoForm.getFieldValue(form, update);

    if (calling_field == "rent") {
        var estimate = curr_field * 2;
        if ( update_origin !== estimate ) {
            return update_origin / 2 ;
        }
    }
    if (calling_field == "last_significant_renovation") {
        var estimate = curr_field / 2;
        if ( update_origin !== estimate ) {
            return update_origin * 2 ;
        }
    }

    // console.log("estimae rent*2 is: "+ estimate);
}
