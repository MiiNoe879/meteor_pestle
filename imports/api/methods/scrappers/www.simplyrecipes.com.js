
import {
    Meteor
} from 'meteor/meteor';

var Xray = Meteor.npmRequire('x-ray');
var x = Xray();
var scraperInterval = {};

var S = Npm.require('string');

Meteor.methods({
  scrapFromsimplyrecipes(url,bodyHtml){
    let receipeJSON = {};

    x(bodyHtml, ['.entry-header h1'])(Meteor.bindEnvironment(function(errName, resName) {
      receipeJSON.name = resName[0];
    }));

    x(bodyHtml, ['.meta-description-content'])(Meteor.bindEnvironment(function(errName, resName) {
      receipeJSON.description = resName[0];
    }));

    x(bodyHtml, ['.ingredient'])(Meteor.bindEnvironment(function(errIngredient, resIngredient) {
      receipeJSON.ingredient = [];

      resIngredient.forEach(function(objIngredient){

        let ingWithoutWhiteSpace = S(objIngredient).collapseWhitespace().s;
        // var ingData = ing.parse(ingWithoutWhiteSpace);
        // //console.log('======= parsed : ',ingData);
        receipeJSON.ingredient.push(ingWithoutWhiteSpace);
      })
    }));

    x(bodyHtml, ['.cooktime'])(Meteor.bindEnvironment(function(errTime, resTime) {
      if(resTime[0]){
        receipeJSON.totalTime = resTime[0];
      }
    }));


    x(bodyHtml, ['.instructions p'])(Meteor.bindEnvironment(function(errInstruction, resInstruction) {
      // receipeJSON.instruction = resInstruction;
      receipeJSON.instruction = [];

      resInstruction.forEach(function(objInstruction){
        let insWithoutWhiteSpace = S(objInstruction).collapseWhitespace().s;
        receipeJSON.instruction.push(insWithoutWhiteSpace);
      })
    }));

    x(bodyHtml, ['[itemprop="recipeYield"]'])(Meteor.bindEnvironment(function(errServing, resServing) {
      receipeJSON.serving = resServing[0];

      if(receipeJSON.serving){
        receipeJSON.serving = receipeJSON.serving.substring(0,receipeJSON.serving.indexOf(" servings"));
      }
    }));

    x(bodyHtml, ['.photo@src'])(Meteor.bindEnvironment(function(errImage, resImage) {
      //console.log('resImage=====> ,',resImage);
      receipeJSON.image = resImage[0];
    }));

    console.log('receipeJSON ,',receipeJSON);
    return receipeJSON;
  }
});
