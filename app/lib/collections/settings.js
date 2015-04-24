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

YearlyValues = new SimpleSchema({
  year: {
    type: Number,
    defaultValue: function() {
      return Number(new Date().getFullYear()) + Number(this.name.split('.')[1]);
    },
    autoform: {
      afFieldInput: {
        readonly: true,
        class: 'AF_array_title'
      }
    }
  },
  cost: {
    type: Number,
    decimal: true,
    defaultValue: 0,
    autoform: {
      // template: 'afInputNumber_u',
      class: 'AF_array_mainCell'
    }
  },
  evolution_index: {
    type: Number,
    decimal: true,
    defaultValue: 0,
    autoform: {
      afFieldInput: {
        readonly: true,
        class: 'AF_array_subCell'
      }
    }
  }
});

Fluids2 = new SimpleSchema({
    fluid_type: {
        type: String,
        autoform: {
            type: "select",
            options: function () {
                return getSelectors('fluid_type');
            }
        }
    },
    fluid_provider: {
        type: String,
        autoform: {
            type: "select",
            options: function () {
                return getSelectors('fluid_provider');
            }
        }
    },
    fluid_unit: {
        type: String,
        autoform: {
            type: "select",
            options: function () {
                return getSelectors('fluid_unit');
            }
        }
    },
    yearly_values: {
        type: [YearlyValues],
        autoform: {
            //template: 'inline',
            template: "arraySettings",
            minCount: 31,
            maxCount: 31,
        }
    },
    global_evolution_index: {
        type: Number,
        decimal: true,
    },
    kwhef_to_co2_coefficient:{
        type: String,
        autoform: {
            type: "select",
            options: function () {
                return getSelectors('kwhef_to_co2_coefficients');
            }
        }
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
        type: String,
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

    icc: {
		optional: true,
        type: Object,
        label: transr("icc")
    },
    'icc.name': {
        optional: true,
        type: String,
        label: transr("icc_name"),
        autoform: {
            omit:true,
        }
    },
    'icc.evolution_index': {
        optional: true,
        type: [YearlyValues],
        label: transr("icc_evolution_index"),
        autoform: {
            // omit:true,
            minCount: 31,
            maxCount: 31,
            template: "arraySettings"
        }
    },
    'icc.global_evolution_index': {
        optional: true,
        type: Number,
        decimal: true,
        label: transr("global_evolution_index"),
        autoform: {
            readonly:true,
        }
    },

    ipc: {
        optional: true,
        type: Object,
        label: transr("ipc")
    },
    'ipc.name': {
        optional: true,
        type: String,
        label: transr("ipc_name"),
        autoform: {
            omit:true
        }
    },
    'ipc.evolution_index': {
        optional: true,
        type: [YearlyValues],
        label: transr("ipc_evolution_index"),
        autoform: {
            // omit:true,
            minCount: 31,
            maxCount: 31,
            template: "arraySettings"
        }
    },
    'ipc.global_evolution_index': {
        optional: true,
        type: Number,
        decimal: true,
        label: transr("global_evolution_index"),
        autoform: {
            readonly:true,
        }
    },

    project_type_static_index: {
        type: Object,
        label: transr("project_type_static_index")
    },
    'project_type_static_index.classic': {
        type: Number,
        label: transr("classic"),
        decimal: true,
    },
    'project_type_static_index.cpe': {
        type: Number,
        label: transr("cpe"),
        decimal: true,
    },
    'project_type_static_index.cr': {
        type: Number,
        label: transr("cr"),
        decimal: true,
    },
    'project_type_static_index.crem': {
        type: Number,
        label: transr("crem"),
        decimal: true,
    },
    'project_type_static_index.ppp': {
        type: Number,
        label: transr("ppp"),
        decimal: true,
    },
    'project_type_static_index.cpi': {
        type: Number,
        label: transr("cpi"),
        decimal: true,
    },

    kwhef_to_co2_coefficients: {
        type: Object,
        label: transr("kwhef_to_co2_coefficients")
    },
    'kwhef_to_co2_coefficients.fluid_electricity': {
        type: Number,
        label: transr("fluid_electricity"),
        decimal: true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kgeqCO2_kwhEF"),
            }
        }
    },
    'kwhef_to_co2_coefficients.fluid_naturalGas': {
        type: Number,
        label: transr("fluid_naturalGas"),
        decimal: true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kgeqCO2_kwhEF"),
            }
        }
    },
    'kwhef_to_co2_coefficients.fluid_fuelOil_household': {
        type: Number,
        label: transr("fluid_fuelOil_household"),
        decimal: true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kgeqCO2_kwhEF"),
            }
        }
    },
    'kwhef_to_co2_coefficients.fluid_fuelOil_heavy': {
        type: Number,
        label: transr("fluid_fuelOil_heavy"),
        decimal: true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kgeqCO2_kwhEF"),
            }
        }
    },
    'kwhef_to_co2_coefficients.fluid_woodEnergy': {
        type: Number,
        label: transr("fluid_woodEnergy"),
        decimal: true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kgeqCO2_kwhEF"),
            }
        }
    },

    other_indexes: {
        type: Object,
        label: transr("other_indexes")
    },
    'other_indexes.actualization_rate': {
        type: Number,
        label: transr("actualization_rate"),
        decimal: true,
    },
    'other_indexes.consumption_degradation': {
        type: Number,
        label: transr("consumption_degradation"),
        decimal: true,
    },

    fluids: {
		optional: true,
        type: [Fluids2],
        autoform: {
            // template:'eportfolio-settings'
            // template:'bootstrap3'
            template:'fluidsArray',
            //omit:true
        }
    },
    mailing_list: {
        type: String,
        label: transr("mailing_list"),
			optional: true
    }
}));

Configurations.allow({
  insert: function() {
    return true;
  },
  remove: function() {
    return true;
  }
});
