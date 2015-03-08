AddressSchema = new SimpleSchema({
  street: {
    type: String,
    label: transr('street')
  },
  zip: {
    type: Number,
    label: transr('zip')
  },
  city: {
    type: String,
    label: transr('city')
  },
  area: {
    type: String,
    label: transr('area'),
    optional: true
  },
  country: {
    type: String,
    label: transr('country')
  },
  gps_long: {
    type: String,
    optional: true,
    autoform: {
      omit: true
    }
  },
  gps_lat: {
    type: String,
    optional: true,
    autoform: {
      omit: true
    }
  }
});
