if (Meteor.isClient) {
  var findAtts = function() {
    var c, n = 0;
    do {
      c = Template.parentData(n++);
    } while (c && !c.atts);
    return c && c.atts;
  };


  Template['quickForm_eportfolio-horizontal'].helpers({
    inputClass: function() {
      var atts = findAtts();
      if (atts) {
        return atts['input-col-class'];
      }
    },
    labelClass: function() {
      var atts = findAtts();
      if (atts) {
        return atts['label-class'];
      }
    },
    submitButtonAtts: function() {
      var qfAtts = this.atts;
      var atts = {};
      if (typeof qfAtts.buttonClasses === 'string') {
        atts['class'] = qfAtts.buttonClasses;
      } else {
        atts['class'] = 'btn btn-primary';
      }
      return atts;
    },
    qfAutoFormContext: function() {
      var ctx = _.clone(this.qfAutoFormContext || {});
      ctx = AutoForm.Utility.addClass(ctx, 'form-horizontal');
      if (ctx['input-col-class'])
        delete ctx['input-col-class'];
      if (ctx['label-class'])
        delete ctx['label-class'];
      return ctx;
    }
  });

  Template['afFormGroup_eportfolio-horizontal'].helpers({
    afFieldInputAtts: function() {
      var atts = _.clone(this.afFieldInputAtts || {});
      if ('input-col-class' in atts) {
        delete atts['input-col-class'];
      }
      // We have a special template for check boxes, but otherwise we
      // want to use the same as those defined for eportfolio template.
      if (AutoForm.getInputType(this.afFieldInputAtts) === 'boolean-checkbox') {
        atts.template = 'eportfolio-horizontal';
      } else {
        atts.template = 'eportfolio';
      }
      return atts;
    },
    afFieldLabelAtts: function() {
      var atts = _.clone(this.afFieldLabelAtts || {});
      // Add bootstrap class
      atts = AutoForm.Utility.addClass(atts, 'control-label');
      return atts;
    },
    rightColumnClass: function() {
      var atts = this.afFieldInputAtts || {};
      return atts['input-col-class'] || '';
    },
    skipLabel: function() {
      var self = this;

      var type = AutoForm.getInputType(self.afFieldInputAtts);
      return (self.skipLabel || (type === 'boolean-checkbox' && !self.afFieldInputAtts.leftLabel));
    }
  });

  Template['afObjectField_eportfolio-horizontal'].helpers({
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
    }
  });

  Template['afArrayField_eportfolio-horizontal'].helpers({
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

      // console.log("calculating bootstrap class for" + schemaLbl);
      // console.log("result is" + result);

      if (result >= 4 && result < 6) {
        bootstrapClass = 'col-sm-4';
      } else if (result == 6) {
        bootstrapClass = 'col-sm-6';
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

  Template['afCheckbox_eportfolio-horizontal'].helpers({
    attsPlusSpecialClass: function() {
      var atts = _.clone(this.atts);
      atts = AutoForm.Utility.addClass(atts, 'autoform-checkbox-margin-fix');
      return atts;
    },
    useLeftLabel: function() {
      return this.atts.leftLabel;
    }
  });
}
