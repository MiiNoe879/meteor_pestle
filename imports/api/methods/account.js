import {
    Meteor
} from 'meteor/meteor';
import wordsToNumbers from 'words-to-numbers';
import {
    Users
} from '/imports/api/collections/user';

var Future = Npm.require('fibers/future');
var Fiber = Npm.require('fibers');
var Xray = Meteor.npmRequire('x-ray');
var x = Xray();
var scraperInterval = {};

var S = Npm.require('string');
var ing = require('ingredientparser');
var chargebee = require('chargebee');

chargebee.configure({
  site : "pestle-test",
  api_key : "test_C85sa0twUnOOGcduhp7c2VGD3jcniyfdL"
});

Meteor.methods({
  checkIsSubscriptionActive(){
    let userId = Meteor.userId();
    let userData = Users.findOne({
      _id : userId
    });
    let email = userData.emails[0].address;

    var futureCallBack = new Future();

    if(userData.profile && userData.profile.isSubscribed){
      let subscriptionId = userData.profile.subscriptionData.subscriptionId;
      chargebee.subscription.list({
        "id[is]" :subscriptionId,
        "plan_id[is]" : Meteor.settings.chargebee.plan_id,
        "status[is]" : "active",
        "sort_by[asc]" : "created_at",
        "limit" : 1
      }).request(Meteor.bindEnvironment(function(error,result){
        if(error){
          //handle error
          console.log(error);
        }else{
          if(result.list.length > 0){
            futureCallBack.return({
              isSubscriptionActive : true,
            });
          }else{
            futureCallBack.return({
              isSubscriptionActive : false,
            });
          }
        }
      }));
    }else{
      console.log('email======',email);

      chargebee.customer.list({
        "email[is]" : email,
      }).request(Meteor.bindEnvironment(function(error,resultCustomer){
        if(error){
          //handle error
          console.log(error);
        }else{
          let customer_id;

          console.log("resultCustomer.list.length ====",resultCustomer.list.length);

          if(resultCustomer.list.length > 0){
            let customer_id = resultCustomer.list[0].customer.id;

            chargebee.subscription.list({
              "customer_id[is]" : customer_id,
              "plan_id[is]" : Meteor.settings.chargebee.plan_id,
              "status[is]" : "active",
              "sort_by[asc]" : "created_at",
              "limit" : 1
            }).request(Meteor.bindEnvironment(function(error,result){
              if(error){
                //handle error
                console.log(error);
              }else{
                if(result.list.length > 0){
                  futureCallBack.return({
                    isSubscriptionActive : true,
                  });
                }else{
                  futureCallBack.return({
                    isSubscriptionActive : false,
                  });
                }
              }
            }));
          }else{
            futureCallBack.return({
              isSubscriptionActive : false,
            });
          }
        }
      }));

    }
    return futureCallBack.wait();
  },

  getCustomerIdFromChargeBee(data) {
    var futureCallBack = new Future();

    chargebee.customer.list({
      "email[is]" : data.email,
      limit : 1
    }).request(Meteor.bindEnvironment(function(error,result){
      if(error){
        //handle error
        console.log("=========error customer list========>",error);

        futureCallBack.return(error);
      }else{
        let customer_id;

        if(result.list.length > 0){
          let customer_id = result.list[0].customer.id;

          futureCallBack.return({
            customer_id : customer_id
          });
        }else{
          chargebee.customer.create({
            first_name :  data.name,
            // last_name : data.lastName,
            email : data.email,
          }).request(Meteor.bindEnvironment(function(error,result){
            if(error){
              //handle error
              console.log("=========error customer create========>",error);

              futureCallBack.return(error);
            }else{
              customer_id = result.customer.id;

              futureCallBack.return({
                customer_id : customer_id
              });
            }
          }));
        }
      }
    }));

    return futureCallBack.wait();
  },

  createCardToChargeBee(data) {
    var futureCallBack = new Future();

    chargebee.payment_source.create_card({
      customer_id : data.customer_id,
      card : {
        number : data.cardNumber,
        expiry_month : data.expiry_month,
        expiry_year : data.expiry_year,
        cvv : data.cvv
      }
    }).request(Meteor.bindEnvironment(function(error,result){
      if(error){
        //handle error
        console.log("======== create card error chargebee ===",error);

        futureCallBack.return(error);
      }else{
        var payment_source_id = result.payment_source.id;

        futureCallBack.return({
          payment_source_id : payment_source_id
        });
      }
    }));

    return futureCallBack.wait();
  },

  createSubscription(data){
    let futureCallBack = new Future();

    chargebee.subscription.create_for_customer(data.customer_id,{
        plan_id : Meteor.settings.chargebee.plan_id,
        start_date : new Date(),
        billing_cycles : Meteor.settings.chargebee.billing_cycles,
        auto_collection : "on",
        // billing_alignment_mode : "immediate",
        payment_source_id : data.payment_source_id
      }).request(Meteor.bindEnvironment(function(error,result){
        if(error){
          //handle error
          console.log("======error in subscription chargebee======>",error);

          futureCallBack.return(error);
        }else{
          let status = result.subscription.status;
          console.log('=======status : ',status);

          let subscription_id = result.subscription.id;

          if(status == "active"){
            let curUser = Users.update({
              _id : Meteor.userId()
            },{
              $set : {
                "profile.isSubscribed" : true,
                "profile.subscriptionData.subscriptionId" : subscription_id
              }
            });
          }

          futureCallBack.return({
            status : status
          });
        }
      }));

      return futureCallBack.wait();
  },
});
