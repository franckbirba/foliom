if (Meteor.isClient) {

  /*
   * Based on the template helpers for "bootstrap3" template
   */

  // quickForm helpers
  Template.quickForm_technical_compliance_category.helpers({
    quickFieldsAtts: function () {
      // These are the quickForm attributes that we want to forward to
      // the afQuickFields component.
      return _.pick(this.atts, 'id-prefix');
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
    qfAutoFormContext: function () {
      var ctx = _.clone(this.qfAutoFormContext);
      delete ctx['id-prefix'];
      return ctx;
    }
  });


  // afFormGroup helpers
  Template.afFormGroup_technical_compliance_category.helpers({
    skipLabel: function bsFormGroupSkipLabel() {
      var self = this;

      var type = AutoForm.getInputType(self.afFieldInputAtts);
      return (self.skipLabel || type === "boolean-checkbox");
    },
    bsFieldLabelAtts: function bsFieldLabelAtts() {
      var atts = _.clone(this.afFieldLabelAtts);
      // Add bootstrap class
      atts = AutoForm.Utility.addClass(atts, "control-label");
      return atts;
    }
  });

  Template.afObjectField_technical_compliance_category_Block.helpers({
    quickFieldsAtts: function () {
      return _.pick(this, 'name', 'id-prefix');
    }
  });

  Template.afObjectField_technical_compliance_category.helpers({
    quickFieldsAtts: function () {
      return _.pick(this, 'name', 'id-prefix');
    }
  });

}
