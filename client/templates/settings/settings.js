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



Template.settings.rendered = function () {

    var calcEvolutionIndex = function (currentVal, previousVal) {
        var total_in_percent = ( (currentVal / previousVal)-1 ) * 100;
        return total_in_percent.toFixed(3) *1 ;
    };

    // FORMULA for evolution index
    //Looking for yearly_values.1.cost
    $("[name^='yearly_values.'][name$='.cost']").keyup(function() {
        position = $(this).attr("name").split(".");
        // console.log(position);

        if (position[1] >0) {
            var current_cost = $(this).val() *1 ;
            var previous_cost = $("[name='yearly_values." + (position[1]-1) + ".cost']").val() *1;

            // Set evolution_index
            $("[name='yearly_values." + position[1] + ".evolution_index']").val(
                calcEvolutionIndex(current_cost, previous_cost)
            );
        }
    });

    // FORMULA for GLOBAL evolution index
    Tracker.autorun(function () {
        var lastCost = AutoForm.getFieldValue("fluidAutoForm", "yearly_values.30.cost") ;
        var firstCost = AutoForm.getFieldValue("fluidAutoForm", "yearly_values.0.cost") ;
        console.log(firstCost + " - " + lastCost);
        $("[name='global_evolution_index']").val(
            calcEvolutionIndex(lastCost, firstCost)
        );
    });

};
