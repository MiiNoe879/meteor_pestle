
import {
    Meteor
} from 'meteor/meteor';

var Xray = Meteor.npmRequire('x-ray');
var x = Xray();
var scraperInterval = {};

var S = Npm.require('string');

Meteor.methods({
  scrapFromcookinglight(url,bodyHtml){
    let receipeJSON = {};

    x(bodyHtml, ['[itemprop="headline"]'])(Meteor.bindEnvironment(function(errName, resName) {
      receipeJSON.name = resName[0];
    }));

    x(bodyHtml, ['.expander-inner p'])(Meteor.bindEnvironment(function(errName, resName) {
      if(resName && resName[1]){
        receipeJSON.description = resName[1];
      }
    }));

    x(bodyHtml, ['[itemprop="recipeIngredient"]'])(Meteor.bindEnvironment(function(errIngredient, resIngredient) {
      receipeJSON.ingredient = [];

      resIngredient.forEach(function(objIngredient){

        let ingWithoutWhiteSpace = S(objIngredient).collapseWhitespace().s;
        // var ingData = ing.parse(ingWithoutWhiteSpace);
        // //console.log('======= parsed : ',ingData);
        receipeJSON.ingredient.push(ingWithoutWhiteSpace);
      })
    }));

    x(bodyHtml, ['.time'])(Meteor.bindEnvironment(function(errTime, resTime) {
      if(resTime[0]){
        receipeJSON.totalTime = S(resTime[0]).collapseWhitespace().s;
        receipeJSON.totalTime = receipeJSON.totalTime.replace("Cooks In", "");
      }
    }));


    x(bodyHtml, ['[itemprop="recipeInstructions"]'])(Meteor.bindEnvironment(function(errInstruction, resInstruction) {
      // receipeJSON.instruction = resInstruction;
      receipeJSON.instruction = [];

      resInstruction.forEach(function(objInstruction){
        let insWithoutWhiteSpace = S(objInstruction).collapseWhitespace().s;
        receipeJSON.instruction.push(insWithoutWhiteSpace);
      })
    }));

    x(bodyHtml, ['[itemprop="recipeYield"]'])(Meteor.bindEnvironment(function(errServing, resServing) {
      if(resServing[0]){
        receipeJSON.serving = S(resServing[0]).collapseWhitespace().s;
        if(receipeJSON.serving){
          receipeJSON.serving = receipeJSON.serving.replace("Serves ","");
        }
      }
    }));

    x(bodyHtml, ['[itemprop="image"] img@src'])(Meteor.bindEnvironment(function(errImage, resImage) {
      //console.log('resImage=====> ,',resImage);
      if(resImage[0]){
        receipeJSON.image =  resImage[0];
      }
    }));

    console.log('receipeJSON ,',receipeJSON);
    return receipeJSON;
  }
});
