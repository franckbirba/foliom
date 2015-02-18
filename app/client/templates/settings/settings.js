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
		fluidSchema: function () {
	    	return Schema.Fluids;
	  	},
	  	getEstate: function() {
		    return Session.get('current_estate_doc') ? Session.get('current_estate_doc')._id : null ;
		},
		getFluid: function(){
			return null;
		    //return Session.get('update_fluid') ? Session.get('update_fluid') : null;
		  }

	}
);

Template.settings.events(
	{
		'click .edit-master': function(event, template){
			Session.set('editingMasterCfg', true);
		}
	}
);

AutoForm.hooks({
	configAutoForm: {
		onSubmit: function(){
			console.log('SUBMIT TOO');
			debugger;
		}
	},
  fluidAutoForm: {
    onSubmit: function(insertDoc, updateDoc, currentDoc){
    //	this.event.preventDefault();
    	var cfg = Configurations.findOne({master: false});
    	cfg.fluids.push(insertDoc);
    	try {
    		Configurations.update(cfg._id, {$set: {fluids: cfg.fluids}}, {validate: false});
	    	$("#fluidformmodal").modal('hide');
    	} catch(e){
    		console.log(e);
    	}
    	this.done();
    	return false;


      /*if(Session.get('update_fluid')){
        Fluids.update(currentDoc._id,updateDoc);

      } else {
        Fluids.insert(insertDoc);
      }*/
   }
  }
});




