Template.settings.helpers(
	{
		getCfg: function(){
			var curEstate = Session.get('current_estate_doc');
			var masterCfg = Session.get('editingMasterCfg');
			if(!curEstate || masterCfg) {
				return Configurations.findOne({master: true});
			}
			var curEstateId = curEstate._id;
			return Configurations.findOne({estate_id: curEstateId});
		},
		getType: function(){
			return "update";
		},
		isEditingMasterCfg : function(){
			return Session.get('editingMasterCfg') ? "active btn-success" : "";
		}
	}
);

Template.settings.events(
	{
		'click .edit-master': function(template, event){
			var masterCfg = Configurations.findOne({master:true});
			Session.set('editingMasterCfg', true);
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

