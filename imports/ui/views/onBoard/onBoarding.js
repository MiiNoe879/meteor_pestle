import { onBoarding } from './onBoarding.html';

Template.onBoarding.onCreated(function(){

});

Template.onBoarding.onRendered(function(){
});

Template.onBoarding.helpers({
  helper: function(){

  }
});

Template.onBoarding.events({
  "click #continue": function(e, t){
    e.preventDefault();
    FlowRouter.go('signIn');
  }
});
