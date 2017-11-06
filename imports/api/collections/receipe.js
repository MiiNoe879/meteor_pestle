export const receipe = new Mongo.Collection('receipe');

import {failedScrapped} from './failedScrapped.js';
import {Users} from './user.js';

receipe.attachSchema(new SimpleSchema({
  url : {
    type : String,
    optional : true
  },
  isDuplicated : {
    type : Boolean,
    defaultValue : false
  },
  originalRecpId : {
    type : String,
    optional : true
  },
  name : {
    type : String
  },
  image : {
    type : String,
    optional : true
  },
  ingredient : {
    type : [String],
    optional : true
  },
  instruction : {
    type : [String],
    optional : true
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
  linkedReceipes : {
    type : [String],
    optional : true
  },
  isDeleted : {
    type : Boolean,
    defaultValue : false
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

receipe.after.insert(function (userId, doc) {
  let receipeList = receipe.find({
    createdBy : userId,
    isDeleted : false
  }).fetch();

  if(receipeList.length == 21){
    Users.update({
      _id : userId
    },{
      $set : {
        "profile.isFreeTrialStarted" : true,
        "profile.freetrialStartDate" : new Date()
      }
    });
  }

  let failedReceipeList = failedScrapped.remove({
    url : doc.url,
    createdBy : userId
  });
});
