import { changePassword } from './changePassword.html';

Template.changePassword.onCreated(function(){

});

Template.changePassword.onRendered(function(){
  $('#changePasswordForm').parsley({
        trigger: 'blur'
    });
});

Template.changePassword.helpers({
  helper: function(){

  }
});

Template.changePassword.events({
  "click #back": function(e, t){
    e.preventDefault();
    FlowRouter.go('account');
  },
  'submit #changePasswordForm': function(e) {
    e.preventDefault();

    showLoadingmask();

    Accounts.changePassword($('#oldPwd').val(), $('#newPwd').val(), function(error) {
        hideLoadingmask();
        if (error) {
            FlashMessages.sendError(error.reason);
        } else {
            FlashMessages.sendSuccess('Password Updated Successfully');
            FlowRouter.go('account');
        }
    });
}
});
