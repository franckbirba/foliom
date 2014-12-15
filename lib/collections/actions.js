
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
            omit:true
        }
    },
    action_template_id: {
        type: String, // For type (3) actions - we store the ref. of the original action
        autoform: {
            omit:true
        }
    },
    building_id: {
        type: String, // For type (3) actions - we store the building ref.
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
    desc: {
        type: String,
        label: transr("desc"),
        autoform: {
            rows: 6
        }
    },
    opportunity: {
        type: String,
        label: transr("opportunity"),
        defaultValue: "-- EN ATTENTE DES End_use (cf. Settings)--"
    },

    //      opportunity : Selector // Liste de End_use + all !! Pas oublier !!
    //      project_type : Selector
    //      technical_field : Selector

}));
