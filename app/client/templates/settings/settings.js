Template.settings.helpers(
	{
		getCfg: function(){
			var curEstate = Session.get('current_estate_doc');
			var masterCfg = Session.get('editingMasterCfg');
			if(!curEstate || masterCfg) {
				if(!masterCfg)
					Session.set('editingMasterCfg', true);
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
		},

	}
);

Template.settings.events({
	'click #edit-master': function(event, template){
		Session.set('editingMasterCfg', true);
	}
});

Template.settings.destroyed = function () {
	Session.set('editingMasterCfg', false);
};
