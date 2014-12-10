Portfolios = new Mongo.Collection("portfolios");


Portfolios.attachSchema(new SimpleSchema({
 	name: {
		type: String
  	},
	address: {
        type: AddressSchema
    },
 	description: {
		type: String,
		optional: true,
        autoform: {
            rows: 6
        }
	},
	image: {
		type: String,
		optional: true
	}
	/*
	summary : {
		total_surface : Number
		occupation_rate : Number
		condition_idx : Number
		conformity_idx : Number
		avg_performance : Number
		avg_age : Number
  	} */
}));
