export const scrapped = new Mongo.Collection('scrapped');

scrapped.attachSchema(new SimpleSchema({
  url : {
    type : String,
  },
  name : {
    type : String
  },
  image : {
    type : String
  },
  ingredient : {
    type : [String]
  },
  instruction : {
    type : [String]
  },
  prepTime : {
    type : String,
    optional : true
  },
  cookTime : {
    type : String,
    optional : true
  },
  totalTime : {
    type : String,
    optional : true
  },
  description : {
    type : String,
    optional : true
  },
  serving : {
    type : String,
    optional : true
  },
  createdBy: {
    type: String,
    autoValue: function () {
      if (this.isInsert) {
        return Meteor.userId();
      }
    }
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return (new Date());
      }
    }
  },
}));
