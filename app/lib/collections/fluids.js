//     estate_id : Estate ref
//     fluid_type : Selector // sélecteur modifiable
//     fluid_provider : Selector // idem
//     yearly_values : [
//        { year : Number,
//         cost : Number,
//         evolution_index : Number } ]
//     global_evolution_index : Number
if (typeof Schema === "undefined") {
  Schema = {};
}
Fluids = new Mongo.Collection('fluids');

YearlyValues = new SimpleSchema({
  year: {
    type: Number,
    defaultValue: function() {
      return Number(new Date().getFullYear()) + Number(this.name.split('.')[1]);
    },
    autoform: {
      afFieldInput: {
        readonly: true
      }
    }
  },
  cost: {
    type: Number,
    decimal: true,
    defaultValue: 0,
    autoform: {
      template: 'afInputNumber_u'
    }
  },
  evolution_index: {
    type: Number,
    decimal: true,
    defaultValue: 0,
    autoform: {
      afFieldInput: {
        readonly: true
      }
    }
  }
});

Schema.Fluids = new SimpleSchema({
  fluid_type: {
    type: String,
    autoform: {
      type: 'select',
      options: function() {
        return getSelectors('fluid_type');
      }
    }
  },
  fluid_provider: {
    type: String,
    autoform: {
      type: 'select',
      options: function() {
        return getSelectors('fluid_provider');
      }
    }
  },
  fluid_unit: {
    type: String,
    autoform: {
      type: 'select',
      options: function() {
        return getSelectors('fluid_unit');
      }
    }
  },
  yearly_values: {
    type: [YearlyValues],
    autoform: {
      //template: 'inline',
      minCount: 31,
      maxCount: 31
    }
  },
  global_evolution_index: {
    type: Number,
    decimal: true
  },
  kwhef_to_co2_coefficient: {
    type: String,
    autoform: {
      type: 'select',
      options: function() {
        return getSelectors('kwhef_to_co2_coefficients');
      }
    }
  }
});

Fluids.attachSchema(Schema.Fluids);
