import { create } from './create.html';
import {
    receipe
} from '/imports/api/collections/receipe';
import {
    upload
} from '/imports/api/collections/upload';

Session.set("receipeImageId",'');
Session.set("ingredientList",[""]);
Session.set("stepList",[""]);
Session.set("linkedReceipeList",[]);
 
let stepIndexForInline = 0;

Template.create.onCreated(function(){
  Session.set("receipeImageId",'');
  Session.set("ingredientList",[""]);
  Session.set("stepList",[""]);
  Session.set("linkedReceipeList",[]);
 
});

Template.create.helpers({
  getStepNo(index){
    return (index + 1);
  },
  inHelper(index)  {
     return Session.get('ingredientList')[index];
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

  receipeImageData() {
    let receipeImageData = {
      imageUploaded : false,
      receipeImageId : Session.get("receipeImageId")
    };

    if(receipeImageData.receipeImageId != ""){
      receipeImageData.imageUploaded = true;
    }

    return receipeImageData;
  }, 
  add_my_special_behavior : function () {
  Meteor.defer(function (e) { 
    console.log(e);
        });
  // return nothing
} ,
  raciepeList : function(){
    let linkedReceipeListIds = Session.get("linkedReceipeList").map(function(objReceipe){
      return objReceipe._id
    });

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

Template.create.onRendered(function(){
  $('#createForm').parsley({
        trigger: 'blur'
    });
});

Template.create.events({
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
    receipeData.image = image;

    let name = $("#name").val();
    if(name == ""){
      FlashMessages.sendError("Please add receipe name.");
      return false;
    }
    receipeData.name = name;
    let description = $("#description").val();
    let serving = $("#serving").val();
      // FlashMessages.sendError("Please add serving.");
      // return false;    
      receipeData.serving = serving;
    let totalTime = $("#totalTime").val();
      receipeData.totalTime = totalTime;
    let ingredientList = Session.get("ingredientList");
    ingredientList.forEach(function(objIng,index){
      if(objIng == null || objIng == ""){
        ingredientList.splice(index,1);
      }
    });
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
    
    receipeData.instruction = stepList;

    let linkedReceipeList = Session.get("linkedReceipeList");
    let linkedReceipeListIds = Session.get("linkedReceipeList").map(function(objReceipe){
      return objReceipe._id
    });
    if(linkedReceipeList.length > 0){
      receipeData.linkedReceipes = linkedReceipeListIds;
    }

    Meteor.call("addReceipe", receipeData , function(err,res){
      if(err){
        FlashMessages.sendError(err.message);
      }else{
        FlashMessages.sendSuccess("Recipe added successfully.");
        let receipe_id = res;
        FlowRouter.go('/view/'+receipe_id);
      }
    });
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

  "change .ingredient_input"(e, t) {
    e.preventDefault();

    let index = parseInt($(e.currentTarget).attr("id").replace("ing_",""));
    let value = $(e.currentTarget).val();

    let ingredientList = Session.get("ingredientList");
    ingredientList[index] = value;

    Session.set("ingredientList",ingredientList);
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
          //range.insertNode(document.createTextNode("\u200C")\u200b \u00A0);
             var getprcd=getCharacterPrecedingCaret(document.getElementById("step_input_"+indexOfEdit));
            // console.log(getprcd.charCodeAt(0));
             //el.style.backgroundColor="#fafafa";
             el.setAttribute('data-class', "method");
             if(getprcd.charCodeAt(0)!=32)
             range.insertNode(document.createTextNode("\u200b") );
             range.insertNode(el);
            console.log(e);
            
            var range = document.createRange();
                range.selectNode(el);
                var getnxtc=getCharacterAfterCaret(document.getElementById("step_input_"+indexOfEdit));
               console.log(getnxtc.charCodeAt(0));
               if(getnxtc.charCodeAt(0)!=32)
                range.insertNode(document.createTextNode("\u200b") );

                
                range.collapse(false);
            var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                greyOut();
                
                e.preventDefault();
      }}},
    "focus .step_input"(e, t) {
          document.querySelector('.reciper_screen_footer').style.display = 'none';
    
      greyOut();
      let index = parseInt($(e.currentTarget).attr("id").replace("step_input_",""));
      document.getElementById('tags_'+index).style.display = 'inline-flex';
      let value = $(e.currentTarget).val();
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


      var getprcd=getCharacterPrecedingCaret(document.getElementById("step_input_"+indexOfEdit));
           
     var getnxtc=getCharacterAfterCaret(document.getElementById("step_input_"+indexOfEdit));
      console.log(getprcd);console.log(getnxtc);
      s = window.getSelection();
      setSelectionRange('step_input_0', 17, 17) 
    console.log(s);
     range = window.getSelection().getRangeAt(0);
    console.log(range);
     var el = document.getElementById("step_input_0");
    var range = window.getSelection().getRangeAt(0);
    console.log("Caret char pos after Up: " + getCharacterOffsetWithin(range, el))
      pos=getCharacterOffsetWithin(range, el);
      setSelectionRange('step_input_0', pos, pos) 
     if (e.which == 8) {
        console.log(s); 
        r = s.getRangeAt(0)
        el = r.startContainer.outerHTML
        console.log(r);
        // Check if the current element is the .label
        console.log(el);console.log((el.class));
        if ($('#'+el.startContainer.id).hasClass('ing-tag_0')) {
           console.log(el.classList);  // Check if we are exactly at the end of the .label element
            if (r.startOffset == r.endOffset && r.endOffset == el.textContent.length) {
                // prevent the default delete behavior
                e.preventDefault();
                if (el.classList.contains('highlight')) {
                    // remove the element
                    el.remove();
                } else {
                    el.classList.add('highlight');
                }
                return;
            }
        }
    }
    event.target.querySelectorAll('span.ing-tag_0.highlight').forEach(function(el) { el.classList.remove('highlight');})
  
     greyOut()

    },

    "keydown .step_input"(e, t) { 

      var getprcd=getCharacterPrecedingCaret(document.getElementById("step_input_"+indexOfEdit));
           
     var getnxtc=getCharacterAfterCaret(document.getElementById("step_input_"+indexOfEdit));
      console.log(getprcd);console.log(getnxtc);
      s = window.getSelection();
      setSelectionRange('step_input_0', 17, 17) 
    console.log(s);
     range = window.getSelection().getRangeAt(0);
    console.log(range);
     var el = document.getElementById("step_input_0");
    var range = window.getSelection().getRangeAt(0);
    console.log("Caret char pos: " + getCharacterOffsetWithin(range, el))
     if (e.which == 8) {
        console.log(s); 
        r = s.getRangeAt(0)
        el = r.startContainer.outerHTML
        console.log(r);
        // Check if the current element is the .label
        console.log(el);console.log((el.class));
        if ($('#'+el.startContainer.id).hasClass('ing-tag_0')) {
           console.log(el.classList);  // Check if we are exactly at the end of the .label element
            if (r.startOffset == r.endOffset && r.endOffset == el.textContent.length) {
                // prevent the default delete behavior
                e.preventDefault();
                if (el.classList.contains('highlight')) {
                    // remove the element
                    el.remove();
                } else {
                    el.classList.add('highlight');
                }
                return;
            }
        }
    }
    event.target.querySelectorAll('span.ing-tag_0.highlight').forEach(function(el) { el.classList.remove('highlight');})
  },
    "blur .ingredient_input"(e, t) {
    
    
   indexOfEdit =e.currentTarget.id.split('_')[1];
   let ingredientList = Session.get("ingredientList") ;
   let ing=ingredientList[indexOfEdit];
    
   document.querySelectorAll('.step_input > .ing-tag_'+indexOfEdit).forEach(e => e.innerHTML = ing );

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

  'click .recipe_finish_later'(e, t){
    e.preventDefault();

    let receipeData = {};
    // let image = Session.get("receipeImageId");
    // if(image == ""){
    //   FlashMessages.sendError("Please select receipe image.");
    //   return false;
    // }
    // receipeData.image = image;

    let name = $("#name").val();
    if(name == ""){
      FlashMessages.sendError("Please add recipe name.");
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
    }else{
      receipeData.serving = serving;
    }

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

    // if((ingredientList.length == 0) || (ingredientList.length == 1 && ingredientList[0] == "")){
    //   FlashMessages.sendError("Please add ingredients.");
    //   return false;
    // }
    receipeData.ingredient = ingredientList;

    let stepList = [];
    $(".step_input").each(function(index,obj){
      stepList.push($(obj).val());
    });
    // debugger;
    stepList.forEach(function(objStep,index){
      if(objStep == null || objStep == ""){
        stepList.splice(index,1);
      }
    });

    // if((stepList.length == 0) || (stepList.length == 1 && stepList[0] == "")){
    //   FlashMessages.sendError("Please add method steps.");
    //   return false;
    // }
    receipeData.instruction = stepList;

    let linkedReceipeList = Session.get("linkedReceipeList");
    let linkedReceipeListIds = Session.get("linkedReceipeList").map(function(objReceipe){
      return objReceipe._id
    });
    if(linkedReceipeList.length > 0){
      receipeData.linkedReceipes = linkedReceipeListIds;
    }

    Meteor.call("addReceipe", receipeData , function(err,res){
      if(err){
        FlashMessages.sendError(err.message);
      }else{
        let receipe_id = res;
        FlowRouter.go('/edit/'+receipe_id);
      }
    });
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


function captureSuccess(mediaFiles) {
    // var byteString = btoa(mediaFiles[0].fullPath.split(',')[1]);
    // var ab = new ArrayBuffer(byteString.length);
    // var ia = new Uint8Array(ab);
    // for (var i = 0; i < byteString.length; i++) {
    //     ia[i] = byteString.charCodeAt(i);
    // }
    // let fileUrl = new Blob([ab], { type: 'video/mp4' });
    // //debugger;
    FS.Utility.eachFile(event, function(mediaFiles) {
        var theFile = new FS.File(file);
        theFile.name("receipeImage.jpg");

        upload.insert(theFile, function(err, fileObj) {
            if (err) {
                alert(err.reason);
            } else {
                alert(fileObj._id);
            }
        });
    });
}

function captureError(error) {
    alert(JSON.stringify(error));

} 

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

function greyOut(){  

  var parentz = document.querySelectorAll('.step_input');
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
    //document.querySelectorAll('.selectable-tags > .'+allClass[i]).forEach(e => e.style.backgroundColor = '#fafafa' );
    document.querySelectorAll('.selectable-tags > .'+allClass[i]).forEach(e => e.setAttribute('data-class', "label") );
  }
  for (var i = flag.length-1; i >= 0; i--) {
      //  document.querySelectorAll('.selectable-tags > .'+flag[i]).forEach(e => e.style.backgroundColor = '#ffe6cc' );
       document.querySelectorAll('.selectable-tags > .'+flag[i]).forEach(e => e.setAttribute('data-class', "greyout") );

  }}
  function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  } else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}
 function getCharacterOffsetWithin(range, node) {
    var treeWalker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT,
        function(node) {
            var nodeRange = document.createRange();
            nodeRange.selectNodeContents(node);
            return nodeRange.compareBoundaryPoints(Range.END_TO_END, range) < 1 ?
                NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
        false
    );

    var charCount = 0;
    while (treeWalker.nextNode()) {
        charCount += treeWalker.currentNode.length;
    }
    if (range.startContainer.nodeType == 3) {
        charCount += range.startOffset;
    }
    return charCount;
}
 