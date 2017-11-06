
import {
    Meteor
} from 'meteor/meteor';

var Xray = Meteor.npmRequire('x-ray');
var x = Xray();
var scraperInterval = {};

var S = Npm.require('string');

Meteor.methods({
  scrapFromepicurious(url,bodyHtml){
    let receipeJSON = {};

    x(bodyHtml, ['.title-source h1'])(Meteor.bindEnvironment(function(errName, resName) {
      receipeJSON.name = resName[0];
    }));

    x(bodyHtml, ['[itemprop="description"]'])(Meteor.bindEnvironment(function(errName, resName) {
      receipeJSON.description = resName[0];
    }));

    x(bodyHtml, ['.ingredients li'])(Meteor.bindEnvironment(function(errIngredient, resIngredient) {
      receipeJSON.ingredient = [];

      resIngredient.forEach(function(objIngredient){

        let ingWithoutWhiteSpace = S(objIngredient).collapseWhitespace().s;
        // var ingData = ing.parse(ingWithoutWhiteSpace);
        // //console.log('======= parsed : ',ingData);
        receipeJSON.ingredient.push(ingWithoutWhiteSpace);
      })
    }));

    x(bodyHtml, ['.total-time'])(Meteor.bindEnvironment(function(errTime, resTime) {
      if(resTime && resTime[1]){
        receipeJSON.totalTime = resTime[1];
      }
    }));


    x(bodyHtml, ['.preparation-steps li'])(Meteor.bindEnvironment(function(errInstruction, resInstruction) {
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
        receipeJSON.serving = receipeJSON.serving.replace("servings" , "")
      }
    }));

    x(bodyHtml, ['.photo@srcset'])(Meteor.bindEnvironment(function(errImage, resImage) {
      //console.log('resImage=====> ,',resImage);
      receipeJSON.image = "http:"+resImage[0];
    }));

    console.log('receipeJSON ,',receipeJSON);
    return receipeJSON;
  }
});
