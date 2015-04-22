if (Meteor.isClient) {

  /*
   * Based on the template helpers for "bootstrap3" template
   */

  // quickForm helpers
  Template.quickForm_technical_compliance_category.helpers({
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


  // afFormGroup helpers
  Template.afFormGroup_technical_compliance_category.helpers({
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
    skipLabel: function() {
      var self = this;

      var type = AutoForm.getInputType(self.afFieldInputAtts);
      return (self.skipLabel || (type === 'boolean-checkbox' && !self.afFieldInputAtts.leftLabel));
    }
  });

  Template.afObjectField_technical_compliance_category_Block.helpers({
    quickFieldsAtts: function () {
      console.log("in block", this);
      return _.pick(this, 'name', 'id-prefix');
    }
  });

  Template.afObjectField_technical_compliance_category.helpers({
    quickFieldsAtts: function () {
      console.log("in normal", this);
      return _.pick(this, 'name', 'id-prefix');
    }
  });

}
