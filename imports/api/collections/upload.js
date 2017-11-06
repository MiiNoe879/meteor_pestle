switch (Meteor.absoluteUrl()) {
    case "http://localhost:3000/":
    fileUploadPath = process.env.PWD + '/receipe_images_upload';

        // fileUploadPath = '/Users/bhoomikakathiriya/Desktop/receipe_images';
        break;
    default:
    fileUploadPath = process.env.PWD + '/receipe_images_upload';

        // fileUploadPath = '/Users/bhoomikakathiriya/Desktop/receipe_images';
}

export const upload = new FS.Collection("Images", {
    stores: [
        new FS.Store.FileSystem("Images", { path: fileUploadPath })
    ]
});

upload.allow({
    insert: function (userId, fileObj) {
        return true;
    },
    update: function (userId, fileObj) {
        return true;
    },
    download: function (userId, fileObj /*, shareId*/) {
        return true;
    },
    fetch: []
});
