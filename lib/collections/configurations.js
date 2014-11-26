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
        type: Date
    },
    indexes: {
			optional: true,
        type: [String],
        autoform: {
            omit:true
        }
    },
    project_type_static_index: {
        type: Object
    },
    'project_type_static_index.classic': {
        type: Number
    },
    'project_type_static_index.cpe': {
        type: Number
    },
    'project_type_static_index.cr': {
        type: Number
    },
    'project_type_static_index.crem': {
        type: Number
    },
    'project_type_static_index.ppp': {
        type: Number
    },
    'project_type_static_index.cpi': {
        type: Number
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
			optional: true
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