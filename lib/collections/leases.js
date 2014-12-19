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

if(typeof Schema === "undefined") {
    Schema = {};
}

var comfort_values = [
                {label : transr("good"), value: "good" },
                {label : transr("average"), value: "average" },
                {label : transr("bad"), value: "bad" }
                ];

// The two var below are now in the OVERLORD utils (but can be used here)

// var conformity_options = ["compliant", "not_compliant_minor", "not_compliant_major"] ;

// var technical_compliance_items = ["core_and_shell", "facade", "roof_terrasse", "heat_production", "chiller", "power_supply", "electrical_delivery", "thermal_delivery", "heating_terminal", "chiller_terminal", "lighting_terminal", "GTC/GTB", "air_system", "ventilation_system", "hot_water_production", "hot_water_delivery"]


consumption_by_end_use = new SimpleSchema({
    end_use_id: {
        type: String,
        autoform: {
            omit: true
        },
        optional:true, // ToDo : retirer et faire le link avec le EndUse
    },
    fluid_id: {
        type: String,
        autoform: {
            type: "select",
            options: function () {
                return getFluids();
            }
        }
    },
    first_year_value: {
        type: Number,
        label: transr("first_year_value"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kwhEF"),
            }
        }
    }
});

Schema.consumption_by_end_use = consumption_by_end_use;

fluidConsumptionMeterSchema = new SimpleSchema({
    fluid_id: {
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
    yearly_subscription: {
        type: Number,
        label: transr("yearly_subscription"),
        defaultValue: 0,
    },
    first_year_value: {
        type: Number,
        label: transr("first_year_value"),
        defaultValue: 0,
    },
    yearly_cost: {
        type: Number,
        label: transr("yearly_cost"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro"),
            }
        }
    },
});

certificationsSchema = new SimpleSchema({
    cert_id: {
        type: String,
        label: transr("cert_id"),
    },
    cert_comments: {
        type: String,
        label: transr("cert_comments"),
        // defaultValue: "Version, détails :",
        autoform: {
            rows: 6
        }
    },
});

Schema.certifications = certificationsSchema;


technical_compliance_categorySchema = new SimpleSchema({
    name: {
        type: String, // Toutes les Var sont dans technical_compliance_items (plus haut dans le fichier)
    },
    lifetime: {
        type: String,
        label: transr("lifetime"),
        autoform: {
            afFieldInput: {
                type: "select",
                options: function () {
                    return buildOptions(["new_dvr", "good_dvr", "average_dvr", "bad_dvr"]);
                },
                class:"tcc_lifetime" // makes it easier to select
            }
        }
    },
    conformity: {
        type: String,
        label: transr("conformity"),
        autoform: {
            type: "select",
            options: function () {
                return getSelectors('conformity_options');
            },
            class:"tcc_conformity" // makes it easier to select
        }
    },
    description: {
        type: String,
        label: transr("description"),
        // defaultValue: "Version, détails :",
        optional: true,
        autoform: {

        }
    },
});

Schema.categories = technical_compliance_categorySchema;

conformity_infoSchema = new SimpleSchema({
    name: {
        type: String, // @BSE : Tableau de var à faire
    },
    eligibility: {
        type: Boolean,
        label: transr("eligibility"),
        autoform: {
            template:'eportfolio-horizontal',
            /*type: "select-checkbox",
            options: function () {
                return buildOptions(["yes"]);
            }*/
        }
    },
    periodicity: {
        type: String,
        label: transr("periodicity"),
        autoform: {
            type: "select",
            options: function () {
                return buildOptions(["monthly", "quaterly", "bi_annual", "yearly", "2_years", "5_years", "7_years", "10_years"]);
            }
        }
    },
    due_date: {
        type: Date,
        label: transr("due_date"),
        autoform: {
            type: "date",
        }
    },
    conformity: {
        type: String,
        label: transr("conformity"),
        autoform: {
            type: "select",
            options: function () {
                return getSelectors('conformity_options');
            }
        }
    },
    last_diagnostic: {
        type: Date,
        label: transr("last_diagnostic"),
        autoform: {
            type: "date",
        }
    },
    diagnostic_alert: {
        type: Boolean,
        autoform: {
            template: 'eportfolio-horizontal',
            omit:true
        },
        optional:true,
    },
    comments_small: {
        type: String,
        label: transr("comments_small"),
        optional:true,
    },
    files: {
        type: String,
        autoform: {
            afFieldInput: {
                type: 'fileUpload',
                collection: 'Images'
            }
        },
        optional:true,
    },
});

Schema.conformity_information = conformity_infoSchema;
// conformity_info: [{
//      name: String
//      eligibility: Boolean
//      due_date: {
//           periodicity: Selector,
//           due_date_value: Date } // l'un des 2 champs
//      conformity: Selector
//      last_diagnostic: Date
//      diagnostic_alert: Boolean
//      comments: String
//      files: File ref [ ]
//   }]


