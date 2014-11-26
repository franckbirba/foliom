Template.settings.helpers(
	{
		getMaster: function(){
			return Configurations.findOne({master:true});
		},
		getType: function(){
			return "insert";
			 //Configurations.findOne({master:true});
		}
	}
);

AutoForm.addHooks(null, {
	onError: function(){
		console.log(arguments);
	}
});

AutoForm.hooks({
	configs: {
		before: {
			onSubmit: function(insertDoc, updateDoc, currentDoc){
				
				console.log('onSubmit', arguments);
			}
		}
	}
});

