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
//           yearly_savings: {
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
                type: "select-radio-inline_image",
                options: function () {
                    return getSelectors('action_logo');
                }
            }
        }
    },
    custom_visual: {
        type: String,
        label: transr("custom_visual"),
        optional: true,
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


    // Operating & fluids section
    // the first object is a visual separator for the form, and won't be saved
    operating_gains_separator: {
        type: Object,
        label: transr("operating_gains_separator"),
        optional:true,
        autoform: {
            template:'formSeparator',
        }
    },

    gain_fluids_kwhef: {
        type: [Object],
        label: transr("gain_fluids_kwhef"),
        optional:true,
    },
    'gain_fluids_kwhef.$.opportunity': {
        type: String,
        label: transr("opportunity"),
        optional:true,
        autoform: {
            type: "select",
                options: function() {
                    if( Session.get('current_estate_doc') ){
                        var globalEndUseList = Estates.findOne({_id: Session.get('current_estate_doc')._id}).estate_properties.endUseList;
                        return buildOptions(globalEndUseList);
                    }
                }
        }
    },
    'gain_fluids_kwhef.$.per_cent': {
        type: Number,
        decimal: true,
        label: transr("per_cent"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_percent"),
            }
        }
    },
    'gain_fluids_kwhef.$.or_kwhef': {
        type: Number,
        decimal: true,
        label: transr("or_kwhef"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kwhEF_year"),
            }
        }
    },
    'gain_fluids_kwhef.$.yearly_savings': {
        type: Number,
        decimal: true,
        label: transr("yearly_savings"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_year"),
            }
        }
    },

    gain_fluids_water: {
        type: [Object],
        label: transr("gain_fluids_water"),
        optional:true,
        minCount: 1,
        maxCount: 1,
    },
    'gain_fluids_water.$.opportunity': {
        type: String,
        label: transr("fluid_water"),
        defaultValue: transr("fluid_water"),
        autoValue: function() {
            return "fluid_water";
        },
        autoform: {
            afFieldInput: {
                // readonly:"true",
                type: 'text_disabledAutotranslate',
            },
            // class: 'to_translate'
        }
    },
    'gain_fluids_water.$.per_cent': {
        type: Number,
        decimal: true,
        label: transr("per_cent"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_percent"),
            }
        }
    },
    'gain_fluids_water.$.or_m3': {
        type: Number,
        decimal: true,
        label: transr("or_m3"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_m3"),
            }
        }
    },
    'gain_fluids_water.$.yearly_savings': {
        type: Number,
        decimal: true,
        label: transr("yearly_savings"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_year"),
            }
        }
    },

    operating: {
        type: Object,
        label: transr("operating"),
        optional:true,
    },
    'operating.ratio': {
        type: Number,
        decimal: true,
        label: transr("ratio"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_m2_year"),
            }
        }
    },
    'operating.cost': {
        type: Number,
        decimal: true,
        label: transr("euro_peryear"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_year"),
            }
        }
    },

    operating_total_gain: {
        type: Object,
        label: transr("operating_total_gain"),
        optional:true,
    },
    'operating_total_gain.cost': {
        type: Number,
        decimal: true,
        label: transr("euro_peryear"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_year"),
                readonly:"true",
            }
        }
    },
    'operating_total_gain.ratio': {
        type: Number,
        decimal: true,
        label: transr("euro_per_m2_year"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_m2_year"),
                readonly:"true",
            }
        }
    },

    other_gains: {
        type: Object,
        label: transr("other_gains")
    },
    'other_gains.comfort': {
        type: [String],
        label: transr("comfort"),
        optional:true,
        autoform: {
            type: "select-checkbox-inline",
            options: function() {
                return buildOptions(["thermic", "visual", "acoustic"]);
            }
        }
    },
    'other_gains.technical_compliance_a': {
        type: String,
        label: transr("technical_compliance_a"),
        autoform: {
            options: function () {
                return buildOptions(["NA"]).concat( getSelectors('conformity_options') );
            }
        }
    },
    'other_gains.regulatory_compliance': {
        type: String,
        label: transr("regulatory_compliance"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["yes", "no"]);
            }
        }
    },
    'other_gains.residual_lifetime': {
        type: String,
        label: transr("residual_lifetime"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["yes", "no"]);
            }
        }
    },

    // Investment section
    // the first object is a visual separator for the form, and won't be saved
    investment_cost_separator: {
        type: Object,
        label: transr("investment_cost_separator"),
        optional:true,
        autoform: {
            template:'formSeparator',
        }
    },


    investment: {
        type: Object,
        label: transr("investment"),
        optional:true,
    },
    'investment.ratio': {
        type: Number,
        decimal: true,
        label: transr("investment_ratio"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_m2"),
            }
        }
    },
    'investment.cost': {
        type: Number,
        decimal: true,
        label: transr("investment_cost"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro"),
            }
        }
    },
    subventions: {
        type: Object,
        label: transr("subventions"),
        optional:true,
    },
    'subventions.ratio': {
        type: Number,
        decimal: true,
        label: transr("subventions_per_cent"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_percent"),
            }
        }
    },
    'subventions.or_euro': {
        type: Number,
        decimal: true,
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
    'subventions.residual_cost': {
        type: Number,
        decimal: true,
        label: transr("residual_cost"),
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro"),
                readonly: true
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
        label: transr("savings_first_year_fluids"),
        optional:true,
    },
    'savings_first_year.fluids.euro_peryear': {
        type: Number,
        decimal: true,
        label: transr("euro_peryear"),
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_year"),
            }
        }
    },

    'savings_first_year.operations': {
        type: Object,
        label: transr("savings_first_year_operations"),
        optional:true,
    },
    'savings_first_year.operations.euro_persquare': {
        type: Number,
        decimal: true,
        label: transr("ratio"),
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_m2_year"),
            }
        }
    },
    'savings_first_year.operations.or_euro_peryear': {
        type: Number,
        decimal: true,
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
        decimal: true,
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
        decimal: true,
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
        decimal: true,
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
        decimal: true,
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
        decimal: true,
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
