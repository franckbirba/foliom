if (Meteor.isClient) {

  Template.quickForm_arraySettings.helpers({
    inputClass: function() {
      return this.atts["input-col-class"];
    },
    labelClass: function() {
      return this.atts["label-class"];
    },
    quickFieldsAtts: function () {
      // These are the quickForm attributes that we want to forward to
      // the afQuickFields component.
      return _.pick(this.atts, 'id-prefix', 'input-col-class', 'label-class');
    },
    submitButtonAtts: function bsQuickFormSubmitButtonAtts() {
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
      ctx = AutoForm.Utility.addClass(ctx, "form-horizontal");
      delete ctx["input-col-class"];
      delete ctx["label-class"];
      delete ctx["id-prefix"];
      return ctx;
    }
  });

  Template['afFormGroup_arraySettings'].helpers({
    afFieldInputAtts: function() {
      var atts = _.clone(this.afFieldInputAtts || {});
      if ('input-col-class' in atts) {
        delete atts['input-col-class'];
      }
      // We have a special template for check boxes, but otherwise we
      // want to use the same as those defined for eportfolio-horizontal template.
      if (AutoForm.getInputType(this.afFieldInputAtts) === 'boolean-checkbox') {
        atts.template = 'bootstrap3-horizontal';
      }
      // else if (AutoForm.getInputType(this.afFieldInputAtts) === 'select-checkbox-inline') {
      //   atts.template = 'bootstrap3-horizontal';
      // }
      // else if (AutoForm.getInputType(this.afFieldInputAtts) === 'select-checkbox') {
      //   atts.template = 'bootstrap3-horizontal';
      // }
      else {
        // atts.template = 'eportfolio-horizontal';
        atts.template = 'bootstrap3';
        // [BSE] adding "form-control" class (fix for AutoForm5 changes)
        // atts = AutoForm.Utility.addClass(atts, 'form-control');
      }
      return atts;
    },
    afFieldLabelAtts: function() {
      var atts = _.clone(this.afFieldLabelAtts || {});
      // Add bootstrap class
      atts = AutoForm.Utility.addClass(atts, "control-label");
      return atts;
    },
    rightColumnClass: function() {
      var atts = this.afFieldInputAtts || {};
      return atts['input-col-class'] || "";
    },
    skipLabel: function() {
      var self = this;

      var type = AutoForm.getInputType(self.afFieldInputAtts);
      return (self.skipLabel || (type === 'boolean-checkbox' && !self.afFieldInputAtts.leftLabel));
    }
  });

  Template['afObjectField_arraySettings'].helpers({
    rightColumnClass: function() {
      return this['input-col-class'] || "";
    },
    afFieldLabelAtts: function() {
      // Use only atts beginning with label-
      var labelAtts = {};
      _.each(this.atts, function(val, key) {
        if (key.indexOf("label-") === 0) {
          labelAtts[key.substring(6)] = val;
        }
      });
      // Add bootstrap class
      labelAtts = AutoForm.Utility.addClass(labelAtts, "control-label");
      return labelAtts;
    },
    quickFieldsAtts: function () {
      // console.log("in eportfolio-horizontal", this);
      var atts = _.pick(this, 'name', 'id-prefix');
      // We want to default to using bootstrap3 template below this point
      // because we don't want horizontal within horizontal
      // atts.template = 'bootstrap3'; // 2015-04-21 commented by BSE: we don't mind having horizontal within horizontal
      return atts;
    }
  });

  Template['afArrayField_arraySettings'].helpers({
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
  Template["afArrayField_fluidsArray"].helpers({
    rightColumnClass: function () {
      var atts = this.atts || {};
      // console.log("rightColumnClass: ", atts);
      return atts['input-col-class'] || "";
    },
    afFieldLabelAtts: function () {
      // Use only atts beginning with label-
      var labelAtts = {};
      _.each(this.atts, function (val, key) {
        if (key.indexOf("label-") === 0) {
          labelAtts[key.substring(6)] = val;
        }
      });
      // Add bootstrap class
      labelAtts = AutoForm.Utility.addClass(labelAtts, "control-label");
      console.log("afFieldLabelAtts: ", labelAtts);
      return labelAtts;
    }
  });
}
