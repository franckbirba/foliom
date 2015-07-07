if (Meteor.isClient) {

  Template['afArrayField_eportfolio-settings'].helpers({
    yearlyValuesSchema: function() {
      return YearlyValues;
    },
    getTableWidth: function() {
      return $(window).width() * 60 / 100;
    },
    getMargin: function() {
      return $(window).width() * 15 / 100;
    },
    getFirstValue: function() {
      console.log(this);
    },
    getLastValue: function() {
      console.log(this);
    },
    isNotFirstOrLastYear: function(heads, year) {
      return year !== 'yearly_values.0' && year !== 'yearly_values.30';
    },
    isLastYear: function(year) {
      return year === 'yearly_values.30';
    },
    isFirstYear: function(year) {
      return year === 'yearly_values.0';
    },
    rightColumnClass: function() {
      var atts = this.atts || {};
      return atts['input-col-class'] || '';
    },
    afFieldLabelAtts: function() {
      // Use only atts beginning with label-
      var labelAtts = {};
      _.each(this.atts, function(val, key) {
        if (key.indexOf('label-') === 0) {
          labelAtts[key.substring(6)] = val;
        }
      });
      // Add bootstrap class
      labelAtts = AutoForm.Utility.addClass(labelAtts, 'control-label');
      return labelAtts;
    },
    getSchemaFields: function() {
      var schemaLbl = this.atts.name.split('.').pop();
      var tmp = [];
      var labels = [];
      if (!Schema[schemaLbl])
        return;
      var tmpSchema = Schema[schemaLbl].schema();
      for (var s in tmpSchema) {
        if (tmpSchema[s].autoform && tmpSchema[s].autoform.omit) {
          continue;
        }
        labels.push(s.split('.').pop());
      }
      var result = 12 / labels.length;
      var bootstrapClass = '';
      if (result >= 4 && result <= 6) {
        bootstrapClass = 'col-sm-4';
      } else if (result >= 3 && result <= 4) {
        bootstrapClass = 'col-sm-3';
      } else if (result >= 2 && result <= 3) {
        bootstrapClass = 'col-sm-2';
      } else if (result >= 1 && result <= 2) {
        bootstrapClass = 'col-sm-1';
      } else {
        bootstrapClass = 'col-sm-12';
      }
      //Session.set('getSchemaFields', labels);
      for (var lbl in labels) {
        tmp.push({
          label: transr(labels[lbl])(),
          bootstrap: bootstrapClass
        });
      }
      return tmp;
    },
    getBootStrapClass: function() {
      var result = 12 / this.length;
      if (result >= 3) {
        return 'col-sm-3';
      } else if (result >= 4) {
        return 'col-sm-4';
      } else {
        return 'col-sm-1';
      }
    }
  });

  Template['afObjectField_eportfolio-settings'].helpers({
    yearlyValues: function() {
      var formatedValues = [];
      var tmp = this.atts.name;
      var index = tmp.split('.').shift();
      _.each(this.yearly_values, function(value, index) {
        formatedValues.push({
          name: 'fluids.0.yearly_values.' + index + '.year'
        });
      });
      return formatedValues;
    },
    getTest: function(val) {
      console.log('TEST', val);
    },
    fluidCollection: function() {
      return Fluids;
    },
    fluidSchema: function() {
      return Schema.Fluids;
    },
    headValue: function() {
      return this.value;
    },
    getLabel: function() {

    },
    fluids: function() {
      return Fluids.find().fetch();
    },
    fixedHead: function() {
      var field = this.atts.name;
      return [{
        id: field.concat('.fluid_type'),
        style: ''
      }, {
        id: field.concat('.fluid_provider'),
        style: ''
      }, {
        id: field.concat('.yearly_values.0.year'),
        value: new Date().getFullYear(),
        style: 'width:50px;margin-left:10px;'
      }];
    },
    getName: function(field) {
      return this.atts.name + "." + field;
    },
    getFirstYear: function() {
      return new Date().getFullYear();
    },
    generateId: function(att, field) {
      return att + '.' + field;
    },
    getLeft: function(heads, value) {
      if (heads[0] === value) {
        return 'left:-180px';
      } else if (heads[1] === value) {
        return 'left:-120px';
      } else if (heads[2] === value) {
        return 'left:-60px';
      } else if (heads[heads.length - 1] === value) {
        return 'right:-60px';
      }
    },
    isStaticHead: function(heads, value) {
      return ([heads[0], heads[1], heads[2], heads[heads.length - 1]].indexOf(value) >= 0);
    },
    getHeads: function() {
      var getYearlyValues = function() {
        var values = [];
        for (cpt = 1; cpt < 30; cpt++) {
          values.push(Number(new Date().getFullYear()) + Number(cpt));
        }
        return values;
      };
      return [].concat(getYearlyValues());
    },
    /* PEM Removing doublon rightColumnClass: function() {
      var atts = this.atts || {};
      return atts['input-col-class'] || '';
    },
    afFieldLabelAtts: function() {
      // Use only atts beginning with label-
      var labelAtts = {};
      _.each(this.atts, function(val, key) {
        if (key.indexOf('label-') === 0) {
          labelAtts[key.substring(6)] = val;
        }
      });
      // Add bootstrap class
      labelAtts = AutoForm.Utility.addClass(labelAtts, 'control-label');
      return labelAtts;
    },*/
    yearlyValuesSchema: function() {
      return YearlyValues;
    },
    getTableWidth: function() {
      return $(window).width() * 40 / 100;
    },
    getMargin: function() {
      return $(window).width() * 15 / 100;
    },
    getFirstValue: function() {},
    getLastValue: function() {},
    isNotFirstOrLastYear: function(heads, year) {
      return ((heads[2] !== year) && (heads[30]) !== year);
    },
    isLastYear: function(year) {
      return year === 'yearly_values.30';
    },
    isFirstYear: function(year) {
      return year === 'yearly_values.0';
    },
    rightColumnClass: function() {
      var atts = this.atts || {};
      return atts['input-col-class'] || '';
    },
    afFieldLabelAtts: function() {
      // Use only atts beginning with label-
      var labelAtts = {};
      _.each(this.atts, function(val, key) {
        if (key.indexOf('label-') === 0) {
          labelAtts[key.substring(6)] = val;
        }
      });
      // Add bootstrap class
      labelAtts = AutoForm.Utility.addClass(labelAtts, 'control-label');
      return labelAtts;
    },
    getSchemaFields: function() {
      var schemaLbl = this.atts.name.split('.').pop();
      var tmp = [];
      var labels = [];
      if (!Schema[schemaLbl])
        return;
      var tmpSchema = Schema[schemaLbl].schema();
      for (var s in tmpSchema) {
        if (tmpSchema[s].autoform && tmpSchema[s].autoform.omit) {
          continue;
        }
        labels.push(s.split('.').pop());
      }
      var result = 12 / labels.length;
      var bootstrapClass = '';
      if (result >= 4 && result <= 6) {
        bootstrapClass = 'col-sm-4';
      } else if (result >= 3 && result <= 4) {
        bootstrapClass = 'col-sm-3';
      } else if (result >= 2 && result <= 3) {
        bootstrapClass = 'col-sm-2';
      } else if (result >= 1 && result <= 2) {
        bootstrapClass = 'col-sm-1';
      } else {
        bootstrapClass = 'col-sm-12';
      }
      //Session.set('getSchemaFields', labels);
      for (var lbl in labels) {
        tmp.push({
          label: transr(labels[lbl])(),
          bootstrap: bootstrapClass
        });
      }
      return tmp;
    },
    getBootStrapClass: function() {
      var result = 12 / this.length;
      if (result >= 3) {
        return 'col-sm-3';
      } else if (result >= 4) {
        return 'col-sm-4';
      } else {
        return 'col-sm-1';
      }
    }
  });
}
