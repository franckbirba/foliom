EndUse = new Mongo.Collection('endUse');

//End_use
// [ {
//      portfolio_id : Portfolio ref
//      end_use_name : String
//      color : String
// } ]

EndUse.attachSchema(new SimpleSchema({
  portfolio_id: {
    type: String,
    optional: true,
    autoform: {
      omit: true
    }
  },
  end_use_name: {
    type: String,
    label: transr('end_use_name')
  },
  color: {
    type: String,
    optional: true,
    autoform: {
      omit: true
    }
  }
}));
