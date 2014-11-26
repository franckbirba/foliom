Portfolios = new Mongo.Collection("portfolios");


Portfolios.attachSchema(new SimpleSchema({
 	name: {
		type: String
  	},
	address: {
		type: Object
	},
	'address.street': {
	    type: String
  	},
  	'address.city': {
    	type: String
  	},
  	'address.zip': {
	    type: String,
	    regEx: /^[0-9]{5}$/
  	},
 	description: {
		type: String,
		optional: true
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
