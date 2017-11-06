import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {

});


// layout
import '/imports/ui/layout/appLayout.js';

// onBoard
import '/imports/ui/views/onBoard/onBoarding.js';
import '/imports/ui/views/onBoard/register.js';
import '/imports/ui/views/onBoard/signIn.js';
import '/imports/ui/views/onBoard/forgotPassword.js';
import '/imports/ui/views/onBoard/changePassword.js';
import '/imports/ui/views/onBoard/resetPassword.js';

// home
import '/imports/ui/views/home/home.js';

// recipeCreate
import '/imports/ui/views/recipeCreate/create.js';
import '/imports/ui/views/recipeCreate/edit.js';
import '/imports/ui/views/recipeCreate/recipeView.js';

// account
import '/imports/ui/views/account/account.js';

// menu
import '/imports/ui/views/menu/menu.js';
