Selectors = new Mongo.Collection('selectors');


Selectors.attachSchema(new SimpleSchema({
  name: {
    type: String,
    autoform: {
      omit: true
    }
  },
  labels: {
    type: [String],
  },
  portfolio_id: {
    type: String,
    optional: true,
    autoform: {
      omit: true
    }
  },
  estate_id: {
    type: String,
    optional: true,
    autoform: {
      omit: true
    }
  }
}));
