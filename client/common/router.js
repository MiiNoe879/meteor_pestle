import { Users } from '/imports/api/collections/user';

function loginRequired(){
    if(!Meteor.userId()){
        FlowRouter.go("signIn");
    }
}

function redirection(){
  //debugger;
  if(Meteor.userId()){
      FlowRouter.go("home");
  }
}

// handling /user route
FlowRouter.route('/', {
  name : "onBoard",
  action: function() {
    BlazeLayout.render('appLayout', { main: "onBoarding" });
  },
  triggersEnter: [function(context, redirect) {
    window.scrollTo(0,0);
    redirection();

  }]
});

FlowRouter.route('/register', {
  name : "register",
  action: function() {
    BlazeLayout.render('appLayout', { main: "register" });
  },
  triggersEnter: [function(context, redirect) {
    window.scrollTo(0,0);
    redirection();

  }]
});

FlowRouter.route('/sign-in', {
  name : "signIn",
  action: function() {
    BlazeLayout.render('appLayout', { main: "signIn" });
  },
  triggersEnter: [function(context, redirect) {
    window.scrollTo(0,0);
    redirection();

  }]
});

FlowRouter.route('/verify-email/:token', {
  name : "verify-email",
  action: function() {
    // BlazeLayout.render('appLayout', { main: "signIn" });
  },
  triggersEnter: [function(context, redirect) { window.scrollTo(0,0)
    Accounts.verifyEmail(context.params.token, (err) => {
        if (err) {
            if (err.message == 'Verify email link expired [403]' && !verificationFlag) {
                FlashMessages.sendError("Verify email link expired.");
            } else {
                FlashMessages.sendError(err.reason);
            }
            FlowRouter.go('signIn');
        } else {
            FlashMessages.sendSuccess("Your account verified successfully.");
            FlowRouter.go('signIn');
        }

    });
  }]
});


FlowRouter.route('/forgot-password', {
  name : "forgotPassword",
  action: function() {
    BlazeLayout.render('appLayout', { main: "forgotPassword" });
  },
  triggersEnter: [function(context, redirect) {
    window.scrollTo(0,0);
  }]
});

FlowRouter.route('/change-password', {
  name : "changePassword",
  action: function() {
    BlazeLayout.render('appLayout', { main: "changePassword" });
  },
  triggersEnter: [function(context, redirect) {
    window.scrollTo(0,0)

  }]
});

FlowRouter.route('/reset-password/:token', {
  name : "resetPassword",
  action: function() {
    BlazeLayout.render('appLayout', { main: "resetPassword" });
  },
  triggersEnter: [function(context, redirect) {
    window.scrollTo(0,0)

  }]
});

FlowRouter.route('/home', {
  name : "home",
  subscriptions: function() {
    Meteor.subscribe("receipeList");
    Meteor.subscribe("failedScrappedList");
  },
  action: function() {
    BlazeLayout.render('appLayout', { main: "home" });
  },
  triggersEnter: [function(context, redirect) {
    window.scrollTo(0,0)
    loginRequired()
  }]
});

FlowRouter.route('/create', {
  name : "create",
  subscriptions: function() {
    Meteor.subscribe("receipeList");
  },
  action: function() {
    BlazeLayout.render('appLayout', { main: "create" });
  },
  triggersEnter: [function(context, redirect) {
    window.scrollTo(0,0)
    loginRequired()
  }]
});

FlowRouter.route('/edit/:receipe_id', {
  name : "edit",
  subscriptions: function() {
    Meteor.subscribe("receipeList");
  },
  action: function() {
    BlazeLayout.render('appLayout', { main: "edit" });
  },
  triggersEnter: [function(context, redirect) {
    window.scrollTo(0,0)
    loginRequired()
  }]
});


FlowRouter.route('/view/:receipe_id', {
  name : "recipeView",
  subscriptions: function(params) {
    console.log('params.receipe_id ====',params.receipe_id);
    Meteor.subscribe("receipeDetail",params.receipe_id);
  },
  action: function() {
    BlazeLayout.render('appLayout', { main: "recipeView" });
  },
  triggersEnter: [function(context, redirect) {
    window.scrollTo(0,0)

  }]
});

FlowRouter.route('/account', {
  name : "account",
  action: function() {
    BlazeLayout.render('appLayout', { main: "account" });
  },
  triggersEnter: [function(context, redirect) {
    window.scrollTo(0,0)
    loginRequired()
  }]
});

FlowRouter.route('/menu', {
  name : "menu",
  action: function() {
    BlazeLayout.render('appLayout', { main: "menu" });
  },
  triggersEnter: [function(context, redirect) {
    window.scrollTo(0,0)

  }]
});

FlowRouter.notFound = {
    action: function() {
      FlowRouter.go("home");
    }
};
