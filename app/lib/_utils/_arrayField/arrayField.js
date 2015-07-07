if (Meteor.isClient) {
  Template.afArrayField_inline.helpers({
    yearlyValuesSchema: function() {
      return YearlyValues;
    },
    getTableWidth: function() {
      return $(window).width() * 60 / 100;
    },
    getMargin: function() {
      return $(window).width() * 15 / 100
    },
    getFirstValue: function() {
      console.log(this);
    },
    getLastValue: function() {
      console.log(this);
    },
    isNotFirstOrLastYear: function(year) {
      return year !== 'yearly_values.0' && year !== 'yearly_values.30';
    },
    isLastYear: function(year) {
      return year === 'yearly_values.30';
    },
    isFirstYear: function(year) {
      return year === 'yearly_values.0';
    }
  });


  Template.afInputNumber_verylight.helpers({
    isYear: function(year) {
      if (year.name.indexOf('.year') >= 0) {
        return true;
      }
      return false;
    },
    getPlaceHolder: function(value) {
      if (value.indexOf('.cost') >= 0) {
        return 'cost';
      } else if (value.indexOf('evolution_index') >= 0) {
        return 'evolution_index';
      } else {
        return '';
      }
    }
  });


}
