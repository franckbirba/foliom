Estates = new Mongo.Collection("estates");



Estates.attachSchema(new SimpleSchema({
  estate_name: {
    type: String,
    label: transr('estate_name')
  },
  description: {
    type: String,
    optional: true,
    autoform: {
         rows: 5
      }
  },
  logo: {
    type: String,
    optional: true
  },
  portfolio_collection: {
    type: [String],
    optional: true
  }
}));
