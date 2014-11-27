Template.estate.helpers(
	{
		estates: function(){
			return Estates.find().fetch();
		},
		'click #new_estate': function(){
			
		},
		name: function(estate){
			return estate.name;
		}
	}
)