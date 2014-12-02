 // estate_id : Estate ref
 //     fluid_type : Selector // sélecteur modifiable
 //     fluid_provider : Selector // idem

 //     yearly_values : [
 //        { year : Number,
 //         cost : Number,
 //         evolution_index : Number } ]
 //     global_evolution_index : Number

Fluids = new Mongo.Collection("fluids");


Fluids.attachSchema(new SimpleSchema({
    estate_id: {
        type: String,
        autoform: {
            omit:true
        }
    },
    fluid_type: {
        type: String,
        autoform: {
            type: "select",
            options: function () {
                return getSelectors('fluid_type');
            }
        }
    },
    fluid_provider: {
        type: String,
        autoform: {
            type: "select",
            options: function () {
                return getSelectors('fluid_provider');
            }
        }
    },
    yearly_values: {
        type: Array,
        autoform: {
            minCount: 31,
            maxCount: 31
        }
    },
    'yearly_values.$': {
        type: Object
    },
    'yearly_values.$.year': {
        type: Number
    },
    'yearly_values.$.cost': {
        type: Number
    },
    'yearly_values.$.evolution_index': {
        type: Number
    },
    global_evolution_index: {
        type: Number
    },


}));
