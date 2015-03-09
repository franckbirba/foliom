if (Meteor.isClient) {

  /*
   * Template helpers for "bootstrap3" template
   */

  Template.quickForm_conformity_infoSchema.helpers({
    idPrefix: function() {
      return this.atts["id-prefix"];
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
    }
  });

  Template.afFormGroup_conformity_infoSchema.helpers({
    skipLabel: function bsFormGroupSkipLabel() {
      var self = this;

      var type = AutoForm.getInputType(self.afFieldInputAtts);
      return (self.skipLabel || type === 'boolean-checkbox');
    },
    bsFieldLabelAtts: function bsFieldLabelAtts() {
      var atts = _.clone(this.afFieldLabelAtts);
      // Add bootstrap class
      atts = AutoForm.Utility.addClass(atts, 'control-label');
      return atts;
    }
  });

  _.each([
    'afSelect_conformity_infoSchema',
    'afBooleanSelect_conformity_infoSchema',
    'afSelectMultiple_conformity_infoSchema',
    'afTextarea_conformity_infoSchema',
    'afInputText_conformity_infoSchema',
    'afInputPassword_conformity_infoSchema',
    'afInputDateTime_conformity_infoSchema',
    'afInputDateTimeLocal_conformity_infoSchema',
    'afInputDate_conformity_infoSchema',
    'afInputMonth_conformity_infoSchema',
    'afInputTime_conformity_infoSchema',
    'afInputWeek_conformity_infoSchema',
    'afInputNumber_conformity_infoSchema',
    'afInputEmail_conformity_infoSchema',
    'afInputUrl_conformity_infoSchema',
    'afInputSearch_conformity_infoSchema',
    'afInputTel_conformity_infoSchema',
    'afInputColor_conformity_infoSchema'
  ], function(tmplName) {
    Template[tmplName].helpers({
      atts: function addFormControlAtts() {
        var atts = _.clone(this.atts);
        // Add bootstrap class
        atts = AutoForm.Utility.addClass(atts, 'form-control');
        return atts;
      }
    });
  });

  _.each([
    'afInputButton_conformity_infoSchema',
    'afInputSubmit_conformity_infoSchema',
    'afInputReset_conformity_infoSchema',
  ], function(tmplName) {
    Template[tmplName].helpers({
      atts: function addFormControlAtts() {
        var atts = _.clone(this.atts);
        // Add bootstrap class
        atts = AutoForm.Utility.addClass(atts, 'btn');
        return atts;
      }
    });
  });

  Template.afRadio_conformity_infoSchema.helpers({
    atts: function selectedAttsAdjust() {
      var atts = _.clone(this.atts);
      if (this.selected) {
        atts.checked = '';
      }
      return atts;
    }
  });

  _.each([
    'afCheckboxGroup_conformity_infoSchema',
    'afRadioGroup_conformity_infoSchema',
    'afCheckboxGroupInline_conformity_infoSchema',
    'afRadioGroupInline_conformity_infoSchema'
  ], function(tmplName) {
    Template[tmplName].helpers({
      atts: function selectedAttsAdjust() {
        var atts = _.clone(this.atts);
        if (this.selected) {
          atts.checked = '';
        }
        // remove data-schema-key attribute because we put it
        // on the entire group
        delete atts['data-schema-key'];
        return atts;
      },
      dsk: function dsk() {
        return {
          'data-schema-key': this.atts['data-schema-key']
        };
      }
    });
  });

  var selectHelpers = {
    optionAtts: function afSelectOptionAtts() {
      var item = this;
      var atts = {
        value: item.value
      };
      if (item.selected) {
        atts.selected = '';
      }
      return atts;
    }
  };
  Template.afSelect_conformity_infoSchema.helpers(selectHelpers);
  Template.afSelectMultiple_conformity_infoSchema.helpers(selectHelpers);
  Template.afBooleanSelect_conformity_infoSchema.helpers(selectHelpers);

  Template.afBooleanRadioGroup_conformity_infoSchema.helpers({
    falseAtts: function falseAtts() {
      var atts = _.omit(this.atts, 'trueLabel', 'falseLabel', 'data-schema-key');
      if (this.value === false) {
        atts.checked = '';
      }
      return atts;
    },
    trueAtts: function trueAtts() {
      var atts = _.omit(this.atts, 'trueLabel', 'falseLabel', 'data-schema-key');
      if (this.value === true) {
        atts.checked = '';
      }
      return atts;
    },
    dsk: function() {
      return {
        'data-schema-key': this.atts['data-schema-key']
      };
    }
  });

}
