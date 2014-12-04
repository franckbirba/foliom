if(Meteor.isClient){
	Template.afArrayField_inline.helpers({
		yearlyValuesSchema: function(){
			return YearlyValues;
		}
	})

	Template.afInputNumber_verylight.helpers({
		isYear: function(year){
			if(year.name.indexOf('.year') >= 0){
				return true;
			}
			return false;
		},
		getPlaceHolder: function(value){
			if(value.indexOf('.cost')){
				return 'cost';
			} else if (value.indexOf('evolution_index')){
				return 'evolution_index';
			} else {
				return '';
			}
		}
	});

	
}
