/*
portfolio_id : Portfolio ref
building_name : String
type : String

building_address : {
        address1: String
        address2: String
        city: String
        zip_code: String
        area: String
        country: String
        gps_long: Number
        gps_lat: Number
}

images : File ref [ ]

building_info : {
        construction_year : Number,
        building_control: Selector,
        building_user: Selector,
        area_total : Number,
        area_useful : Number,
        building_nb_floors : Number
        carpark_spaces : Number
        carpark_area : Value : Number
}

leases : Lease ref [ ]
*/




Buildings = new Mongo.Collection("buildings");


Buildings.attachSchema(new SimpleSchema({
    portfolio_id: {
        type: [String],
        autoform: {
            omit:true
        }
    },
    building_name: {
        type: String
    },
    type: {
        type: String
    },
    address: {
        type: Object
    },
    'address.street': {
        type: String
    },
    'address.city': {
        type: String
    },
    'address.zip': {
        type: String,
        regEx: /^[0-9]{5}$/
    },
    'address.area': {
        type: String
    },
    'address.country': {
        type: String
    },
    'address.gps_long': {
        type: String
    },
    'address.gps_lat': {
        type: String
    },
    images: {
        type: [String],
        optional: true
    },
    building_info: {
        type: Object
    },
    'building_info.construction_year': {
        type: Number
    },
    'building_info.building_control': {
        type: String,
        autoform: {
            type: "select"
        }
    },
    'building_info.building_user': {
        type: String,
        autoform: {
            type: "select"
        }
    },
    'building_info.area_total': {
        type: Number
    },
    'building_info.area_useful': {
        type: Number
    },
    'building_info.building_nb_floors': {
        type: Number
    },
    'building_info.carpark_spaces': {
        type: Number
    },
    'building_info.carpark_area': {
        type: Number
    },
    leases: {
        type: [String],
        autoform: {
            omit:true
        }
    },
    cost: {
        type: Number,
        autoform: {
            unit:"fucking MAJ",
            afFieldInput: {
                type: 'number_u'
            }
        }
  }
}));
