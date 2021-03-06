/*
    Calcul du TRI
    - http://www.lecfomasque.com/tri-irr-taux-de-rendement-interne/
    - https://github.com/sutoiku/formula.js
    - https://stoic.stoic.com/pages/formula/function?function=IRR

    Other options:
    - https://gist.github.com/ghalimi/4591338 (one file - one formula)
    - https://github.com/FinancialEngineer/tadJS
    -



*/


// [ {
//      estate_id : Estate ref // optionnel si 'generic'
//      action_type : String // generic (EGIS), user_template (template créé par le Client - from scratch ou basé une action 'generic'), child (Action fille)
//     action_template_id: Action ref // optionnel (pour les 'child')

//     building_id: Building ref // optionnel (pour les 'child')

//      picto : String
//      desc : String
//      name : String
//      id_ : id

//      opportunity : Selector // Liste de End_use + all !! Pas oublier !!
//      project_type : Selector
//      technical_field : Selector

//      feasable_while_occupied : Selector
//      priority : Selector

//      impact_assessment_general {
//           comfort: Selector,
//           technical_compliance: Selector,
//           regulatory_compliance: Selector,
//           residual_lifetime: Selector,
//      }

//      design_duration : {
//           value : Selector,
//           unit : String, default : 'mois' }
//      works_duration : {
//           value : Selector,
//           unit : String, default : 'mois' }
//      action_lifetime : {
//           value : Selector,
//           unit : String, default : 'années' }

//      action_id : Action ref [ ]

//      impact_assessment_energy {
//           per_cent: {
//                value : Number,
//                unit : String, default : '%' ,
//                yearly_values : [
//                    { year : Number,
//                    value : Number } ] }
//           kwhef: {
//                value : Number,
//                unit : String, default : 'kWhef'
//                yearly_values : [
//                    { year : Number,
//                    value : Number } ] },
//           yearly_budget: {
//                value : Number,
//                unit : String, default : '€/an',
//                yearly_values : [
//                    { year : Number,
//                    value : Number } ] },
//      }

//      investment {
//           ratio: {
//                value : Number,
//                unit : String, default : '€/m2',
//                yearly_values : [
//                    { year : Number,
//                    value : Number } ] },
//           cost: {
//                value : Number,
//                unit : String, default : '€ HT/m2.an ',
//                yearly_values : [
//                    { year : Number,
//                    value : Number } ] },
//      }

//      subventions {
//           ratio: {
//                value : Number,
//                unit : String, default : '%' }
//           in_euro: {
//                value : Number,
//                unit : String, default : '€' },
//           CEE_opportunity: {
//                value : Number,
//                unit : String, default : '€' }
//      }

//      operating {
//           ratio: {
//                value : Number,
//                unit : String, default : '€/m².an' }
//           cost: {
//                value : Number,
//                unit : String, default : '€/an' },
//      }

//     savings_first_year_fluids {
//           ratio: {
//                value : Number,
//                unit : String, default : '%' }
//           kWhEF: {
//                value : Number,
//                unit : String, default : 'kWhEF' },
//           euro_peryear: {
//                value : Number,
//                unit : String, default : '€/an' }
//      }

//     savings_first_year_operations {
//           euro_persquare: {
//                value : Number,
//                unit : String, default : '€/m2.an' }
//           euro_peryear: {
//                value : Number,
//                unit : String, default : '€/an' },
//      }

//      raw_roi : {
//           value : Number,
//           unit : String, default : 'années'
//           yearly_values : [
//               { year : Number,
//               value : Number } ]  }
//      actualised_roi : {
//           value : Number,
//           unit : String, default : 'années'
//           yearly_values : [
//               { year : Number,
//               value : Number } ]  }
//      value_analysis : {
//           value : Number,
//           unit : String, default : 'kWh/€'
//           yearly_values : [
//               { year : Number,
//               value : Number } ]  }
//      lec : {
//           value : Number,
//           unit : String, default : '€/kWh'
//           yearly_values : [
//               { year : Number,
//               value : Number } ]  }
//      return : {
//           value : Number,
//           unit : String, default : '%'
//           yearly_values : [
//               { year : Number,
//               value : Number } ]  }

// var technical_compliance_items = ["core_and_shell", "facade", "roof_terrasse", "heat_production", "chiller", "power_supply", "electrical_delivery", "thermal_delivery", "heating_terminal", "chiller_terminal", "lighting_terminal", "GTC/GTB", "air_system", "ventilation_system", "hot_water_production", "hot_water_delivery"];


