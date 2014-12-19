Template.settings.helpers(
	{
		getCfg: function(){
			var curEstate = Session.get('current_estate_doc');
			var masterCfg = Session.get('editingMasterCfg');
			if(!curEstate || masterCfg) {
				if(!masterCfg)
					Session.set('editingMasterCfg', true);
				console.log('MASTER');
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
		fluidSchema: function () {
	    	return Schema.Fluids;
	  	},
	  	getEstate: function() {
		    return Session.get('current_estate_doc') ? Session.get('current_estate_doc')._id : null ;
		},
		getFluid: function(){
		    return Session.get('update_fluid') ? Session.get('update_fluid') : null;
		  }

	}	
);

Template.settings.events(
	{
		'click .edit-master': function(template, event){
			Session.set('editingMasterCfg', true);
		},
		'click .newfluid': function(){
		    console.log('new fluid');
		}
	}
);

AutoForm.hooks({
  fluidAutoForm: {
    onSubmit: function(insertDoc, updateDoc, currentDoc){
    	var cfg = Configurations.findOne({master: {$exists:false}});
    	cfg.fluids.push(insertDoc);
    	console.log(cfg);
    	try {
    		Configurations.update(cfg._id, {$set: {fluids: cfg.fluids}}, {validate: false});
    	} catch(e){
    		console.log(e);
    	}
      /*if(Session.get('update_fluid')){
        Fluids.update(currentDoc._id,updateDoc);
        
      } else {
        Fluids.insert(insertDoc);
      }*/
      $("#fluidformmodal").hide();
      this.done();
      this.event.preventDefault();

      return false;
   }
  }
});