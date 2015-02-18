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



// Template.settings.rendered = function () {

//     var calcEvolutionIndex = function (currentVal, previousVal) {
//         var total_in_percent = ( (currentVal / previousVal)-1 ) * 100;
//         return total_in_percent.toFixed(3) *1 ;
//     };

//     // FORMULA for evolution index
//     //Looking for yearly_values.1.cost
//     $("[name^='yearly_values.'][name$='.cost']").keyup(function() {
//         position = $(this).attr("name").split(".");
//         // console.log(position);

//         if (position[1] >0) {
//             var current_cost = $(this).val() *1 ;
//             var previous_cost = $("[name='yearly_values." + (position[1]-1) + ".cost']").val() *1;

//             // Set evolution_index
//             $("[name='yearly_values." + position[1] + ".evolution_index']").val(
//                 calcEvolutionIndex(current_cost, previous_cost)
//             );
//         }
//     });

//     // FORMULA for evolution index
//     //Looking for yearly_values.1.cost
//     $("[name^='icc.evolution_index.'][name$='.cost']").keyup(function() {
//         var position = $(this).attr("name").split(".");
//         var position_number = position.length - 2;
//         console.log("positon is " + position_number);

//         if (position[position_number] >0) {
//             var current_cost = $(this).val() *1 ;
//             var previous_cost = $("[name='icc.evolution_index." + (position[position_number]-1) + ".cost']").val() *1;

//             console.log("calcEvolutionIndex is: " + calcEvolutionIndex(current_cost, previous_cost) );

//             // Set evolution_index
//             $("[name='icc.evolution_index." + position[position_number] + ".evolution_index']").val(
//                 calcEvolutionIndex(current_cost, previous_cost)
//             );
//         }
//     });

//     // FORMULA for GLOBAL evolution index
//     Tracker.autorun(function () {
//         var lastCost = AutoForm.getFieldValue("fluidAutoForm", "yearly_values.30.cost") ;
//         var firstCost = AutoForm.getFieldValue("fluidAutoForm", "yearly_values.0.cost") ;
//         console.log(firstCost + " - " + lastCost);
//         $("[name='global_evolution_index']").val(
//             calcEvolutionIndex(lastCost, firstCost)
//         );
//     });

// };
