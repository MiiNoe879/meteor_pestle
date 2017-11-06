
// get current User
Template.registerHelper('currentUser', () => {
    if (Meteor.userId())
        return Meteor.user();
    else
        return '';
});


this.getBase64Image = (img) => {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  var dataURL = canvas.toDataURL("image/png");
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

this.convertToBase64 = (id,callback) => {
      //Read File
      var selectedFile = document.getElementById(id).files;
      //Check File is not Empty
      if (selectedFile.length > 0) {
         // Select the very first file from list
         var fileToLoad = selectedFile[0];
         // FileReader function for read the file.
        var fileReader = new FileReader();
         var base64;
         // Onload of file read the file content
          fileReader.onload = function(fileLoadedEvent) {
            base64 = fileLoadedEvent.target.result;
              // Print data in console
             callback(base64);
          };
          // Convert data to base64
          fileReader.readAsDataURL(fileToLoad);
      }
  }

this.showLoadingmask = () => {
  $(".loaderParent").css("display","block");
};

this.hideLoadingmask = () => {
  $(".loaderParent").css("display","none");
};

this.loginWithFacebook = () => {
  showLoadingmask();
  Meteor.loginWithFacebook({requestPermissions: ['public_profile', 'email']}, function (err,res) {
      if (err) {
        //debugger;
        alert("err : ",JSON.stringify(error))
        hideLoadingmask();
      //  FlashMessages.sendError("Sorry something went wrong while facbook login.");
      }
      else {
          setTimeout(function () {
              //
              Meteor.call('update_fBuserprofile', function (err, result) {
                hideLoadingmask();
                if(err){

                }else{
                  if(result.isUserExistWithSameEmail){
                    Meteor.logout();
                    FlashMessages.sendError(result.errorMessage);
                  }else{
                    FlowRouter.go('home');
                  }
                }
              });
          }, 1000);
      }
  });
};

this.uploadBase64 = (base64) => {
  showLoadingmask();

  Meteor.call("uploadImage",base64,"receipeImage.jpg",function(err,res){
    if(err){
      hideLoadingmask();
      FlashMessages.sendError("Sorry,Something went wrong.Please try again latter.");
    }else{
      console.log("=========receipeImageId =====>",res);
      setTimeout(function(){
        hideLoadingmask();
        Session.set("receipeImageId",res);
      },5000);
    }
  });
};

Template.registerHelper('isWeb', () => {
  var isiDevice = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());
  var isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
  var isWindowsPhone = /windows phone/i.test(navigator.userAgent.toLowerCase());
  if (isiDevice || isAndroid || isWindowsPhone)
    return false;
  else
    return true;

});


this.isWeb = () => {
  var isiDevice = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());
  var isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
  var isWindowsPhone = /windows phone/i.test(navigator.userAgent.toLowerCase());
  if (isiDevice || isAndroid || isWindowsPhone)
    return false;
  else
    return true;
}

this.loginUser = (email, password,callback) => {
  showLoadingmask();
    Meteor.loginWithPassword(email, password, error => {
      hideLoadingmask();
        if (error) {
          FlashMessages.sendError(error.message);
        } else {
          // FlashMessages.sendSuccess("User logged in successfully.");
          FlowRouter.go('home');
        }
    });
}

window.ParsleyConfig = {
    errorTemplate: '<span></span>',
    errorsWrapper: '<span></span>',
    errorClass: 'has-error',
    successClass: '',
    trigger: 'blur',
    errorsContainer(pEle) {
        const $err = pEle.$element.siblings('.error-text');
        return $err;
    },
    classHandler(el) {
        return el.$element.parent();
    }
};

Handlebars.registerHelper('loadFormValidationMessage', () => {
    Meteor.defer(() => {
        for (let i = 0; i < validationJSON.length; i++) {
            const items = $(validationJSON[i].selector);
            for (let j = 0; j < validationJSON[i].attributes.length; j++) {
                items.attr(validationJSON[i].attributes[j].name, validationJSON[i].attributes[j].value);
            }
        }
    });
    return "";
});
