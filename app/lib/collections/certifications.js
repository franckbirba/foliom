// Certifications
// [ {
//      estate_id : Estate ref
//      name : String
//      logo : String
// } ]


Certifications = new Mongo.Collection("certifications");


Certifications.attachSchema(new SimpleSchema({
  estate_id: {
    type: String,
    optional: true,
    autoform: {
      omit: true
    }
  },
  name: {
    type: String,
    label: transr('name')
  },
  logo: {
    type: String
  },
}));
