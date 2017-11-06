import {
    Meteor
} from 'meteor/meteor';

var Future = Npm.require('fibers/future');
var Fiber = Npm.require('fibers');
var Xray = Meteor.npmRequire('x-ray');
var x = Xray();
var scraperInterval = {};

var S = Npm.require('string');

Meteor.methods({
  scrapFromFoodNetwork(url,bodyHtml){
    let receipeJSON = {};
    
    //****************** www.foodnetwork.com start***********//
    x(bodyHtml, ['.o-AssetTitle__a-HeadlineText'])(Meteor.bindEnvironment(function(errName, resName) {
      receipeJSON.name = resName[0];
    }));

    x(bodyHtml, ['.o-AssetDescription__a-Description'])(Meteor.bindEnvironment(function(errName, resName) {
      receipeJSON.description = resName[0];
    }));

    x(bodyHtml, ['.o-Ingredients__a-ListItemText'])(Meteor.bindEnvironment(function(errIngredient, resIngredient) {
      receipeJSON.ingredient = [];

      resIngredient.forEach(function(objIngredient){

        let ingWithoutWhiteSpace = S(objIngredient).collapseWhitespace().s;
        // var ingData = ing.parse(ingWithoutWhiteSpace);
        // //console.log('======= parsed : ',ingData);
        receipeJSON.ingredient.push(ingWithoutWhiteSpace);
      })
    }));

    x(bodyHtml, ['.o-RecipeInfo__a-Description--Total'])(Meteor.bindEnvironment(function(errTime, resTime) {
      receipeJSON.totalTime = resTime[0];
    }));

    x(bodyHtml, ['.o-Method__m-Body p'])(Meteor.bindEnvironment(function(errInstruction, resInstruction) {
      // receipeJSON.instruction = resInstruction;
      receipeJSON.instruction = [];

      resInstruction.forEach(function(objInstruction){
        let insWithoutWhiteSpace = S(objInstruction).collapseWhitespace().s;
        receipeJSON.instruction.push(insWithoutWhiteSpace);
      })
    }));

    x(bodyHtml, ['.o-Yield .o-RecipeInfo__a-Description'])(Meteor.bindEnvironment(function(errServing, resServing) {
      receipeJSON.serving = resServing[0];
      if(receipeJSON.serving){
        receipeJSON.serving = receipeJSON.serving.replace("servings" , "")
      }
    }));

    x(bodyHtml, ['.o-AssetMultiMedia__a-Image@src'])(Meteor.bindEnvironment(function(errImage, resImage) {
      receipeJSON.image = resImage[0];
    }));
    //****************** www.foodnetwork.com end***********//

    return receipeJSON;
  }
});