var debugMode = true ;

Leases = new Mongo.Collection("leases");


Leases.attachSchema(new SimpleSchema({
    building_id: {
        type: String,
        //optional: true, // ToDo : a retirer
        autoform: {
            omit:true
        }
    },
    lease_name: {
        type: String,
        label: transr("lease_name"),
        // Test to check if defaultValue can be used with session vars -> yes
        // defaultValue: function() {
        //     return Session.get('current_estate_doc')._id;
        // }
    },
    rental_status: {
        type: String,
        label: transr("rental_status"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["empty", "rented", "multitenant"])
            }
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
            }
        }
    },
    last_significant_renovation: {
        type: Number,
        label: transr("last_significant_renovation"),
        defaultValue: 0,
    },
    lease_usage: {
        type: String,
        label: transr("lease_usage"),
        optional: function () {
            return debugMode;
        },
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
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_m2"),
                value: function() {
                    // $( '[name=lease_nb_floors]' ).keyup(function() {
                    //     console.log("hi!");
                    //     var observ = $('[name=lease_nb_floors]').val();
                    //     var estimate = observ / 2;
                    //     var current = $('[name=area_by_usage]');

                    //     if ( area_by_usage !== estimate ) {
                    //         //$('[name=lease_nb_floors]').val(estimate) ;
                    //         return estimate;
                    //     }
                    // });

                    // $( [name="area_by_usage"] ).keyup(function() {
                    //     var curr_field = $('[name=area_by_usage]').val();
                    //     var estimate = curr_field * 2;
                    //     var update_origin = $('[name=lease_nb_floors]');

                    //     if ( update_origin !== estimate ) {
                    //         //$('[name=lease_nb_floors]').val(estimate) ;
                    //         return
                    //     }
                    // });
                }
            }
        }
    },
    lease_nb_floors: {
        type: Number,
        label: transr("lease_nb_floors"),
        defaultValue: 0,
    },
    igh: {
        type: String,
        label: transr("igh"),
        optional: function () {
            return debugMode;
        },
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["yes", "no"])
            }
        }
    },
    erp_status: {
        type: String,
        label: transr("erp_status"),
        optional: function () {
            return debugMode;
        },
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["NA", "erp_J", "erp_L", "erp_M", "erp_N", "erp_O", "erp_P", "erp_R", "erp_S", "erp_T", "erp_U", "erp_V", "erp_W", "erp_X", "erp_Y"])
            }
        }
    },
    erp_category: {
        type: String,
        label: transr("erp_category"),
        optional: function () {
            return debugMode;
        },
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["erp_1", "erp_2", "erp_3", "erp_4", "erp_5"])
            }
        }
    },
    dpe_energy_consuption: {
        type: Object,
        optional: function () {
            return debugMode;
        },
        label: transr("dpe_energy_consuption")
    },
    'dpe_energy_consuption.grade': {
        type: String,
        label: transr("grade"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["dpe_A", "dpe_B", "dpe_C", "dpe_D", "dpe_E"])
            }
        },
        optional: function () {
            return debugMode;
        },
    },
    'dpe_energy_consuption.value': {
        type: Number,
        label: transr("value"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kwh_m2_year_primEnergy")
            }
        }
    },
    dpe_co2_emission: {
        type: Object,
        label: transr("dpe_co2_emission"),
        optional: function () {
            return debugMode;
        },
    },
    'dpe_co2_emission.grade': {
        type: String,
        label: transr("grade"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["dpe_A", "dpe_B", "dpe_C", "dpe_D", "dpe_E"])
            }
        },
        optional: function () {
            return debugMode;
        },
    },
    'dpe_co2_emission.value': {
        type: Number,
        label: transr("value"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kg_eqC02_m2_year"),

            }
        }
    },
    fluid_consumption_meter: {
        type: [fluidConsumptionMeterSchema],
        label: transr("fluid_consumption_meter"),
        minCount: 3,
        autoform: {
            template:"fluidConsumptionMeter"
        },
        optional: function () {
            return debugMode;
        },
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
        type: [consumption_by_end_use],
        label: transr("consumption_by_end_use"),
        autoform: {
            // template:"consumptionByEndUse"
        },
        optional: function () {
            return debugMode;
        },
    },
    certifications: {
        type: [certificationsSchema],
        label: transr("certifications"),
        autoform: {
            // template:"consumptionByEndUse"
        },
        optional: true,
    },

    comfort_qualitative_assessment: {
        type: Object,
        label: transr("comfort_qualitative_assessment"),
        autoform: {
             template:"inline"
        },
        optional: function () {
            return debugMode;
        },
    },
    'comfort_qualitative_assessment.acoustic': {
        type: String,
        label: transr("acoustic"),
        optional: true,
        autoform: {
            type: "select",
            options: comfort_values
        }
    },
    'comfort_qualitative_assessment.visual': {
        type: String,
        label: transr("visual"),
        optional: true,
        autoform: {
            type: "select",
            options: comfort_values
        }
    },
    'comfort_qualitative_assessment.thermic': {
        type: String,
        label: transr("thermic"),
        optional: true,
        autoform: {
            type: "select",
            options: comfort_values
        }
    },
    'comfort_qualitative_assessment.global_comfort_index': {
        type: Number,
        decimal: true,
        label: transr("global_comfort_index"),
        defaultValue:0,
        autoform: {
            afFieldInput: {
                readonly:"true",
                value: function() {
                    var acoustic = AutoForm.getFieldValue("insertLeaseForm", "comfort_qualitative_assessment.acoustic");
                    var visual = AutoForm.getFieldValue("insertLeaseForm", "comfort_qualitative_assessment.visual");
                    var thermic = AutoForm.getFieldValue("insertLeaseForm", "comfort_qualitative_assessment.thermic");

                    return calc_qualitative_assessment(acoustic, visual, thermic);

                }
            }
        }
    },
    'comfort_qualitative_assessment.comments': {
        type: String,
        label: transr("comments"),
        // defaultValue: "Version, détails :",
        autoform: {
            rows: 6,
            // placeholder:"schemaLabel"
        },
        optional: function () {
            return debugMode;
        },
    },

    technical_compliance: {
        type: Object,
        label: transr("technical_compliance"),
        autoform: {
            // template:"consumptionByEndUse"
        },
        optional: function () {
            return debugMode;
        },
    },
    'technical_compliance.categories': {
        type: [technical_compliance_categorySchema],
        // label: transr("technical_compliance"),
        minCount: 3,
        autoform: {
            template: 'eportfolio-horizontal'
            // template:"consumptionByEndUse"
        }
    },
    'technical_compliance.global_lifetime': {
        type: Number,
        decimal: true,
        label: transr("global_lifetime"),
        autoform: {
            afFieldInput: {
                readonly:"true",
                value: function() {

                    // $(".tcc_lifetime").change(function(){
                    //     return( calc_qualitative_assessment_class(".tcc_lifetime") ) ;
                    // });

                    // Tracker.autorun(function () {
                    //     // calc_qualitative_assessment_class(".tcc_lifetime");

                    //     var total = 1;

                    //     $( ".tcc_lifetime").each(function(){
                    //         console.log( $(this).val() );
                    //     });

                    //     // $( ".tcc_lifetime").each(function(){
                    //     //     total = calc_qualitative_value( $(this).val() );
                    //     //     console.log(total);
                    //     // });

                    //     var nbValues = $( ".tcc_lifetime").length;

                    //     return ( total/(9*nbValues) ).toFixed(2);

                    // });

                    // var total = 1;
                    // $( ".tcc_lifetime").each(function(){
                    //     total = calc_qualitative_value( $(this).val() );
                    //     console.log(total);
                    // });

                    // var nbValues = $( ".tcc_lifetime").length;

                    // return ( total/(9*nbValues) ).toFixed(2);

                    // var acoustic = AutoForm.getFieldValue("insertLeaseForm", "comfort_qualitative_assessment.acoustic");
                    // var visual = AutoForm.getFieldValue("insertLeaseForm", "comfort_qualitative_assessment.visual");
                    // var thermic = AutoForm.getFieldValue("insertLeaseForm", "comfort_qualitative_assessment.thermic");

                    // return calc_qualitative_assessment(acoustic, visual, thermic);

                }
            }
        }
    },
    'technical_compliance.global_conformity': {
        type: Number,
        decimal: true,
        label: transr("global_conformity"),
        autoform: {
            readonly:"true",
            // template:"consumptionByEndUse"
        }
    },
    'technical_compliance.tc_comments': {
        type: String,
        label: transr("tc_comment"),
        autoform: {
            rows: 6,
            // template:"consumptionByEndUse"
        },
        optional: true,
    },

    conformity_information: {
        type: [conformity_infoSchema],
        label: transr("conformity_information"),
        autoform: {
            // template:"consumptionByEndUse"
        },
        optional: function () {
            return debugMode;
        },
    },


// conformity_info: [{
//      name: String
//      eligibility: Boolean
//      due_date: {
//           periodicity: Selector,
//           due_date_value: Date } // l'un des 2 champs
//      compliance: Selector
//      last_diagnostic: Date
//      diagnostic_alert: Boolean
//      comments_small: String
//      files: File ref [ ]
//   }]





}));
