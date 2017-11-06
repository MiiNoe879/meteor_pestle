pageSessionSuccessMsgFlag = false;
pageSessionUpdateMsgFlag = false;
projectName = "Pestle";

errorMessages = new Object();

//common validations classes
validationJSON = [
    {
        selector: ".validationRequired",
        attributes: [
        { name: "data-parsley-required", value: true },
        { name: "data-parsley-required-message", value() { let message = "This field is required"; if (typeof errorMessages[$(this).attr("Name")] != "undefined" && typeof errorMessages[$(this).attr("Name")].requiredmessage != "undefined") { message = errorMessages[$(this).attr("Name")].requiredmessage; } return message; } }
        ]
    },
    {
        selector: ".validationType",
        attributes: [
        { name: "data-parsley-type-message", value() { let message = "Please enter valid data"; if (typeof errorMessages[$(this).attr("Name")] != "undefined" && typeof errorMessages[$(this).attr("Name")].typemessage != "undefined") { message = errorMessages[$(this).attr("Name")].typemessage; } return message; } }
        ]
    },
    {
        selector: ".validationEqualTo",
        attributes: [
        { name: "data-parsley-equalto", value() { return $(this).attr("euqalTo"); } },
        { name: "data-parsley-equalto-message", value() { let message = "New Password and confirm password must be same."; if (typeof errorMessages[$(this).attr("Name")] != "undefined" && typeof errorMessages[$(this).attr("Name")].euqalToMessage != "undefined") { message = errorMessages[$(this).attr("Name")].euqalToMessage; } return message; } }
        ]
    },
    {
        selector: ".validationNumber",
        attributes: [
        { name: "data-parsley-type", value: "number" },
        { name: "data-parsley-type-message", value() { let message = "Please enter valid number"; if (typeof errorMessages[$(this).attr("Name")] != "undefined" && typeof errorMessages[$(this).attr("Name")].typemessage != "undefined") { message = errorMessages[$(this).attr("Name")].typemessage; } return message; } }
        ]
    },
    {
        selector: ".validationMinLength",
        attributes: [
        { name: "data-parsley-minlength", value() { return $(this).attr("minLength"); } },
        { name: "data-parsley-minlength-message", value() { let message = 'Please enter minimum '+$(this).attr("minLength") +'characters'; if (typeof errorMessages[$(this).attr("Name")] != "undefined" && typeof errorMessages[$(this).attr("Name")].minLengthMessage != "undefined") { message = errorMessages[$(this).attr("Name")].minlengthMessage; } return message; } }
        ]
    },
    {
        selector: ".validationMaxLength",
        attributes: [
        { name: "data-parsley-maxlength", value() { return $(this).attr("maxLength"); } },
        { name: "data-parsley-maxlength-message", value() { let message = 'Please enter maximum '+$(this).attr("maxLength")+' characters'; if (typeof errorMessages[$(this).attr("Name")] != "undefined" && typeof errorMessages[$(this).attr("Name")].maxLengthMessage != "undefined") { message = errorMessages[$(this).attr("Name")].maxLengthMessage; } return message; } }
        ]
    }
];

/********************* Module list ***************************/

objModules = {};
objModules.user = { name: "user", displayName: "User" };

/****************************************************************/
infoMessages = {};
infoMessages.UserActivated = "User Activated Successfully.";
infoMessages.passwordUpdated = 'Password updated Successfully';

informationMessages = {
    'credentialsWrong': 'Your login credentials are incorrect. Please try again.',
    'notValidUser': 'Not valid user. Make sure you validate your email address first.',
    'emailVerifiedFirst': 'Your email address has to be verified first.',
    'AccountRemoved':'Your Account is removed by Admin.'
}

/****************************************************************/
