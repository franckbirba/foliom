if (Meteor.isClient) {

  Template.quickForm_arraySettings.helpers({
    idPrefix: function() {
      return this.atts['id-prefix'];
    },
    submitButtonAtts: function plQuickFormSubmitButtonAtts() {
      var qfAtts = this.atts;
      var atts = {};
      if (typeof qfAtts.buttonClasses === 'string') {
        atts['class'] = qfAtts.buttonClasses;
      }
      return atts;
    }
  });

}
