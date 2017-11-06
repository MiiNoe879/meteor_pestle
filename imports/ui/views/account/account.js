import { account } from './account.html';

Session.set("isSubscriptionActive",false);
Template.account.onCreated(function(){
  showLoadingmask();
  Session.set("isSubscriptionActive",false);
});

Template.account.helpers({
  isSubscriptionActive(){
    return Session.get("isSubscriptionActive");
  },

  userData(){
    let userData = Meteor.user();

    if(userData){
      userData.email = userData.emails[0].address;
      return userData;
    }
  }
});


Template.account.onRendered(function(){

 //********************** Check subscription active or not ***********//
 showLoadingmask();
 Meteor.call("checkIsSubscriptionActive",function(err,res){
   hideLoadingmask();
   if(err){
     FlashMessages.sendError(err.message);
   }else{
     if(res.isSubscriptionActive){
       Session.set("isSubscriptionActive",true);
     }
   }
 });
 //******************************************************//
});

Template.account.helpers({
  helper: function(){

  }
});

Template.account.events({
  "click #back": function(e, t){
    e.preventDefault();
    FlowRouter.go('home');
  },
  "click #newPassword": function(e ,t){
    e.preventDefault();
    FlowRouter.go('changePassword');
  },
  "click .btn_enjoy_unlimited_rec": function(e, t){
    e.preventDefault();

    FlowRouter.go('home');
  },
  "click .btn_per_month": function(e, t){
    e.preventDefault();

    $('#createRecipe').modal('show');
  },

  "click .proceedToPayment" : function(e,t){
    e.preventDefault();

    showLoadingmask();

      let cardNumber = $("#cardNumber").val();
      let expiry_month = $("#expiry_month").val();
      let expiry_year = $("#expiry_year").val();

      let cvv = $("#cvv").val();

      let userData = Meteor.user();
      let data = {
        email : userData.emails[0].address,
        name : userData.profile.name,
        cardNumber : cardNumber,
        expiry_month : expiry_month,
        expiry_year : expiry_year,
        cvv : cvv
      };

      Meteor.call("getCustomerIdFromChargeBee",data,function(errCustomer,resCustomer){
        if(errCustomer){
          hideLoadingmask();

          console.log('=======errCustomer======>',errCustomer);
          FlashMessages.sendError(errCustomer.message);

          // FlashMessages.sendError("Sorry, something went wrong. Please try again later.");
        }else{
          if(resCustomer.error_code){
            hideLoadingmask();

            FlashMessages.sendError(resCustomer.message);
            return false;
          }
          let customer_id = resCustomer.customer_id;

          data.customer_id = customer_id;

          Meteor.call("createCardToChargeBee",data,function(errCreateCard,resCreateCard){
            if(errCreateCard){
              hideLoadingmask();

              console.log('=======errCreateCard======>',errCreateCard);
              FlashMessages.sendError(errCreateCard);

              // FlashMessages.sendError("Sorry, something went wrong. Please try again later.");
            }else{

              if(resCreateCard.error_code){
                hideLoadingmask();

                FlashMessages.sendError(resCreateCard.message);
                return false;
              }
              let payment_source_id = resCreateCard.payment_source_id;
              data.payment_source_id = payment_source_id;

              Meteor.call("createSubscription",data,function(errSubscription,resSubscription){
                if(errSubscription){
                  hideLoadingmask();

                  console.log('=======errSubscription======>',errSubscription);
                  FlashMessages.sendError(errSubscription.message);

                  // FlashMessages.sendError("Sorry, something went wrong. Please try again later.");
                }else{
                  if(resSubscription.error_code){
                    hideLoadingmask();

                    FlashMessages.sendError(resSubscription.message);
                    return false;
                  }
                  if(resSubscription.status == "active"){
                    hideLoadingmask();

                    FlashMessages.sendSuccess("Your subscription is activated successfully.");
                    Session.set("isSubscriptionActive",true);
                    $('#createRecipe').modal('hide');

                  }else{
                    hideLoadingmask();

                    FlashMessages.sendError("Sorry, something went wrong.Please try again.");

                  }
                }
              });
            }
          });
        }
      });
  },
  "click .btn_logout"(e,t){
    e.preventDefault();

    Meteor.logout(function(){
      FlowRouter.go("signIn");
    });
  },
  // "click .feedback_request"(e,t){
  //   e.preventDefault();

  //   $('#feedbackModal').modal('show');
  // },

  // "click .btnFeedback"(e,t){
  //   e.preventDefault();

  //   let feedbackText = $("#feedbackInput").val();

  //   if(feedbackText.length == 0){
  //     FlashMessages.sendError("Please enter feedback");
  //     return false;
  //   }

  //   showLoadingmask();

  //   let emailConfig = {
  //     to: "hi@pestleapp.com",
  //     from: Meteor.user().emails[0].address,
  //     subject: "Feedback for Pestle",
  //     html: "<body>"+feedbackText+"</body>"
  //   }

  //   Meteor.call("sendEmail",emailConfig,function(err,res){
  //     $('#feedbackModal').modal('hide');
  //     hideLoadingmask();

  //     if(err){
  //       FlashMessages.sendError(err.message);
  //     }else{
  //       FlashMessages.sendSuccess("Thank you for your feedback.");
  //     }
  //   });



  // }
});
