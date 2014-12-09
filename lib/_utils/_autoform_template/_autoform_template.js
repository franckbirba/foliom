if(Meteor.isClient){
  function findAtts() {
  var c, n = 0;
  do {
    c = Template.parentData(n++);
  } while (c && !c.atts);
  return c && c.atts;
}

Template['quickForm_eportfolio-horizontal'].helpers({
  inputClass: function () {
    var atts = findAtts();
    if (atts) {
      return atts["input-col-class"];
    }
  },
  labelClass: function () {
    var atts = findAtts();
    if (atts) {
      return atts["label-class"];
    }
  },
  submitButtonAtts: function () {
    var qfAtts = this.atts;
    var atts = {};
    if (typeof qfAtts.buttonClasses === "string") {
      atts['class'] = qfAtts.buttonClasses;
    } else {
      atts['class'] = 'btn btn-primary';
    }
    return atts;
  },
  qfAutoFormContext: function () {
    var ctx = _.clone(this.qfAutoFormContext || {});
    ctx = AutoForm.Utility.addClass(ctx, "form-horizontal");
    if (ctx["input-col-class"])
      delete ctx["input-col-class"];
    if (ctx["label-class"])
      delete ctx["label-class"];
    return ctx;
  }
});

Template["afFormGroup_eportfolio-horizontal"].helpers({
  afFieldInputAtts: function () {
    var atts = _.clone(this.afFieldInputAtts || {});
    if ('input-col-class' in atts) {
      delete atts['input-col-class'];
    }
    // We have a special template for check boxes, but otherwise we
    // want to use the same as those defined for eportfolio template.
    if (AutoForm.getInputType(this.afFieldInputAtts) === "boolean-checkbox") {
      atts.template = "eportfolio-horizontal";
    } else {
      atts.template = "eportfolio";
    }
    return atts;
  },
  afFieldLabelAtts: function () {
    var atts = _.clone(this.afFieldLabelAtts || {});
    // Add bootstrap class
    atts = AutoForm.Utility.addClass(atts, "control-label");
    return atts;
  },
  rightColumnClass: function () {
    var atts = this.afFieldInputAtts || {};
    return atts['input-col-class'] || "";
  },
  skipLabel: function () {
    var self = this;

    var type = AutoForm.getInputType(self.afFieldInputAtts);
    return (self.skipLabel || (type === "boolean-checkbox" && !self.afFieldInputAtts.leftLabel));
  }
});

Template["afObjectField_eportfolio-horizontal"].helpers({
  rightColumnClass: function () {
    var atts = this.atts || {};
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
    return labelAtts;
  }
});

Template["afArrayField_eportfolio-horizontal"].helpers({
  rightColumnClass: function () {
    var atts = this.atts || {};
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
    return labelAtts;
  }
});

Template["afCheckbox_eportfolio-horizontal"].helpers({
  attsPlusSpecialClass: function () {
    var atts = _.clone(this.atts);
    atts = AutoForm.Utility.addClass(atts, "autoform-checkbox-margin-fix");
    return atts;
  },
  useLeftLabel: function () {
    return this.atts.leftLabel;
  }
});
}
