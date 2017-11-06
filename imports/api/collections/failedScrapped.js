export const failedScrapped = new Mongo.Collection('failedScrapped');

failedScrapped.attachSchema(new SimpleSchema({
  url : {
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
