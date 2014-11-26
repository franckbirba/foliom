/*

user_id (creator) :  User
building_id:  Building ref

lease_name : String
rental_status : Selector
rent : Number,
last_significant_renovation : Number

lease_usage : Selector // Possible d'ajouter une value >> trad ?

area_by_usage : Number
nb_floors_by_usage : Number
IGH : Selector

erp_status : Selector
erp_category : Selector

dpe_energy_consuption_grade : Selector
dpe_energy_consuption_value : Number

dpe_co2_emission_grade : Selector
dpe_co2_emission_value : Number,

fluid_consumption_meter : [{
     fluid_id : Fluid ref
     yearly_subscription : Number
     first_year_value : Number,
     yearly_cost : Number
}]

consumption_by_end_use : {
     categories : [{
          end_use_id : End_use ref
          fluid_id : Fluid ref
          first_year_value : Number,
     }],
     total : Number
},

certifications: [{
    cert_id:  Certifications ref,
    comments: String, default: 'Version, détails :'
  }],

comfort_qualitative_assessment {
    acoustic: Selector,
    visual: Selector,
    thermic: Selector,
    global_comfort_index: Number
    comments: String
}

// Faire le fichier de Data à injecter + les Selectors
technical_compliance: {
    categories: [{
          name: String
          lifetime: Selector,
          conformity: Selector
          desc: String
    }],
    global_lifetime: String,
    global_conformity: String
    comments: String,
  }

conformity_info: [{
     name: String
     eligibility: Boolean
     due_date: {
          periodicity: Selector,
          due_date_value: Date } // l'un des 2 champs
     conformity: Selector
     last_diagnostic: Date
     diagnostic_alert: Boolean
     comments: String
     files: File ref [ ]
  }]
*/


Leases = new Mongo.Collection("leases");


Leases.attachSchema(new SimpleSchema({
    building_id: {
        type: [String],
        autoform: {
            omit:true
        }
    },
    lease_name: {
        type: String
    },
    rental_status: {
        type: String,
        autoform: {
            type: "select",
             options: function () {
                return custom_val ;
            }
        }

    },
    rent: {
        type: Number,
        //min: 0
    },
    last_significant_renovation: {
        type: Number,
        /* autoform: {
             value: function () {
                return AutoForm.getFieldValue('insertLeaseForm', 'rent')*2 ; }
            } */

        /* autoValue: function() {
            var rent = this.field("rent");
            if (content.isSet) {
                return rent.value*2;
            } else {
                this.unset(); // Prevent user from supplying her own value
            }
        } */
    }
}));

// test pour un formulaire conditionnel
FieldValueIs = new Mongo.Collection("FieldValueIs");
FieldValueIs.attachSchema(new SimpleSchema({
  a: {
    type: String,
    allowedValues: ["foo", "bar"]
  },
  b: {
    type: String
  }
}));
