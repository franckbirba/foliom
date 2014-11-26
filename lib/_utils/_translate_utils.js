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
