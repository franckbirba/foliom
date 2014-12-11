/*   --------------     */
/*   Form utilities     */
/*   --------------     */

// Translate reactively
transr = function(key) {
    return function() {
        return TAPi18n.__(key);
    };
};

// Build label / value items from Array
buildOptions = function(param) {
    var optionsList = [] ;
    _.each(param, function(item) {
            optionsList.push(
                { label:transr(item), value: item }
            );
        });
    return optionsList;
};

/*   --------------     */
/*   Date utilities     */
/*   --------------     */

timeSince = function(date) {
    if (typeof date !== 'object') {
        date = new Date(date);
    }

    var seconds = Math.floor((new Date() - date) / 1000);
    var intervalType;

    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        intervalType = 'year';
    } else {
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            intervalType = 'month';
        } else {
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
                intervalType = 'day';
            } else {
                interval = Math.floor(seconds / 3600);
                if (interval >= 1) {
                    intervalType = "hour";
                } else {
                    interval = Math.floor(seconds / 60);
                    if (interval >= 1) {
                        intervalType = "minute";
                    } else {
                        interval = seconds;
                        intervalType = "second";
                    }
                }
            }
        }
    }

    if (interval > 1 || interval === 0) {
        intervalType += 's';
    }

    return interval + ' ' + intervalType;
};


/*   --------------     */
/*   Display utilities  */
/*   --------------     */

getSelectors = function(param){
    var labelList2 = [] ;

    Selectors.find({name:param}).forEach(function(selector) {
            // Va passer dans la boucle .forEach "selector"
            // console.log(selector.labels);

            _.each(selector.labels, function(item) {
                labelList2.push({label:transr(item), value:item});
                // console.log(labelList2);
            });
    });

    console.log(labelList2);
    return labelList2;
};

getFluids = function () {
    var labelList = [] ;

    // Selectors.find({name:param}).forEach(function(selector) { // ToDo : ajouter Estate
    Fluids.find().forEach(function(item) { // ToDo : ajouter Estate
        console.log(item);

        var fl_provider = transr(item.fluid_provider) ;
        var fl_type = transr(item.fluid_type) ;
        var complete_fluid = fl_provider() + " - " + fl_type();

        console.log('complete_fluid var is: ');
        console.log(complete_fluid);

        labelList.push(
            {label:complete_fluid, value: item._id }
        );
    });
    return labelList;
};



/*   --------------     */
/*   Calc utilities     */
/*   --------------     */

calc_qualitative_value = function(param){
    if (param == "good") {
        return 1 ;
    } else if (param == "average") {
        return 2 ;
    } else if (param == "bad") {
        return 3 ;
    } else {
        return 1;
    }
};

calc_qualitative_assessment = function(param1, param2, param3) {
    var total = calc_qualitative_value(param1) * calc_qualitative_value(param2) * calc_qualitative_value(param3) ;
    return (total/27).toFixed(2);
};

