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
    portfolio_id: {
        type: String,
        autoform: {
            omit:true
        }
    },
    picto: {
        type: String,
    },
    name: {
        type: String,
    },
    duration: {
        type: Number,
    },
    total_expenditure: {
        type: Number,
    },
    roi_less_than: {
        type: Number,
    },
    criterion_list: {
        type: [String]
    },
    planned_actions: {
        type: [String] //Will be an array of action_id - the planned trimester will be in the Action
    }
}));