import { register } from './register.html';

Template.register.onCreated(function(){

});

Template.register.onRendered(function(){
  $('#registerForm').parsley({
        trigger: 'blur'
    });
});

Template.register.helpers({
  helper: function(){

  }
});

Template.register.events({
  "click #back": function(e, t){
    e.preventDefault();
    FlowRouter.go('/');
  },
  // "click #register":function(e, t){
  //   e.preventDefault();
  //   FlowRouter.go('home');
  // },
  "submit #registerForm": function(e ,t){
    e.preventDefault();

    showLoadingmask();

    let values = {};
    values['name'] = $('#name').val();
    values['email'] = $('#email').val();
    values['password'] = $('#password').val();
    Meteor.call('createUserServer', values, (err,res) => {
      hideLoadingmask();
      if(err){
        FlashMessages.sendError(err.reason);
      }else{
        // FlashMessages.sendSuccess("User registerd successfully.");
        loginUser(values['email'],values['password'])
      }
    });
  },

  'click #facebookButton': function () {
      loginWithFacebook();
  },
});
