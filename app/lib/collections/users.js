if (typeof Schema === "undefined") Schema = {};

Schema.UserProfile = new SimpleSchema({
  firstName: {
    type: String,
    label: transr('firstName'),
  },
  lastName: {
    type: String,
    label: transr('lastName'),
  },
  phoneNumber: {
    optional: true,
    type: Number,
    label: transr('phoneNumber')
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
    label: transr('profile'),
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
