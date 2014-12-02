// master : Boolean
//      estate_id : Estate ref // pour un Estate (pas le master)
//      creation_date: Date // date de création du Portfolio (et donc du clonage de configuration)

//      indexes: Config_index ref

//      project_type_static_index {
//           classic: Number,
//           cpe: Number,
//           cr: Number,
//           crem: Number,
//           ppp: Number,
//           cpi: Number,
//      }

//      fluids: Fluids ref [ ]

//      mailing_list: String

var settingYears = new SimpleSchema({
    value: {
        type: Number
    } 
});

Configurations = new Mongo.Collection("configurations");

SimpleSchema.debug = true;
Configurations.attachSchema(new SimpleSchema({
    master: {
        type: Boolean,
		optional: true,
        autoform: {
            omit:true
        }
    },
    estate_id: {
			optional: true,
        type: [String],
        autoform: {
            omit:true
        }
    },
    creation_date: {
        type: Date,
        autoform: {
            omit:true
        }
    },
    indexes: {
			optional: true,
        type: [String],
        autoform: {
            omit:true
        }
    },
    project_type_static_index: {
        type: Object,
        label: transr("project_type_static_index")
    },
    'project_type_static_index.classic': {
        type: Number,
        label: transr("classic")
    },
    'project_type_static_index.cpe': {
        type: Number,
        label: transr("cpe")
    },
    'project_type_static_index.crem': {
        type: Number,
        label: transr("crem")
    },
    'project_type_static_index.ppp': {
        type: Number,
        label: transr("ppp")
    },
    'project_type_static_index.cpi': {
        type: Number,
        label: transr("cpi")
    },
    fluids: {
		optional: true,
        type: [String],
        autoform: {
            omit:true
        }
    },
    mailing_list: {
        type: String,
        label: transr("mailing_list"),
			optional: true
    },
    yearly_values: {
        type: [settingYears],
        minCount: 31,
        maxCount: 31
    }

}));

Configurations.allow({
  insert: function () {
    return true;
  },
  remove: function () {
    return true;
  }
});
