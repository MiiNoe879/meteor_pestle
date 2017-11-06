
import {
    Meteor
} from 'meteor/meteor';

var Xray = Meteor.npmRequire('x-ray');
var x = Xray();
var scraperInterval = {};

var S = Npm.require('string');

Meteor.methods({
  scrapFromeatingwell(url,bodyHtml){
    let receipeJSON = {};

    x(bodyHtml, ['.recipeDetailSummaryDetails h3'])(Meteor.bindEnvironment(function(errName, resName) {
      receipeJSON.name = resName[0];
    }));

    x(bodyHtml, ['.recipeSubmitter p@title'])(Meteor.bindEnvironment(function(errName, resName) {
      receipeJSON.description = resName[0];
    }));

    x(bodyHtml, ['[itemprop="ingredients"]'])(Meteor.bindEnvironment(function(errIngredient, resIngredient) {
      receipeJSON.ingredient = [];

      resIngredient.forEach(function(objIngredient){

        let ingWithoutWhiteSpace = S(objIngredient).collapseWhitespace().s;
        // var ingData = ing.parse(ingWithoutWhiteSpace);
        // //console.log('======= parsed : ',ingData);
        receipeJSON.ingredient.push(ingWithoutWhiteSpace);
      })
    }));

    x(bodyHtml, ['[itemprop="totalTime"]'])(Meteor.bindEnvironment(function(errTime, resTime) {
      if(resTime[0]){
        receipeJSON.totalTime = S(resTime[0]).collapseWhitespace().s;
      }
    }));


    x(bodyHtml, ['.recipeDirectionsListItem'])(Meteor.bindEnvironment(function(errInstruction, resInstruction) {
      // receipeJSON.instruction = resInstruction;
      receipeJSON.instruction = [];

      resInstruction.forEach(function(objInstruction){
        let insWithoutWhiteSpace = S(objInstruction).collapseWhitespace().s;
        receipeJSON.instruction.push(insWithoutWhiteSpace);
      })
    }));

    x(bodyHtml, ['.servingsCount span'])(Meteor.bindEnvironment(function(errServing, resServing) {
      if(resServing[0]){
        receipeJSON.serving = S(resServing[0]).collapseWhitespace().s;
        if(receipeJSON.serving) {
          receipeJSON.serving = receipeJSON.serving.replace(" servings","");
        }
      }
    }));

    x(bodyHtml, ['.recipeDetailSummaryImageMain@src'])(Meteor.bindEnvironment(function(errImage, resImage) {
      //console.log('resImage=====> ,',resImage);
      receipeJSON.image = resImage[0];
    }));

    console.log('receipeJSON ,',receipeJSON);
    return receipeJSON;
  }
});
