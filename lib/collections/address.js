AddressSchema = new SimpleSchema({
    'street': {
        type: String
    },
    'city': {
        type: String
    },
    'zip': {
        type: String,
        regEx: /^[0-9]{5}$/
    },
    'area': {
        type: String
    },
    'country': {
        type: String
    },
    'gps_long': {
        type: String,
        optional: true,
        autoform: {
            omit:true
        }
    },
    'gps_lat': {
        type: String,
        optional: true,
        autoform: {
            omit:true
        }
    }
});
