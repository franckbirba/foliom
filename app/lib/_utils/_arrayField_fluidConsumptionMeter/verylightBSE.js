if (Meteor.isClient) {

  Template['afFormGroup_verylightBSE'].helpers({
      afFieldInputAtts: function() {
        var atts = _.clone(this.afFieldInputAtts || {});
        // We have a special template for check boxes, but otherwise we
        // want to use the same as those defined for eportfolio-horizontal template.
        if (AutoForm.getInputType(this.afFieldInputAtts) === 'boolean-checkbox') {
          atts.template = 'bootstrap3-horizontal';
        } else {
          // atts.template = 'eportfolio-horizontal';
          atts.template = 'eportfolio-horizontal';
          // [BSE] adding "form-control" class (fix for AutoForm5 changes)
          atts = AutoForm.Utility.addClass(atts, 'form-control');
        }
        return atts;
      },
    });

}
