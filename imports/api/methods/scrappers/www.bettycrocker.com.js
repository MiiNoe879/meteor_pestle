
import {
    Meteor
} from 'meteor/meteor';

var Xray = Meteor.npmRequire('x-ray');
var x = Xray();
var scraperInterval = {};

var S = Npm.require('string');

Meteor.methods({
  scrapFrombettycrocker(url,bodyHtml){
    let receipeJSON = {};

    x(bodyHtml, ['.recipePartTitleText'])(Meteor.bindEnvironment(function(errName, resName) {
      receipeJSON.name = resName[0];
    }));

    x(bodyHtml, ['.full-desc'])(Meteor.bindEnvironment(function(errName, resName) {
      receipeJSON.description = resName[0];
    }));

    let ingredientQuantity = [];
    let ingredientDesc = [];

    x(bodyHtml, ['.recipePartIngredientGroup .quantity span' , '.recipePartIngredientGroup .description span'])(Meteor.bindEnvironment(function(errIngredient, resIngredient) {
      receipeJSON.ingredient = [];

      resIngredient.forEach(function(objIngredient){

        let ingWithoutWhiteSpace = S(objIngredient).collapseWhitespace().s;
        // var ingData = ing.parse(ingWithoutWhiteSpace);
        // //console.log('======= parsed : ',ingData);
        ingredientQuantity.push(ingWithoutWhiteSpace);
      })
    }));

    x(bodyHtml, ['.recipePartIngredientGroup .description span'])(Meteor.bindEnvironment(function(errIngredient, resIngredient) {
      receipeJSON.ingredient = [];

      resIngredient.forEach(function(objIngredient){

        let ingWithoutWhiteSpace = S(objIngredient).collapseWhitespace().s;
        // var ingData = ing.parse(ingWithoutWhiteSpace);
        // //console.log('======= parsed : ',ingData);
        ingredientDesc.push(ingWithoutWhiteSpace);
      })
    }));

    let indexForDesc = 0;
    ingredientQuantity.forEach(function(objIngQuantity , objIndex){
      let objIngDesc;
      while(!objIngDesc){
        if(ingredientDesc[indexForDesc]){
          objIngDesc = ingredientDesc[indexForDesc];
        }else {
          indexForDesc++;
        }
      }
      receipeJSON.ingredient.push(objIngQuantity + " " + objIngDesc);
      indexForDesc ++;

    });

    x(bodyHtml, ['#gmi_rp_primaryAttributes_total span'])(Meteor.bindEnvironment(function(errTime, resTime) {
      receipeJSON.totalTime = "";
      resTime.forEach(function(objTime,index){
        if(index > 0 && objTime){
          receipeJSON.totalTime += (objTime +" ");
        }
      });
    }));

    x(bodyHtml, ['.recipePartStepDescription'])(Meteor.bindEnvironment(function(errInstruction, resInstruction) {
      // receipeJSON.instruction = resInstruction;
      receipeJSON.instruction = [];

      resInstruction.forEach(function(objInstruction){
        let insWithoutWhiteSpace = S(objInstruction).collapseWhitespace().s;
        receipeJSON.instruction.push(insWithoutWhiteSpace);
      })
    }));


    x(bodyHtml, ['#gmi_rp_primaryAttributes_servings span'])(Meteor.bindEnvironment(function(errServing, resServing) {
      receipeJSON.serving = "";
      resServing.forEach(function(objServing,index){
        if(index > 0 && objServing){
          receipeJSON.serving += (objServing +" ");
        }
      });
    }));

    x(bodyHtml, ['.recipePartRecipeImage img@src'])(Meteor.bindEnvironment(function(errImage, resImage) {
      receipeJSON.image = resImage[0];
    }));
    
    console.log('receipeJSON ,',receipeJSON);
    return receipeJSON;
  }
});
