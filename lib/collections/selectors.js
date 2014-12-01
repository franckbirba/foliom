Selectors = new Mongo.Collection("selectors");


Selectors.attachSchema(new SimpleSchema({
    name: {
        type: String
    },
    labels: {
        type: [String]
    },
    portfolio_id: {
        type: String,
        optional: true
    }

}));