YearlyValues = new SimpleSchema({
    year: {
        type: Number,
    },
    value: {
        type: Number,
        defaultValue: 0,
    }
});



Actions = new Mongo.Collection("actions");


Actions.attachSchema(new SimpleSchema({
    estate_id: {
        type: String,
        optional: true, // 'generic' actions don't have an estate_id
        autoform: {
            omit:true
        }
    },
    action_type: {
        type: String,
            // convention : 3 possible values
            // (1) "generic": means that is a generic action, created by EGIS
            // (2) "user_template": template created by the Client (from scratch ou from a generic action)
            // (3) "child": means that it was created - from a (1) or (2) Action - when associated to a Building ("Action fille")
        autoform: {
            omit:true,
            // type: "select",
            // options: function() {
            //     return buildOptions(["generic", "user_template"])
            // }
        }
    },
    action_template_id: {
        type: String, // For type (3) actions - we store the ref. of the original action
        optional: true,
        autoform: {
            omit:true
        }
    },
    building_id: {
        type: String, // For type (3) actions - we store the building ref.
        optional: true,
        autoform: {
            omit:true
        }
    },
    name: {
        type: String,
        label: transr("name")
    },
    logo: {
        type: String,
        label: transr("logo"),
        autoform: {
                afFieldInput: {
                    type: 'fileUpload',
                    collection: 'Images'
                }
            }
    },
    description: {
        type: String,
        label: transr("description"),
        optional:true,
        autoform: {
            rows: 6
        }
    },
    opportunity: {
        type: String,
        label: transr("opportunity"),
        defaultValue: "-- EN ATTENTE DES End_use (cf. Settings)--",
        optional:true,
    },
    project_type: {
        type: String,
        label: transr("project_type"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["NA", "classic", "cpe", "cr", "crem", "ppp", "cpi"]);
            }
        }
    },
    technical_field: {
        type: String,
        label: transr("technical_field"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["comfort_qualitative_assessment"]).concat( buildOptions(technical_compliance_items) );
            }
        }
    },
    feasable_while_occupied: {
        type: String,
        label: transr("feasable_while_occupied"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["NA", "yes", "no"]);
            }
        }
    },
    priority: {
        type: String,
        label: transr("priority"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["normal", "high", "low"]);
            }
        }
    },

    impact_assessment_general: {
        type: Object,
        label: transr("impact_assessment_general")
    },
    'impact_assessment_general.comfort': {
        type: String,
        label: transr("comfort"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["NA", "thermic", "visual", "acoustic"]);
            }
        }
    },
    'impact_assessment_general.technical_compliance_a': {
        type: String,
        label: transr("technical_compliance_a"),
        autoform: {
            options: function () {
                return buildOptions(["NA"]).concat( getSelectors('conformity_options') );
            }
        }
    },
    'impact_assessment_general.regulatory_compliance': {
        type: String,
        label: transr("regulatory_compliance"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["NA", "yes", "no"]);
            }
        }
    },
    'impact_assessment_general.residual_lifetime': {
        type: String,
        label: transr("residual_lifetime"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["NA", "yes", "no"]);
            }
        }
    },
    design_duration: {
        type: Number,
        label: transr("design_duration"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_months"),
            }
        }
    },
    works_duration: {
        type: Number,
        label: transr("works_duration"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_months"),
            }
        }
    },
    action_lifetime: {
        type: Number,
        label: transr("action_lifetime"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_years"),
            }
        }
    },
    action_link: {
        type: String,
        label: transr("action_link"),
        optional:true,
        autoform: {
            type: "select",
            options: function() {
                return getActions();
            }
        }
    },
    impact_assessment_energy: {
        type: Object,
        label: transr("impact_assessment_energy"),
        optional:true,
    },
    'impact_assessment_energy.per_cent': {
        type: String,
        label: transr("per_cent"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_percent"),
            }
        }
    },
    'impact_assessment_energy.or_kwhef': {
        type: String,
        label: transr("or_kwhef"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kwhEF_year"),
            }
        }
    },
    'impact_assessment_energy.yearly_budget': {
        type: String,
        label: transr("yearly_budget"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_year"),
            }
        }
    },
    investment: {
        type: Object,
        label: transr("investment"),
        optional:true,
    },
    'investment.ratio': {
        type: String,
        label: transr("investment_ratio"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_m2_year"),
            }
        }
    },
    'investment.cost': {
        type: String,
        label: transr("investment_cost"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_year"),
            }
        }
    },
    subventions: {
        type: Object,
        label: transr("subventions"),
        optional:true,
    },
    'subventions.ratio': {
        type: String,
        label: transr("per_cent"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_percent"),
            }
        }
    },
    'subventions.or_euro': {
        type: String,
        label: transr("or_euro"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro"),
            }
        }
    },
    'subventions.CEE_opportunity': {
        type: String,
        label: transr("CEE_opportunity"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro"),
            }
        }
    },
    operating: {
        type: Object,
        label: transr("operating"),
        optional:true,
    },
    'operating.ratio': {
        type: String,
        label: transr("operating_ratio"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_m2_year"),
            }
        }
    },
    'operating.cost': {
        type: String,
        label: transr("operating_cost"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_year"),
            }
        }
    },
    savings_first_year: {
        type: Object,
        label: transr("savings_first_year"),
        optional:true,
    },
    'savings_first_year.fluids': {
        type: Object,
        label: transr("savings_first_year_fluids")
    },
    'savings_first_year.fluids.ratio': {
        type: String,
        label: transr("per_cent"),
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_percent"),
            }
        }
    },
    'savings_first_year.fluids.or_kwhEF': {
        type: String,
        label: transr("or_kwhEF"),
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("or_kwhEF"),
            }
        }
    },
    'savings_first_year.fluids.or_euro_peryear': {
        type: String,
        label: transr("or_euro_peryear"),
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_year"),
            }
        }
    },

    'savings_first_year.operations': {
        type: Object,
        label: transr("savings_first_year_operations")
    },
    'savings_first_year.operations.euro_persquare': {
        type: String,
        label: transr("ratio"),
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_m2_year"),
            }
        }
    },
    'savings_first_year.operations.or_euro_peryear': {
        type: String,
        label: transr("or_euro_peryear"),
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_year"),
            }
        }
    },

    // CREATE SEPERATOR HERE "Calcul de l'efficacité"
    // raw_roi: {
    //     type: Number,
    //     label: transr("raw_roi"),
    //     defaultValue: 0,
    //     autoform: {
    //         afFieldInput: {
    //             type: 'number_u',
    //             unit: transr("u_years"),
    //         }
    //     }
    // },

    efficiency_calc: {
        type: Object,
        label: transr("efficiency_calc"),
        optional:true,
        // autoform: {
        //     class: 'form_chunk',
        // }
    },

    raw_roi: {
        type: Number,
        label: transr("raw_roi"),
        optional:true,
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_years"),
            }
        }
    },
    raw_roi_yearlyValues: {
        type: [YearlyValues],
        // defaultValue: 0,
        optional:true,
        autoform: {
            omit: true,
        }
    },

    actualised_roi: {
        type: Number,
        label: transr("actualised_roi"),
        optional:true,
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_years"),
            }
        }
    },
    actualised_roi_yearlyValues: {
        type: [YearlyValues],
        optional:true,
        // defaultValue: 0,
        autoform: {
            omit: true,
        }
    },

    value_analysis: {
        type: Number,
        label: transr("value_analysis"),
        optional:true,
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kwhEF_euro"),
            }
        }
    },
    value_analysis_yearlyValues: {
        type: [YearlyValues],
        // defaultValue: 0,
        optional:true,
        autoform: {
            omit: true,
        }
    },

    lec: {
        type: Number,
        label: transr("lec"),
        optional:true,
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_kwhEF"),
            }
        }
    },
    lec_yearlyValues: {
        type: [YearlyValues],
        // defaultValue: 0,
        optional:true,
        autoform: {
            omit: true,
        }
    },

    internal_return: {
        type: Number,
        label: transr("internal_return"),
        optional:true,
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_percent"),
            }
        }
    },
    internal_return_yearlyValues: {
        type: [YearlyValues],
        // defaultValue: 0,
        optional:true,
        autoform: {
            omit: true,
        }
    },



//      value_analysis : {
//           value : Number,
//           unit : String, default : 'kWh/€'
//           yearly_values : [
//               { year : Number,
//               value : Number } ]  }
//      lec : {
//           value : Number,
//           unit : String, default : '€/kWh'
//           yearly_values : [
//               { year : Number,
//               value : Number } ]  }
//      return : {
//           value : Number,
//           unit : String, default : '%'
//           yearly_values : [
//               { year : Number,
//               value : Number } ]  }

}));
