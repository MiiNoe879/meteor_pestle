import { edit } from './edit.html';
import {
    receipe
} from '/imports/api/collections/receipe';

// Session.set("receipeImageId",'');
Session.set("receipeImageId",'');
Session.set("ingredientList",[""]);
Session.set("stepList",[""]);
Session.set("linkedReceipeList",[]);

let stepIndexForInline = 0;

Template.edit.onCreated(function(){
  // Session.set("receipeImageId",'');
  Session.set("receipeImageId",'');
  Session.set("ingredientList",[""]);
  Session.set("stepList",[""]);
  Session.set("linkedReceipeList",[]);
});

Template.edit.helpers({
  receipeDetail(){
    let receipe_id = FlowRouter.current().params.receipe_id;

    let receipeData = receipe.findOne({
      _id : receipe_id
    });
    console.log(receipeData);
    if(receipeData){
      let linkedReceipeList = [];
      if(receipeData.linkedReceipes && receipeData.linkedReceipes.length>0){
        linkedReceipeList = receipe.find({
          _id : {
            $in : receipeData.linkedReceipes
          }
        }).fetch();
      }

      Session.set("receipeImageId",receipeData.image);
      Session.set("ingredientList",receipeData.ingredient);
      Session.set("stepList",receipeData.instruction);
      Session.set("linkedReceipeList",linkedReceipeList);
    }

    return receipeData;
  },

  receipeImageData() {
    let receipeImageData = {
      imageUploaded : false,
      receipeImageId : Session.get("receipeImageId")
    };

    if(receipeImageData.receipeImageId && receipeImageData.receipeImageId != ""){
      receipeImageData.imageUploaded = true;
    }

    return receipeImageData;
  },
  getStepNo(index){
    return (index + 1);
  },

  ingredientList(){
    return Session.get("ingredientList");
  },

  stepList(){
    return Session.get("stepList");
  },

  linkedReceipeList(){
    return Session.get("linkedReceipeList");
  },

  receipeImageStyle() {
    let receipeImageStyle = "";
    let receipeImageId = Session.get("receipeImageId");

    let url = Meteor.absoluteUrl() + "/cfs/files/Images/" + receipeImageId + "/receipeImage.jpg";

    if(receipeImageId != ""){
      receipeImageStyle = "background: url(" + url +");background-size: cover;";
    }
    return receipeImageStyle;
  },

  raciepeList : function(){
    let linkedReceipeListIds = Session.get("linkedReceipeList").map(function(objReceipe){
      return objReceipe._id
    });

    let receipe_id = FlowRouter.current().params.receipe_id;

    linkedReceipeListIds.push(receipe_id);

    let recipeList = receipe.find({
        "_id" : {
          $nin : linkedReceipeListIds
        },
        "createdBy": Meteor.userId()
    }).fetch();

    let recipeListToRender = [];

    recipeList.forEach(function(objRec,index){
      if((objRec.image == undefined) ||
        (objRec.image == '') ||
        (objRec.ingredient.length == 0) ||
        (objRec.instruction.length == 0)){
          //recipeList.splice(index,1);
        }else{
          objRec.ingredientsText = objRec.ingredient.length + " INGREDIENTS"
          recipeListToRender.push(objRec);
        }
    });

    recipeListToRender.sort(function(a, b) {
        return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    return recipeListToRender;
  }
});

Template.edit.onRendered(function(){
  $('#createForm').parsley({
        trigger: 'blur'
    });
});

Template.edit.events({
  'click #back' (e, t) {
    e.preventDefault();
    FlowRouter.go('home');
  },
  'click .add_link_recipe'(e, t) {
    e.preventDefault();
    $('#linkedRecipe').modal('show');
  },
  'click #save'(e, t){
    e.preventDefault();
    let receipeData = {};

    let image = Session.get("receipeImageId");
    if(image == ""){
      FlashMessages.sendError("Please select receipe image.");
      return false;
    }
    receipeData.image = image;

    let name = $("#name").val();
    if(name == ""){
      FlashMessages.sendError("Please add receipe name.");
      return false;
    }
    receipeData.name = name;

    let description = $("#description").val();
    if(description != ""){
      receipeData.description = description;
    }

    let serving = $("#serving").val();
    if(serving == ""){
      // FlashMessages.sendError("Please add serving.");
      // return false;
    }
    receipeData.serving = serving;

    let totalTime = $("#totalTime").val();
    if(totalTime == ""){
      // FlashMessages.sendError("Please add active time.");
      // return false;
    }else{
      receipeData.totalTime = totalTime;
    }

    let ingredientList = Session.get("ingredientList");
    ingredientList.forEach(function(objIng,index){
      if(objIng == null || objIng == ""){
        ingredientList.splice(index,1);
      }
    });

    if((ingredientList.length == 0) || (ingredientList.length == 1 && ingredientList[0] == "")){
      FlashMessages.sendError("Please add ingredients.");
      return false;
    }
    receipeData.ingredient = ingredientList;

    let stepList = [];
    $(".step_input").each(function(index,obj){
      stepList.push(obj.innerHTML);
    });

    stepList.forEach(function(objStep,index){
      if(objStep == null || objStep == ""){
        stepList.splice(index,1);
      }
    });

    if((stepList.length == 0) || (stepList.length == 1 && stepList[0] == "")){
      FlashMessages.sendError("Please add method steps.");
      return false;
    }
    receipeData.instruction = stepList;

    let linkedReceipeList = Session.get("linkedReceipeList");
    let linkedReceipeListIds = Session.get("linkedReceipeList").map(function(objReceipe){
      return objReceipe._id
    });
    if(linkedReceipeList.length > 0){
      receipeData.linkedReceipes = linkedReceipeListIds;
    }

    let receipe_id = FlowRouter.current().params.receipe_id;

    Meteor.call("editReceipe", receipeData , receipe_id, function(err,res){
      if(err){
        FlashMessages.sendError(err.message);
      }else{
        FlashMessages.sendSuccess("Recipe updated successfully.");
        let receipe_id = FlowRouter.current().params.receipe_id;

        FlowRouter.go('/view/'+receipe_id);
      }
    });
  },

  "click .add_ingredient"(e, t) {
    e.preventDefault();

    let ingredientList = Session.get("ingredientList");
    ingredientList.push("");

    Session.set("ingredientList",ingredientList);
  },

  "click .delete-ing-btn"(e, t) {
    e.preventDefault();

    let index = parseInt($(e.currentTarget).closest(".ingredients-div").attr("id").replace("ing_parent_",""));

    let ingredientList = Session.get("ingredientList");
    ingredientList.splice(index,1);
    document.querySelectorAll('.step_input > .ing-tag_'+index).forEach(e => e.innerHTML = "Missing " );
    
    var re = /ing-tag_(\d+)/;
    
    var spans = document.querySelectorAll('.step_input > span[class*=ing-tag_]');
    
    for (const span of spans) {
    // Use replace with a callback to get the captured index number
    span.className = span.className.replace(re, function(m, g1) {
      if (+g1 < index) { // Below the index, don't change anything
        return m;
      }
      if (+g1 === index) { // Equal index, add "missing"
        return "ing-tag_missing";
      }
      return "ing-tag_" + (+g1 - 1); // Above the index, decrement
    });
  }
 
    Session.set("ingredientList",ingredientList);
  },

  'click .cameraDiv'(e, t){
    e.preventDefault();

    if(isWeb()){
      $(".receipeImage").click();
    }
    else{
      $('#chooseCameraGallery').modal('show');
    }
  },

  'click .photoGallary'(e, t){
    e.preventDefault();

    $('#chooseCameraGallery').modal('hide');

    // alert("mobile");
    // var options = { limit: 1 };
    // navigator.device.capture.captureImage(captureSuccess, captureError, options);
    navigator.camera.getPicture(function onSuccess(imageData) {
      let base64Data = "data:image/jpg;base64," + imageData;
      uploadBase64(base64Data);
    }, function onError(err) {
        hideLoadingmask();
        FlashMessages.sendError("Sorry,something went wrong.");
    }, {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        encodingType: Camera.EncodingType.JPG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true
    });
  },

  'click .camera'(e, t){
    e.preventDefault();

    $('#chooseCameraGallery').modal('hide');

    // alert("mobile");
    // var options = { limit: 1 };
    // navigator.device.capture.captureImage(captureSuccess, captureError, options);
    navigator.camera.getPicture(function onSuccess(imageData) {
      let base64Data = "data:image/jpg;base64," + imageData;
      uploadBase64(base64Data);
    }, function onError(err) {
        hideLoadingmask();
        FlashMessages.sendError(err);
    }, {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true
    });
  },

  'change .receipeImage'(e, t){
    e.preventDefault();

    showLoadingmask();

    let tempFile = e.currentTarget.files;

    convertToBase64('receipeImage',function(base64){
      uploadBase64(base64);
    });
  },

  "change .ingredient_input"(e, t) {
    e.preventDefault();

    let index = parseInt($(e.currentTarget).attr("id").replace("ing_",""));
    let value = $(e.currentTarget).val();

    let ingredientList = Session.get("ingredientList");
    ingredientList[index] = value;

    Session.set("ingredientList",ingredientList);
  },
  "blur .ingredient_input"(e, t) {
    
    
   indexOfEdit =e.currentTarget.id.split('_')[1];
   let ingredientList = Session.get("ingredientList") ;
   let ing=ingredientList[indexOfEdit];
    
   document.querySelectorAll('.step_input > .ing-tag_'+indexOfEdit).forEach(e => e.innerHTML = ing );

   },
  "click .Add-another-step"(e, t) {
    e.preventDefault();

    let stepList = Session.get("stepList");
    stepList.push("");

    Session.set("stepList",stepList);
  },

  "click .delete-step-btn"(e, t) {
    e.preventDefault();

    let index = parseInt($(e.currentTarget).closest(".step-div").attr("id").replace("step_",""));

    let stepList = Session.get("stepList");
    stepList.splice(index,1);

    Session.set("stepList",stepList);
  },
   "mousedown .selectable-tags "(e, t) {
         indexOfEdit =e.currentTarget.id.split('_')[1];
         range = window.getSelection().getRangeAt(0);

         var el = e.target.cloneNode(true);
         var ele = document.createElement('div');
             ele.innerHTML = el;
         var html = ele.innerHTML;
 
          
         el.setAttribute('contenteditable', false);
         
         if (html=='[object HTMLSpanElement]') {
           //range.insertNode(foo);
          if(range.commonAncestorContainer.parentElement.id  == "step_input_"+indexOfEdit || range.commonAncestorContainer.id  == "step_input_"+indexOfEdit)
          {
          //range.insertNode(document.createTextNode("\u200C") );
             var getprcd=getCharacterPrecedingCaret(document.getElementById("step_input_"+indexOfEdit));
             console.log(getprcd.charCodeAt(0));
               el.setAttribute('data-class', "method");

             if(getprcd.charCodeAt(0)!=32)
             range.insertNode(document.createTextNode("\u00A0") );
             range.insertNode(el);
            console.log(e);
            
            var range = document.createRange();
                range.selectNode(el);
                var getnxtc=getCharacterAfterCaret(document.getElementById("step_input_"+indexOfEdit));
               console.log(getnxtc.charCodeAt(0));
               if(getnxtc.charCodeAt(0)!=32)
                range.insertNode(document.createTextNode("\u00A0") );

                
                range.collapse(false);
            var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                greyOut();
                
                e.preventDefault();
      }}},
  // "change .step_input"(e, t) {
  //   e.preventDefault();
  //
  //   let index = parseInt($(e.currentTarget).attr("id").replace("step_input_",""));
  //   let value = $(e.currentTarget).val();
  //   let stepList = Session.get("stepList");
  //   stepList[index] = value;
  //
  //   Session.set("stepList",stepList);
  // },
   "focus .step_input"(e, t) {
    console.log(e);
      greyOut();
        document.querySelector('.reciper_screen_footer').style.display = 'none';
      
      let index = parseInt($(e.currentTarget).attr("id").replace("step_input_",""));
      document.getElementById('tags_'+index).style.display = 'inline-flex';
      let value =  e.currentTarget.innerHTML;
      let ingredientList = Session.get("ingredientList");
      let stepList = Session.get("stepList");  
          stepList[index] = value;
   
      Session.set("stepList",stepList);
       
   },
 
    "blur .step_input"(e, t) {
     let index = parseInt($(e.currentTarget).attr("id").replace("step_input_",""));
        document.getElementById('tags_'+index).style.display = 'none';
        document.querySelector('.reciper_screen_footer').style.display = 'block';
      
    },

   "keyup .step_input"(e, t) { 
     greyOut()
    },
  "keypress .step_input"(e, t) {
   // e.preventDefault();

   /* // let index = parseInt($(e.currentTarget).attr("id").replace("step_input_",""));
    let pressdKey = String.fromCharCode(e.keyCode);
    let ingredientList = Session.get("ingredientList");

    if((pressdKey == ("@")) && ((ingredientList.length > 0) && (ingredientList[0].length > 0))){
      stepIndexForInline = $(e.currentTarget).attr("data-index");
      $(".stepListLastChangedForA").removeClass("stepListLastChangedForA");
      $(e.currentTarget).addClass("stepListLastChangedForA");
      $('#receipeInlineModal').modal('show');
    }else{
      $(e.currentTarget).val($(e.currentTarget).val() + pressdKey);

      // let stepList = Session.get("stepList");
      // stepList[index] = stepList[index] + pressdKey;
      // Session.set("stepList",stepList);
    }

    $(e.currentTarget).focus();*/

  },

  "click .delete-link-recp-btn"(e, t) {
    e.preventDefault();

    let index = parseInt($(e.currentTarget).closest(".recipes-link-div").attr("id").replace("recipes-link_",""));

    let linkedReceipeList = Session.get("linkedReceipeList");
    linkedReceipeList.splice(index,1);

    Session.set("linkedReceipeList",linkedReceipeList);
  },

  "click .recipe-link-box-img"(e, t) {
    e.preventDefault();

    // let receipeId = $(e.currentTarget).closest(".recipe-link-box").attr("id").replace("recipe-link_","");

    let linkedReceipeList = Session.get("linkedReceipeList");
    linkedReceipeList.push(this);

    Session.set("linkedReceipeList",linkedReceipeList);
    $('#linkedRecipe').modal('hide');

  },
  "click .ingredient-inline"(e,t){
    e.preventDefault();

    let ingredientClickedValue = $(e.currentTarget).html();
    $("#receipeInlineModal").modal("hide");

    let temp  = $(".stepListLastChangedForA").val() + " " + ingredientClickedValue;
    $(".stepListLastChangedForA").val(temp);
    $(".stepListLastChangedForA").focus();

    $(".stepListLastChangedForA").removeClass("stepListLastChangedForA")
  }

});

function getCharacterAfterCaret(containerEl) {
    var precedingChar = "", sel, range, precedingRange;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount > 0) {
            range = sel.getRangeAt(0).cloneRange();
            range.collapse(false);
            range.setEnd(containerEl, containerEl.childNodes.length);
            precedingChar = range.toString().charAt(0);
        }
    } else if ( (sel = document.selection) && sel.type != "Control") {
        range = sel.createRange();
        precedingRange = range.duplicate();
        precedingRange.moveToElementText(containerEl);
        precedingRange.setEndPoint("EndToStart", range);
        precedingChar = precedingRange.text.slice(-1);
    }
    return precedingChar;
}
function getCharacterPrecedingCaret(containerEl) {
    var precedingChar = "", sel, range, precedingRange;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount > 0) {
            range = sel.getRangeAt(0).cloneRange();
            range.collapse(true);
            range.setStart(containerEl, 0);
            precedingChar = range.toString().slice(-1);
        }
    } else if ( (sel = document.selection) && sel.type != "Control") {
        range = sel.createRange();
        precedingRange = range.duplicate();
        precedingRange.moveToElementText(containerEl);
        precedingRange.setEndPoint("EndToStart", range);
        precedingChar = precedingRange.text.slice(-1);
    }
    return precedingChar;
}

function greyOut(){  var parentz = document.querySelectorAll('.step_input');
  var flag=[];
  var allClass=[];
  for(i=0;i<document.querySelectorAll('#tags_0 > span').length;i++){ 
      tagclassName='ing-tag_'+i; 
      allClass.push(tagclassName)  ;
      for(k=0;k<parentz.length;k++){
          if(parentz[k].querySelector("."+tagclassName) !== null) { 
            flag.push(tagclassName)  ;
          }
      }
  }console.log(allClass);console.log(flag);
  for (var i = allClass.length-1 ; i >= 0; i--) {
   document.querySelectorAll('.selectable-tags > .'+allClass[i]).forEach(e => e.setAttribute('data-class', "label") );
   }
  for (var i = flag.length-1; i >= 0; i--) {
       document.querySelectorAll('.selectable-tags > .'+flag[i]).forEach(e => e.setAttribute('data-class', "greyout") );

  }}