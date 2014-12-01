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

                    console.log(selector.labels);
                    // labelList2 = selector.labels ;

                    _.each(selector.labels, function(item) {
                        labelList2.push({label:transr(item)});
                        console.log(labelList2);
                    });
            });

            console.log('end');
            return labelList2;
        }
;