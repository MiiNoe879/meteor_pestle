import {
    receipe
} from '/imports/api/collections/receipe';
import {
    scrapped
} from '/imports/api/collections/scrapped';
import {
    failedScrapped
} from '/imports/api/collections/failedScrapped';

Meteor.publish('receipeList', function(){
    return receipe.find({
        "createdBy": this.userId,
        isDeleted : false
    },{
      sort : {
        createdAt : -1
      }
    });
});

Meteor.publish('failedScrappedList', function(){
  let curFailedScrap = failedScrapped.find({
      "createdBy": this.userId,
      // isDeleted : false
  });

  console.log('==curFailedScrap ===',curFailedScrap.fetch().length);
  return curFailedScrap;
});

Meteor.publish('receipeDetail', function(receipe_id){
  let receipeData = receipe.findOne({
      "_id": receipe_id
  });

  let receipe_ids = [];

  if(receipeData && receipeData.linkedReceipes &&receipeData.linkedReceipes.length>0){
    receipe_ids = receipeData.linkedReceipes;
  }

  receipe_ids.push(receipe_id);

  let curReceipe = receipe.find({
      "_id": {
        $in : receipe_ids
      }
  });

  console.log('curReceipe===',curReceipe.fetch().length);
  return curReceipe;
});
