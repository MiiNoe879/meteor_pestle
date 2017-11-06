//Declare Users collection
Schema = {};

Schema.subscriptionData = new SimpleSchema({
    subscriptionId : {
      type : Boolean
    }
});

Schema.UserProfile = new SimpleSchema({
    name : {
      type : String,
      optional : true
    },
    isFreeTrialStarted : {
      type : Boolean,
      defaultValue : false
    },
    freetrialStartDate : {
      type : Date,
      optional : true
    },
    isSubscribed : {
      type : Boolean,
      defaultValue : false
    },
    subscriptionData : {
      type : Object,
      blackbox : true,
      optional : true
    }
});

export const Users = Meteor.users;

//Declared Schema of users
Schema.Users = new SimpleSchema({

    emails: {
        type: [Object],
        optional : true
    },
    "emails.$.address": {
        type: String,
        optional : true

    },
    "emails.$.verified": {
        type: Boolean,
        optional : true

    },
    createdAt: {
        type: Date,
        autoValue :function () {
          return new Date();
        }
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    profile: {
        type: Schema.UserProfile,
        optional: true,
        blackbox: true
    }
});

//Attached Schema with users collection
Users.attachSchema(Schema.Users);
