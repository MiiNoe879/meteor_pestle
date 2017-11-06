import { recipeView } from './recipeView.html';
import {
    receipe
} from '/imports/api/collections/receipe';

Template.recipeView.onCreated(function(){

});

Template.recipeView.helpers({
  isCurUserCreatedRec(){
    let receipe_id = FlowRouter.current().params.receipe_id;
    let isCurUserCreatedRec =  false;

    let recipeDet = receipe.findOne({
        "_id" : receipe_id
    });

    if(recipeDet && recipeDet.createdBy ==  Meteor.userId()){
      return true;
    }
  },
  getStepNo(index){
    return (index + 1);
  },
  raceipeDetail : function(){
    let receipe_id = FlowRouter.current().params.receipe_id;

    let recipeList = receipe.find({
        "_id" : receipe_id
    }).fetch();
     recipeList[0].totalTime=recipeList[0].totalTime.replace(/\s/g,'');  ;
    if(recipeList[0]){
      recipeList[0].receipeImageUrl = Meteor.absoluteUrl() + "cfs/files/Images/" + recipeList[0].image + "/receipeImage.jpg";

      if(recipeList[0].linkedReceipes && recipeList[0].linkedReceipes.length > 0){
        recipeList[0].hasLinkedReceipe = true;
      }

      if(recipeList[0].totalTime){
        recipeList[0].hasTotalTime = true;
      }

      if(recipeList[0].serving){
        recipeList[0].hasServing = true;
      }

      if(recipeList[0].totalTime || recipeList[0].serving){
        recipeList[0].hasTotalTimeOrServing = true;
      }
      return recipeList[0];
    }
  },

  getReceipeName: function(receipe_id){
    let recipeDet = receipe.findOne({
        "_id" : receipe_id
    });

    return recipeDet.name;
  },

  receipeLink: function(){
    let receipeLink =window.location.host+FlowRouter.current().path;
    return receipeLink;
  },
});

Template.recipeView.onRendered(function(){
  var notification = $("#flashMsg").find("div").text();
  if (notification !=""){
    $( ".reciper_view_screen_footer" ).slideUp( 300 ).delay( 5000 ).fadeIn( 400 );
  }
});

Template.recipeView.events({
  'click #back' (e, t) {
    e.preventDefault();
    FlowRouter.go('home');
  },
  'click #share'(e, t){
    e.preventDefault();
    $('#shareRecipe').modal('show');
  },
  'click #more'(e, t){
    e.preventDefault();
    $('#moreOptionRecipe').modal('show');
  },
  'click .delete-recp'(e, t){
    e.preventDefault();

    let receipe_id = FlowRouter.current().params.receipe_id;

    Meteor.call("deleteReceipe",receipe_id,function(err,res){
      $('#moreOptionRecipe').modal('hide');

      if(err){
        FlashMessages.sendError(err.message);
      }else{
        FlashMessages.sendSuccess("Recipe deleted successfully.");
        setTimeout(function(){
          FlowRouter.go('home');
        },1000);
      }
    });
  },
  'click .duplicate-recp'(e, t){
    e.preventDefault();

    let receipe_id = FlowRouter.current().params.receipe_id;

    Meteor.call("duplicateReceipe",receipe_id,function(err,res){
      $('#moreOptionRecipe').modal('hide');

      if(err){
        FlashMessages.sendError(err.message);
      }else{
        FlashMessages.sendSuccess("Recipe duplicated successfully.");
        setTimeout(function(){
          FlowRouter.go('/view/'+ res);
        },1000);
      }
    });
  },
  "click .recipe_finish_view_edit"(e, t){
    e.preventDefault();

    let receipe_id = FlowRouter.current().params.receipe_id;
    FlowRouter.go('/edit/'+receipe_id);
  }
});
