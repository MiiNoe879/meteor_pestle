import { home } from './home.html';
import {
    receipe
} from '/imports/api/collections/receipe';
import {
    failedScrapped
} from '/imports/api/collections/failedScrapped';

Session.set("canAddReceipe",false);
Session.set("receipAddErrorMsg","");


Template.home.onCreated(function(){
  Session.set("canAddReceipe",false);
  Session.set("receipAddErrorMsg","");
});

Template.home.onRendered(function(){
    showLoadingmask();

  Meteor.call("canAddReceipe",function(err,res){
   //debugger;
   hideLoadingmask();
   if(err){
     FlashMessages.sendError(err.message);
   }else{
     if(res.canAddReceipe){
       Session.set("canAddReceipe",true);
     }else{
       Session.set("canAddReceipe",false);
       Session.set("receipAddErrorMsg",res.errorMesaage);
       FlashMessages.sendError(res.errorMesaage);
     }
   }
 });
});

Template.home.helpers({
  failedScrappedData : function(){
    let failedScrappedList = failedScrapped.find({
        "createdBy": Meteor.userId(),
        // isDeleted : false
    },{
      sort : {
        createdAt : -1
      }
    }).fetch();

    let hasFailedScrappedData = failedScrappedList.length> 0 ? true: false;

    if(Session.get("canAddReceipe") == false){
      hasFailedScrappedData = false;
    }
    let failedScrappedData = {
      failedScrappedList : failedScrappedList,
      hasFailedScrappedData : hasFailedScrappedData
    }

    return failedScrappedData;
  },
  raciepeList : function(){
    let recipeList = receipe.find({
        "createdBy": Meteor.userId(),
        "isDeleted" : false,
    }).fetch();

    if(Session.get("canAddReceipe") == false && Meteor.user()){
      let freetrialStartDate = Meteor.user().profile.freetrialStartDate;

      let freetrialendDate = new Date(moment(freetrialStartDate).add(2,'month'));
      recipeList = receipe.find({
          "createdBy": Meteor.userId(),
          "isDeleted" : false,
          "createdAt" : {
            $lt : freetrialendDate
          }
      }).fetch();
    }

    recipeList.forEach(function(objRec){
      objRec.ingredientsText = objRec.ingredient.length + " INGREDIENT";
      if(objRec.image && (objRec.image != "")){
        objRec.receipeImageUrl = Meteor.absoluteUrl() + "cfs/files/Images/" + objRec.image + "/receipeImage.jpg"
      }else{
        objRec.receipeImageUrl = '/images/inProgressReceipe.jpeg';
      }

      if((objRec.image == undefined) ||
        (objRec.image == '') ||
        (objRec.ingredient.length == 0) ||
        (objRec.instruction.length == 0)){
          objRec.styleClass= "inProgressReceipe"
        }else{
          objRec.styleClass= "completeReceipe"
        }
    });

    let failedScrappedList = failedScrapped.find({
        "createdBy": Meteor.userId(),
        // isDeleted : false
    },{
      sort : {
        createdAt : -1
      }
    }).fetch();

    let hasFailedScrappedData = failedScrappedList.length> 0 ? true: false;

    if(Session.get("canAddReceipe") == false){
      hasFailedScrappedData = false;
    }

    if(hasFailedScrappedData){
      failedScrappedList.forEach(function(objFailedScrap){
        recipeList.push({
          _id : objFailedScrap._id,
          styleClass : "failedScrapped",
          totalTime : "",
          name : "HTML Title",
          url : objFailedScrap.url,
          ingredientsText : objFailedScrap.url,
          receipeImageUrl : '/images/unimportable_recipe_image.png',
          createdAt : objFailedScrap.createdAt
        });
      });
    }

    //***************** Receipe sorting **************//
    recipeList.sort(function(a, b) {
        return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
    //***************** Receipe sorting **************//


    return recipeList;
  }
});

Template.home.events({
  "click #ceateRecipe":function(e, t){
    e.preventDefault();

    if(Session.get("canAddReceipe")){
        $('#createRecipe').modal('show');
    }else{
        FlashMessages.sendError(Session.get("receipAddErrorMsg"));
    }
  },
  "click #create_from_scratch":function(e, t){
    e.preventDefault();
    $('#createRecipe').modal('hide');
    setTimeout(function(){
      FlowRouter.go('create');
    },1000);

  },
  "click #menuButton": function(e ,t){
    e.preventDefault();

    FlowRouter.go('menu');
  },
  "click .recipe-box": function(e ,t){
    e.preventDefault();

    let receipe_id = this._id;
    let styleClass = $(e.currentTarget).children(".recipe-box-img").attr("class");
    if(styleClass.indexOf("inProgressReceipe") >= 0){
      FlowRouter.go('/edit/'+receipe_id);
    }else if(styleClass.indexOf("failedScrapped") >= 0){
      let url = $(e.currentTarget).children(".recipe-box-img").attr("data-url");
      window.open(url,'_blank');
      // location.href = url;
      // debugger;
      // $("."+receipe_id).click();
    }else{
      FlowRouter.go('/view/'+receipe_id);
    }
  },
  "click #import_from_web":function(e, t){
    $('#createRecipe').modal('hide');

    $("#importUrl").val('');
    $('#importReceipe').modal('show');
  },
  "click #btnImport":function(e, t){
    e.preventDefault();

    $('#importReceipe').modal('hide');
    showLoadingmask();

    let url = $("#importUrl").val();
    if(url == ""){
      FlashMessages.sendError("Please enter receipe url.");
      hideLoadingmask();
      return false;
    }

    Meteor.call("importReceipe", url , function(err,res){
      hideLoadingmask();
      if(err){
        FlashMessages.sendError(err.message);
      }else{
        if(res.errorCode){
          FlashMessages.sendError(res.errorMsg);
        }else{
          FlashMessages.sendSuccess("Receipe imported successfully.");
          setTimeout(function(){
            let receipe_id = res;

            FlowRouter.go('/edit/'+receipe_id);
          },1000);
        }

      }
    });
  },
  "click .import-fail-div":function(e, t){
    e.preventDefault();

    showLoadingmask();
    let url = this.url;

    Meteor.call("importReceipe", url, function(err,res){
      hideLoadingmask();
      if(err){
        FlashMessages.sendError(err.message);
      }else{
        if(res.errorCode){
          FlashMessages.sendError(res.errorMsg);
        }else{
          FlashMessages.sendSuccess("Receipe imported successfully.");
          setTimeout(function(){
            let receipe_id = res;

            FlowRouter.go('/edit/'+receipe_id);
          },1000);
        }
      }
    });
  },
});
