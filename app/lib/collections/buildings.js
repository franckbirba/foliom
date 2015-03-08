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

// var building_control: [
//      {name : 'control_full'},
//      {name : 'control_shared'} ];

// { building_control: [
//          {name : 'control_full'},
//          {name : 'control_shared'} ]
// },

// { building_user: [
//          {name : 'own_use'},
//          {name : 'rented'}  ],
// },


Buildings = new Mongo.Collection('buildings');


Buildings.attachSchema(new SimpleSchema({
  portfolio_id: {
    type: String,
    optional: true,
    autoform: {
      omit: true
    }
  },
  building_name: {
    type: String,
    label: transr('building_name')
  },
  address: {
    type: AddressSchema,
    label: transr('address')
  },
  images: { // ToDo : gérer le multi-images
    type: String,
    label: transr('images'),
    optional: true,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'Images'
      }
    }
  },
  building_info: {
    type: Object,
    label: transr('building_info')
  },
  'building_info.construction_year': {
    type: Number,
    label: transr('construction_year')
  },
  'building_info.building_control': {
    type: String,
    label: transr('building_control'),
    autoform: {
      type: 'select',
      options: function() {
        return buildOptions(['control_full', 'control_shared']);
      }
      // [
      //     {label : transr("control_full") },
      //     {label : transr("control_shared") }
      //     ]
    }
  },
  'building_info.building_user': {
    type: String,
    label: transr('building_user'),
    autoform: {
      type: 'select',
      options: function() {
          return buildOptions(['own_use', 'rented']);
        }
        // options: [
        //     {label : transr("own_use") },
        //     {label : transr("rented") }
        //     ]
    }
  },
  'building_info.area_total': {
    type: Number,
    label: transr('area_total'),
    autoform: {
      afFieldInput: {
        type: 'number_u',
        unit: transr('u_m2_shon')
      }
    }
  },
  'building_info.area_useful': {
    type: Number,
    label: transr('area_useful'),
    autoform: {
      afFieldInput: {
        type: 'number_u',
        unit: transr('u_m2_useful')
      }
    }
  },
  'building_info.building_nb_floors': {
    type: Number,
    label: transr('building_nb_floors'),
  },
  'building_info.carpark_spaces': {
    type: Number,
    label: transr('carpark_spaces')
  },
  'building_info.carpark_area': {
    type: Number,
    label: transr('carpark_area'),
    autoform: {
      afFieldInput: {
        type: 'number_u',
        unit: transr('u_m2')
      }
    }
  },
  leases: {
    type: [String],
    optional: true,
    autoform: {
      omit: true
    }
  }
}));
