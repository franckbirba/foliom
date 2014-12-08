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
        type: String,
        optional: true, // ToDo : a retirer
        autoform: {
            omit:true
        }
    },
    lease_name: {
        type: String,
        label: transr("lease_name")
    },
    rental_status: {
        type: String,
        label: transr("rental_status"),
        autoform: {
            type: "select",
            options: [
                {label : transr("empty") },
                {label : transr("rented") },
                {label : transr("multitenant") }
            ]
        }
        // autoform: {
        //     type: "select",
        //      options: function () {
        //         return getSelectors('rental_status'); ;
        //     }
        // }

    },
    rent: {
        type: Number,
        label: transr("rent"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_m2"),
                onkeyup:function () {
                    // var curr_field = AutoForm.getFieldValue('insertLeaseForm', 'rent');
                    // var curr_field = AutoForm.getFieldValue('insertLeaseForm', 'rent');
                    // var estimate = curr_field * 2;
                    // console.log("estimae rent*2 is: "+ estimate);
                    // var update_origin = AutoForm.getFieldValue('insertLeaseForm', 'last_significant_renovation');

                    // if ( update_origin !== estimate ) {
                    //     $('[name=last_significant_renovation]').val(curr_field * 2) ;
                    // }


                    // return calc_formula('insertLeaseForm', 'rent', 'last_significant_renovation');

                    // var rent = $('[name=rent]').val();

                    // var rent = $( "input[name='rent']" ).val();
                    // console.log(rent);

                    // document.getElementsByName("last_significant_renovation")[0].value = rent / 2;
                    // template.$('[name=last_significant_renovation]').value = rent / 2;
                },
                // value: function () {
                //     // return calc_formula('insertLeaseForm', 'rent', 'last_significant_renovation');
                // }
                // value: function () {

                //     var curr_field = AutoForm.getFieldValue('insertLeaseForm', 'rent');
                //     var estimate = curr_field * 2;
                //     console.log("estimae rent*2 is: "+ estimate);

                //     var update_origin = AutoForm.getFieldValue('insertLeaseForm', 'last_significant_renovation');

                //     if ( update_origin !== estimate ) {
                //         return update_origin / 2 ;
                //     }
                // }
            }
        }
        //min: 0
    },
    last_significant_renovation: {
        type: Number,
        label: transr("last_significant_renovation"),
        defaultValue: 0,
        autoform: {
            onkeyup:function () {
                    var curr_field = AutoForm.getFieldValue('insertLeaseForm', 'last_significant_renovation');
                    var estimate = curr_field / 2;
                    // console.log("estimae rent*2 is: "+ estimate);
                    var update_origin = AutoForm.getFieldValue('insertLeaseForm', 'rent');

                    if ( update_origin !== estimate ) {
                        $('[name=rent]').val(curr_field / 2) ;
                    }

                // console.log("toto!");
                // return calc_formula('insertLeaseForm', 'last_significant_renovation', 'rent');

                // var curr_field = AutoForm.getFieldValue('insertLeaseForm', 'last_significant_renovation');
                // var estimate = curr_field / 2;
                // console.log("estimae lsr/2 is: "+ estimate);

                // var update_origin = AutoForm.getFieldValue('insertLeaseForm', 'rent');

                // if ( update_origin !== estimate ) {
                //     return update_origin * 2 ;
                // }

            },
            // value: function () {
            //     // return calc_formula('insertLeaseForm', 'last_significant_renovation', 'rent');

            //     // var curr_field = AutoForm.getFieldValue('insertLeaseForm', 'last_significant_renovation');
            //     // var estimate = curr_field / 2;
            //     // console.log("estimae lsr/2 is: "+ estimate);

            //     // var update_origin = AutoForm.getFieldValue('insertLeaseForm', 'rent');

            //     // if ( update_origin !== estimate ) {
            //     //     return update_origin * 2 ;
            //     // }
            // }
        }

        /* autoValue: function() {
            var rent = this.field("rent");
            if (content.isSet) {
                return rent.value*2;
            } else {
                this.unset(); // Prevent user from supplying her own value
            }
        } */
    },
    lease_usage: {
        type: String,
        label: transr("lease_usage"),
        autoform: {
            type: "select",
             options: function () {
                return getSelectors('lease_usage');
            }
        }
    },
    area_by_usage: {
        type: Number,
        label: transr("area_by_usage"),
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_m2")
            }
        }
    },
    lease_nb_floors: {
        type: Number,
        label: transr("lease_nb_floors"),
    },
    igh: {
        type: String,
        label: transr("igh"),
        autoform: {
            type: "select",
            options: [
                {label : transr("yes") },
                {label : transr("no") }
            ]
        }
    },
    erp_status: {
        type: String,
        label: transr("erp_status"),
        autoform: {
            type: "select",
            options: [
                {label : transr("erp_J") },
                {label : transr("erp_L") },
                {label : transr("erp_M") },
                {label : transr("erp_N") },
                {label : transr("erp_O") },
                {label : transr("erp_P") },
                {label : transr("erp_R") },
                {label : transr("erp_S") },
                {label : transr("erp_T") },
                {label : transr("erp_U") },
                {label : transr("erp_V") },
                {label : transr("erp_W") },
                {label : transr("erp_X") },
                {label : transr("erp_Y") },
            ]
        }
    },
    erp_category: {
        type: String,
        label: transr("erp_category"),
        autoform: {
            type: "select",
            options: [
                {label : transr("erp_1") },
                {label : transr("erp_2") },
                {label : transr("erp_3") },
                {label : transr("erp_4") },
                {label : transr("erp_5") },
            ]
        }
    },
    dpe_energy_consuption: {
        type: Object,
        label: transr("dpe_energy_consuption")
    },
    'dpe_energy_consuption.grade': {
        type: String,
        label: transr("grade"),
        autoform: {
            type: "select",
            options: [
                {label : transr("dpe_A") },
                {label : transr("dpe_B") },
                {label : transr("dpe_C") },
                {label : transr("dpe_D") },
                {label : transr("dpe_E") },
            ]
        }
    },
    'dpe_energy_consuption.value': {
        type: Number,
        label: transr("value"),
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kwh_m2_year_primEnergy")
            }
        }
    },
    dpe_co2_emission: {
        type: Object,
        label: transr("dpe_co2_emission")
    },
    'dpe_co2_emission.grade': {
        type: String,
        label: transr("grade"),
        autoform: {
            type: "select",
            options: [
                {label : transr("dpe_A") },
                {label : transr("dpe_B") },
                {label : transr("dpe_C") },
                {label : transr("dpe_D") },
                {label : transr("dpe_E") },
            ]
        }
    },
    'dpe_co2_emission.value': {
        type: Number,
        label: transr("value"),
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kg_eqC02_m2_year")
            }
        }
    },
    fluid_consumption_meter: {
        type: [Object],
        label: transr("fluid_consumption_meter"),
        autoform: {
            // template:"fluidConsumptionMeter"
        }
    },
    'fluid_consumption_meter.$.fluid_id': {
        type: String,
        optional: true, // ToDo : a dynamiser
        label: transr("fluid"),
        autoform: {
            type: "select",
            options: function () {
                return getFluids();
            }
        }
    },
    'fluid_consumption_meter.$.yearly_subscription': {
        type: Number,
        label: transr("yearly_subscription"),
    },
    'fluid_consumption_meter.$.first_year_value': {
        type: Number,
        label: transr("first_year_value"),
    },
    'fluid_consumption_meter.$.yearly_cost': {
        type: Number,
        label: transr("yearly_cost"),
    },

// EVOL MODEL -> get total out of object
// consumption_by_end_use : {
//      categories : [{
//           end_use_id : End_use ref
//           fluid_id : Fluid ref
//           first_year_value : Number,
//      }],
//      total : Number
// },
    consumption_by_end_use: {
        type: [Object],
        label: transr("consumption_by_end_use"),
        autoform: {
            // template:"consumptionByEndUse"
        }
    },
    'consumption_by_end_use.$.end_use_id': {
        type: String,
        autoform: {
            omit: true
        }
    },
    'consumption_by_end_use.$.fluid_id': {
        type: String,
        autoform: {
            type: "select",
            options: function () {
                return getFluids();
            }
        }
    },
    'consumption_by_end_use.$.first_year_value': {
        type: Number,
        label: transr("first_year_value"),
    },


}));
