if (typeof Schema === "undefined") Schema = {};

Schema.UserProfile = new SimpleSchema({
  firstName: {
    type: String,
    regEx: /^[a-zA-Z-]{2,25}$/
  },
  lastName: {
    type: String,
    regEx: /^[a-zA-Z]{2,25}$/
  },
  gender: {
    type: String,
    allowedValues: ['Male', 'Female'],
    optional: true,
    autoform: {
      omit: true
    }
  },
  phoneNumber: {
    optional: true,
    type: Number,
    min: 9,
    max: 10
  },
  lang: {
    type: String,
    label: transr('lang'),
    defaultValue: 'fr',
    autoform: {
      afFieldInput: {
        type: 'select',
        firstOption:transr("select_default_value"),
        options: function() {
          return buildOptions([{
            label: 'Français',
            value: 'fr'
          }, {
            label: 'English',
            value: 'en'
          }]);
        }
      }
    },
    optional: true
  }
});

Schema.Email = new SimpleSchema({
  address: {
    type: String
  },
  verified: {
    optional: true,
    type: Boolean,
    autoform: {
      omit: true
    }
  }
});

Schema.User = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Id
  },
  emails: {
    type: [Schema.Email],
    regEx: SimpleSchema.RegEx.Email
  },
  createdAt: {
    type: Date,
    defaultValue: new Date()
  },
  profile: {
    type: Schema.UserProfile,
  },
  field_for_password: {
    type: String,
    label: transr("password"),
    optional: true,
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  roles: {
    blackbox: true,
    type: [String],
    autoform: {
      type: 'select-checkbox'
    },
    optional: true
  }
});

Meteor.users.attachSchema(Schema.User);
