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
  images: { // ToDo : gérer le multi-images
        type: String,
        label: transr("images"),
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'fileUpload',
                collection: 'Images'
            }
        }
    },
  users: {
    type: [String],
    optional: true,
    autoform: {
        type: "select-checkbox",
        // options: function () {
        //         return users();
        //     }
    }
  },
  portfolio_collection: {
    type: [String],
    optional: true,
    // autoValue: ""
  }
}));
