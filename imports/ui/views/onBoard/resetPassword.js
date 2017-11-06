import { resetPassword } from './resetPassword.html';

Template.resetPassword.onCreated(function(){

});

Template.resetPassword.onRendered(function(){
  $('#resetPasswordForm').parsley({
        trigger: 'blur'
    });
});

Template.resetPassword.helpers({
  helper: function(){

  }
});

Template.resetPassword.events({
  "click #back": function(e, t){
    e.preventDefault();
    FlowRouter.go('signIn');
  },
  'submit #resetPasswordForm': function(e) {
    e.preventDefault();
    showLoadingmask();

    let password = $('#resetPassword').val();
    Accounts.resetPassword(FlowRouter.getParam("token"), password, err => {
      hideLoadingmask();
        if (err) {
            FlashMessages.sendError('We are sorry but something went wrong.');
        } else {
            FlashMessages.sendSuccess('Your password has been changed. Welcome back!');
            FlowRouter.go('signIn');
        }
    });
  }
});
