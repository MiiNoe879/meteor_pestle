import {
    Meteor
} from 'meteor/meteor';
import {
    receipe
} from '/imports/api/collections/receipe';
import {
    scrapped
} from '/imports/api/collections/scrapped';
import {
    failedScrapped
} from '/imports/api/collections/failedScrapped';

import wordsToNumbers from 'words-to-numbers';

var Future = Npm.require('fibers/future');
var Fiber = Npm.require('fibers');
var Xray = Meteor.npmRequire('x-ray');
var x = Xray();
var scraperInterval = {};

var S = Npm.require('string');
var ing = require('ingredientparser');


Meteor.methods({
  canAddReceipe : function(){
    var futureCallBack = new Future();

    let userData = Meteor.user();

    if(userData && userData.profile && userData.profile.isFreeTrialStarted){
      let freetrialStartDate = userData.profile.freetrialStartDate;

      let freetrialendDate = new Date(moment(freetrialStartDate).add(2,'month'));

      if((new Date().getTime()) > freetrialendDate.getTime()){
        let isSubscribed = userData.profile.isSubscribed;

        let isSubscriptionActive = false;

        if(isSubscribed){
          Meteor.call("checkIsSubscriptionActive",function(err,res){
            if(err){
              futureCallBack.return({
                canAddReceipe : false,
                errorMesaage : err.message
              });
            }else{
              if(res.isSubscriptionActive){
                futureCallBack.return({
                  canAddReceipe : true
                });
              }else{
                futureCallBack.return({
                  canAddReceipe : false,
                  errorMesaage : "Subscription failed.Please subscribe again."
                });
              }
            }
          });
        }else{
          futureCallBack.return({
            canAddReceipe : false,
            errorMesaage : "Your trial period is finished.Please subscribe first."
          });
        }
      }else{
        futureCallBack.return({
          canAddReceipe : true
        });
      }
    }else{
      futureCallBack.return({
        canAddReceipe : true
      });
    }

    return futureCallBack.wait();
  },

  addReceipe : function(data){
    let res = receipe.insert(data);
    return res;
  },

  editReceipe : function(data,receipeId){
    let res = receipe.update({
      _id : receipeId
    },{
      $set : data
    });
    return res;
  },

  importReceipe: function(url){
    var futureCallBack = new Future();

    let scrappedReceipeData = scrapped.findOne({
      url : url
    });

    if(scrappedReceipeData){
      let dataToInsert = {
        url : scrappedReceipeData.url,
        name : scrappedReceipeData.name,
        image :scrappedReceipeData.image,
        ingredient : scrappedReceipeData.ingredient,
        instruction : scrappedReceipeData.instruction,
        prepTime : scrappedReceipeData.prepTime,
        cookTime : scrappedReceipeData.cookTime,
        totalTime : scrappedReceipeData.totalTime,
        description : scrappedReceipeData.description,
        serving : scrappedReceipeData.serving,
      };

      let receipeInsertRes = receipe.insert(dataToInsert);

      futureCallBack.return(receipeInsertRes);
    }else{
      //========================= H-receipe=======================

      let receipeJSON = {};
      x(url, 'html',
        [
          {
            body : "body@html",
            hReceipeHtml : '.h-recipe@html',
          }
        ]
      )(Meteor.bindEnvironment(function(err, res) {
        if(res &&  res.length > 0){
          let hReceipeHtml = res[0].hReceipeHtml;

          if(hReceipeHtml){  //for h-receipe
            x(hReceipeHtml, ['.p-name'])(Meteor.bindEnvironment(function(errName, resName) {
              receipeJSON.name = resName[0];
            }));

            x(hReceipeHtml, ['.p-ingredient'])(Meteor.bindEnvironment(function(errIngredient, resIngredient) {
              receipeJSON.ingredient = [];

              resIngredient.forEach(function(objIngredient){

                let ingWithoutWhiteSpace = S(objIngredient).collapseWhitespace().s;
                //console.log('=======original : ',ingWithoutWhiteSpace);
                // var ingData = ing.parse(ingWithoutWhiteSpace);
                // //console.log('======= parsed : ',ingData);
                receipeJSON.ingredient.push(ingWithoutWhiteSpace);
              })
            }));

            x(hReceipeHtml, ['.dt-duration'])(Meteor.bindEnvironment(function(errTime, resTime) {
              receipeJSON.totalTime = resTime[0];
            }));

            x(hReceipeHtml, ['.e-instructions'])(Meteor.bindEnvironment(function(errInstruction, resInstruction) {
              // receipeJSON.instruction = resInstruction;
              receipeJSON.instruction = [];

              resInstruction.forEach(function(objInstruction){
                let insWithoutWhiteSpace = S(objInstruction).collapseWhitespace().s;
                receipeJSON.instruction.push(insWithoutWhiteSpace);
              })
            }));

            x(hReceipeHtml, ['.p-yield'])(Meteor.bindEnvironment(function(errServing, resServing) {
              receipeJSON.serving = resServing[0];

            //   if(resServing[0]){
            //     let servindWToN = WtoN.convert(resServing[0]);
            //     let getTheNum = servindWToN.match(/\d+/);
            //     if(getTheNum.length > 0){
            //       receipeJSON.serving = getTheNum;
            //     }
            //   }
            }));

            x(hReceipeHtml, ['.u-photo@src'])(Meteor.bindEnvironment(function(errImage, resImage) {
              receipeJSON.image = resImage[0];
            }));
          }else if(url.indexOf("http://www.foodnetwork.com/") >= 0 ){
            Meteor.call("scrapFromFoodNetwork",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Recipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });
          }else if(url.indexOf("http://www.food.com/") >= 0 ){
            Meteor.call("scrapFromFood",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Recipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });
            //****************** www.food.com/ start***********//

          }else if(url.indexOf("www.bettycrocker.com") >= 0 ){
            //****************** www.bettycrocker.com start***********//
            Meteor.call("scrapFrombettycrocker",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Receipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });

            //****************** www.bettycrocker.com end***********//
          }else if(url.indexOf("http://www.epicurious.com/") >= 0 ){
            //****************** http://www.epicurious.com/ start***********//
            Meteor.call("scrapFromepicurious",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Recipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });
            //****************** http://www.epicurious.com/ end***********//
          }else if(url.indexOf("http://www.thekitchn.com/") >= 0 ){
            //****************** http://www.thekitchn.com/ start***********//
            Meteor.call("scrapFromthekitchn",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Receipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });
            //****************** http://www.thekitchn.com/ end***********//
          }else if(url.indexOf("www.tasteofhome.com") >= 0 ){
            //****************** www.tasteofhome.com start***********//
            Meteor.call("scrapFromtasteofhome",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Recipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });

            //****************** www.tasteofhome.com end***********//
          }else if(url.indexOf("http://www.simplyrecipes.com/") >= 0 ){
            //****************** http://www.simplyrecipes.com/ start***********//
            Meteor.call("scrapFromsimplyrecipes",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Recipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });
            //****************** http://www.simplyrecipes.com/ end***********//
          }else if(url.indexOf("http://www.myrecipes.com/") >= 0 ){
            //****************** http://www.myrecipes.com/ start***********//
            Meteor.call("scrapFrommyrecipes",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Recipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });

            //****************** http://www.myrecipes.com/ end***********//
          }else if(url.indexOf("http://www.eatingwell.com/") >= 0 ){
            //****************** http://www.eatingwell.com/ start***********//
            Meteor.call("scrapFromeatingwell",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Recipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });

            //****************** http://www.eatingwell.com/ end***********//
          }else if(url.indexOf("www.delish.com") >= 0 ){
            //****************** www.delish.com start***********//
            Meteor.call("scrapFromdelish",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Recipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });
            //****************** www.delish.com end***********//
          }else if(url.indexOf("http://www.bonappetit.com/") >= 0 ){
            //****************** http://www.bonappetit.com/ start***********//
            Meteor.call("scrapFrombonappetit",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Recipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });
            //****************** http://www.bonappetit.com/ end***********//
          }else if(url.indexOf("http://www.foodandwine.com/") >= 0 ){
            //****************** http://www.foodandwine.com/ start***********//
            Meteor.call("scrapFromfoodandwine",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Receipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });
            //****************** http://www.foodandwine.com/ end***********//
          }else if(url.indexOf("http://www.jamieoliver.com/") >= 0 ){
            //****************** http://www.jamieoliver.com/ start***********//
            Meteor.call("scrapFromjamieoliver",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Recipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });
            //****************** http://www.jamieoliver.com/ end***********//
          }else if(url.indexOf("http://www.cookinglight.com/") >= 0 ){
            //****************** http://www.cookinglight.com/ start***********//
            Meteor.call("scrapFromcookinglight",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Recipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });

            //****************** http://www.cookinglight.com/ end***********//
          }else if(url.indexOf("http://www.taste.com.au/") >= 0 ){
            //****************** http://www.taste.com.au/ start***********//
            Meteor.call("scrapFromtaste",url,res[0].body,function(err,res){
              if(err){
                failedScrapped.insert({
                  url : url
                });
                futureCallBack.return({
                  errorCode : 1000,
                  errorMsg : "Recipe scrapping failed."
                });
              }else{
                Meteor.call("addResultToDb",url,res,function(err,res){
                  if(err){
                    futureCallBack.return(err);
                  }else{
                    futureCallBack.return(res);
                  }
                });
              }
            });
            //****************** http://www.taste.com.au/ end***********//
          }else{  //For schema.org
            let bodyHtml = res[0].body;

            x(bodyHtml, ["[itemprop='name']"])(Meteor.bindEnvironment(function(errItem, resItem) {
              receipeJSON.name = resItem[resItem.length - 1];
            }));

            x(bodyHtml, ["[itemprop='headline']"])(Meteor.bindEnvironment(function(errItem, resItem) {
              if(resItem.length > 0){
                receipeJSON.name = resItem[resItem.length - 1];
              }
            }));

            x(bodyHtml, ["[itemprop='ingredients']"])(Meteor.bindEnvironment(function(errIngredient, resIngredient) {
              receipeJSON.ingredient = [];

              resIngredient.forEach(function(objIngredient){

                let ingWithoutWhiteSpace = S(objIngredient).collapseWhitespace().s;
                //console.log('=======original : ',ingWithoutWhiteSpace);
                // var ingData = ing.parse(ingWithoutWhiteSpace);
                // //console.log('======= parsed : ',ingData);
                receipeJSON.ingredient.push(ingWithoutWhiteSpace);
              });
            }));

            x(bodyHtml, ["[itemprop='recipeYield']"])(Meteor.bindEnvironment(function(errServing, resServing) {
              receipeJSON.serving = resServing[0];

              // if(resServing[0]){
              //   //console.log('========resServing[0]',resServing[0]);
              //   // let servindWToN = WtoN.convert(resServing[0]);
              //   //console.log('servindWToN=======>>>>>>>',WtoN.convert("Serve one hundred"));
              //   let getTheNum = servindWToN.match(/\d+/);
              //   if(getTheNum.length > 0){
              //     receipeJSON.serving = getTheNum;
              //   }
              // }
            }));

            x(bodyHtml, ["[itemprop='recipeInstructions']"])(Meteor.bindEnvironment(function(errInstructiont, resInstruction) {
              // receipeJSON.instruction = resInstruction;

              receipeJSON.instruction = [];

              resInstruction.forEach(function(objInstruction){
                let insWithoutWhiteSpace = S(objInstruction).collapseWhitespace().s;
                //console.log('=======original : ',insWithoutWhiteSpace);
                receipeJSON.instruction.push(insWithoutWhiteSpace);

              })
            }));

            x(bodyHtml, ["[itemprop='prepTime']"])(Meteor.bindEnvironment(function(errTime, resTime) {
              receipeJSON.prepTime = resTime[0];
            }));

            x(bodyHtml, ["[itemprop='cookTime']"])(Meteor.bindEnvironment(function(errTime, resTime) {
              receipeJSON.cookTime = resTime[0];
            }));

            x(bodyHtml, ["[itemprop='description']"])(Meteor.bindEnvironment(function(errDescription, resDescription) {
              receipeJSON.description = resDescription[0];
            }));

            x(bodyHtml, ["[itemprop='image']@src"])(Meteor.bindEnvironment(function(errImage, resImage) {
              receipeJSON.image = resImage[0];
            }));
          }

          //console.log('receipeJSON',receipeJSON);
        }else{
          failedScrapped.insert({
            url : url
          });
          futureCallBack.return({
            errorCode : 1000,
            errorMsg : "Recipe scrapping failed."
          });
        }
      }));
      //========================= Schema.org=======================

    }

    return futureCallBack.wait();
  },

  addResultToDb(url,receipeJSON){
    let futureCallBack = new Future();

    if((receipeJSON.name) &&
        (receipeJSON.ingredient && receipeJSON.ingredient.length>0) &&
          (receipeJSON.instruction &&receipeJSON.instruction.length>0) &&
            (receipeJSON.image)){

              Meteor.call("getBase64FromUrl",receipeJSON.image,function(errImageId,resImageId){
                if(errImageId){
                  //console.log("====errImageId===>",errImageId);
                  failedScrapped.insert({
                    url : url
                  });

                  futureCallBack.return({
                    errorCode : 1000,
                    errorMsg : "Recipe scrapping failed."
                  });
                }else{
                  receipeJSON.image = resImageId;

                  // //console.log('');
                  let dataToInsert = {
                    url : url,
                    name : receipeJSON.name,
                    image :receipeJSON.image,
                    ingredient : receipeJSON.ingredient,
                    instruction : receipeJSON.instruction,
                    prepTime : receipeJSON.prepTime,
                    cookTime : receipeJSON.cookTime,
                    totalTime : receipeJSON.totalTime,
                    description : receipeJSON.description,
                    serving : receipeJSON.serving,
                  };

                  // //console.log('dataToInsert===',dataToInsert);

                  let scrappedReceipeDataNew = scrapped.insert(dataToInsert);

                  let receipeInsertRes = receipe.insert(dataToInsert);

                  futureCallBack.return(receipeInsertRes);
                }
              });
    }else{
      failedScrapped.insert({
        url : url
      });
      futureCallBack.return({
        errorCode : 1000,
        errorMsg : "Receipe scrapping failed."
      });
    }

    return futureCallBack.wait();
  },

  deleteReceipe(receipeId){
    let res = receipe.update({
      _id : receipeId
    },{
      $set : {
        isDeleted : true
      }
    });

    return res;
  },

  duplicateReceipe(receipeId){
    let resReceipe = receipe.findOne({
      _id : receipeId
    });

    let res = receipe.insert({
      isDuplicated : true,
      originalRecpId :receipeId,
      name : resReceipe.name,
      image : resReceipe.image,
      ingredient : resReceipe.ingredient,
      instruction : resReceipe.instruction,
      prepTime : resReceipe.prepTime,
      cookTime : resReceipe.cookTime,
      totalTime : resReceipe.totalTime,
      description : resReceipe.description,
      serving : resReceipe.serving,
      linkedReceipes : resReceipe.linkedReceipes
    });

    return res;
  }
});
