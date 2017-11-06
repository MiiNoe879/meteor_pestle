
import {
    Meteor
} from 'meteor/meteor';

var Xray = Meteor.npmRequire('x-ray');
var x = Xray();
var scraperInterval = {};

var S = Npm.require('string');

Meteor.methods({
  scrapFromtaste(url,bodyHtml){
    let receipeJSON = {};

    x(bodyHtml, ['.page-main-content h1'])(Meteor.bindEnvironment(function(errName, resName) {
      receipeJSON.name = resName[0];
    }));

    x(bodyHtml, ['.single-asset-description-block p'])(Meteor.bindEnvironment(function(errName, resName) {
      receipeJSON.description = resName[0];
    }));

    x(bodyHtml, ['.ingredient-description'])(Meteor.bindEnvironment(function(errIngredient, resIngredient) {
      receipeJSON.ingredient = [];

      resIngredient.forEach(function(objIngredient){

        let ingWithoutWhiteSpace = S(objIngredient).collapseWhitespace().s;
        // var ingData = ing.parse(ingWithoutWhiteSpace);
        // //console.log('======= parsed : ',ingData);
        receipeJSON.ingredient.push(ingWithoutWhiteSpace);
      })
    }));

    x(bodyHtml, ['.recipe-cooking-infos li'])(Meteor.bindEnvironment(function(errTime, resTime) {
      if(resTime[1]){
        receipeJSON.totalTime = S(resTime[1]).collapseWhitespace().s;
      }
    }));


    x(bodyHtml, ['.recipe-method-step-content'])(Meteor.bindEnvironment(function(errInstruction, resInstruction) {
      // receipeJSON.instruction = resInstruction;
      receipeJSON.instruction = [];

      resInstruction.forEach(function(objInstruction){
        let insWithoutWhiteSpace = S(objInstruction).collapseWhitespace().s;
        receipeJSON.instruction.push(insWithoutWhiteSpace);
      })
    }));

    x(bodyHtml, ['.recipe-cooking-infos li'])(Meteor.bindEnvironment(function(errServing, resServing) {
      if(resServing[2]){
        receipeJSON.serving = S(resServing[2]).collapseWhitespace().s;
        receipeJSON.serving = receipeJSON.serving.replace("Makes ","")
                                                  .replace(" Servings","");
      }
    }));

    x(bodyHtml, ['.lead-image-block img@src'])(Meteor.bindEnvironment(function(errImage, resImage) {
      //console.log('resImage=====> ,',resImage);
      if(resImage[0]){
        receipeJSON.image =  resImage[0];
      }
    }));

    console.log('receipeJSON ,',receipeJSON);
    return receipeJSON;
  }
});
