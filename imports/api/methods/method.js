import {
    Users
} from '/imports/api/collections/user';
import {
    upload
} from '/imports/api/collections/upload';

let Future = Npm.require('fibers/future');
let Fiber = Npm.require('fibers');

Meteor.methods({
    createUserServer(values) {
        let options = {
            email: values.email,
            password: values.password,
            profile : {
              name : values.name
            }
        };
        let resultForReg = Accounts.createUser(options);
        // Accounts.sendVerificationEmail(resultForReg);
        return resultForReg;
    },

    update_fBuserprofile(data) {
      let loggedInUser = Meteor.user();

      console.log('====loggedInUser : ',loggedInUser);
      let email = "";
      if(loggedInUser && loggedInUser.services){
        email = loggedInUser.services.facebook.email
      }

      let existingUserDataForEmail = Users.find({
        "emails.0.address" : email,
      });

      if(existingUserDataForEmail.fetch().length > 0){
        let existingUserDataForEmailFb = Users.find({
          "emails.0.address" : email,
          "services.facebook.email" : email
        });

        if(existingUserDataForEmailFb.length == 0){
          let deleteres = Users.remove({
            "emails.0.address" : Meteor.userId()
          });

          console.log('======> deleteres : ',deleteres);

          return {
            canProceed : false,
            errorMessage : "Sorry,User already exist with same email.Please try login with password."
          }
        }else{
          return {
            canProceed : true
          };
        }
      }else{
        let res = Users.update({
            _id: Meteor.userId()
        }, {
                $set: {
                    "emails" : [{
                      "address" : email,
                      "verified" : true
                    }],
                }
            });

        return {
          canProceed : true
        };
      }


    },

    uploadImage(base64EncodedImage,filename) {
      let future = new Future();
      let onComplete = future.resolver();
      let fsFile = new FS.File();
      fsFile.attachData(base64EncodedImage, function(error) {
        fsFile.name(filename);
        if (error) resolve(error, null);
        upload.insert(fsFile, function (err, fileObj) {
          onComplete(null, fileObj._id);
        });
      });
      return future.wait();
    },

    getBase64FromUrl(url){
      let future = new Future();
      var request = require('request').defaults({ encoding: null });
      let base64 = "";

      // console.log('url===',url);
      request.get(url, Meteor.bindEnvironment(function (error, response, body) {
          // console.log('====response',response);
          if (!error && response.statusCode == 200) {
              base64 = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
              Meteor.call("uploadImage",base64,"receipeImage.jpg",function(err,res){
                // console.log('========res : ',res);
                future.return(res);
              });
          }else{
            console.log('error=====',error);
          }
      }));

      return future.wait();
    },

    sendEmail(emailConfig) {
        Email.send({
            to: emailConfig.to,
            from: emailConfig.from,
            subject: emailConfig.subject,
            html: emailConfig.html
        });
    },


});

chechDataExistInArray = (value, array) => {
    let isExist = false;
    array.forEach(obj => {
        if (obj == value) {
            isExist = true;
            return false;
        }
    });
    return isExist;
}
