// portfolio_id : Portfolio ref
// picto : String
// name : String
// id_ : id

// duration : {
//      value : Number,
//      unit : String, default : 'années' },
// total_expenditure : {
//      value : Number,
//      unit : String, default : '€' }
// roi_less_than : {
//      value : Number,
//      unit : String, default : 'ans' }

// criterion_list : {
//      criterion_id : [ Criterion ref ],
//      rank: Number }

// planned_actions: [{
//      action_id : Action ref { }
//      trimester: Number
// }]

Scenarios = new Mongo.Collection("scenarios");

Scenarios.attachSchema(new SimpleSchema({
  estate_id: {
    type: String,
    autoform: {
      omit: true
    }
  },
  logo: {
    type: String,
    optional: true
  },
  name: {
    type: String
  },
  duration: {
    type: Number
  },
  total_expenditure: {
    type: Number
  },
  roi_less_than: {
    type: Number
  },
  criterion_list: {
    type: [Object],
    optional: true,
    blackbox: true
  },
  planned_actions: {
    type: [Object], //Will be an array of action_id - the planned trimester will be in the Action
    optional: true
  },
  'planned_actions.$.action_id': {
    type: String,
    defaultValue: null,
    optional: true
  },
  'planned_actions.$.start': {
    type: Date,
    defaultValue: null,
    optional: true
  },
  'planned_actions.$.efficiency_ratio': {
    type: Number,
    decimal: true,
    defaultValue: null,
    optional: true
  }
}));
