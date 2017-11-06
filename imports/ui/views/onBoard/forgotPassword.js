import { forgotPassword } from './forgotPassword.html';

Template.forgotPassword.onCreated(function(){

});

Template.forgotPassword.onRendered(function(){
  $('#forgotForm').parsley({
        trigger: 'blur'
    });
});

Template.forgotPassword.helpers({
  helper: function(){

  }
});

Template.forgotPassword.events({
  "click #back": function(e, t){
    e.preventDefault();
    FlowRouter.go('signIn');
  },
  "submit #forgotForm": function(e ,t){
    e.stopPropagation();
    e.preventDefault();

    showLoadingmask();

    let emailId = $('#email').val();
    Accounts.forgotPassword({email: emailId}, err => {
      hideLoadingmask();
      if (err) {
        if (err.message === 'User not found [403]') {
          //console.log('This email does not exist.');
            FlashMessages.sendError('This email does not exist.');
        } else {

          //console.log('We are sorry but something went wrong.');
          FlashMessages.sendError('We are sorry but something went wrong.');
        }
      } else {
        //console.log('Email Sent. Check your mailbox.');
        FlashMessages.sendSuccess('Email Sent. Check your mailbox.');
      }
    });
  }
});
