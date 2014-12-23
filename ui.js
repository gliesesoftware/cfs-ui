Helpers = {};

// We expose the properties of Helpers on `FS` globally
UI.registerHelper('FS', Helpers);

// Usage: {{#with FS.GetFile collectionName id}}{{/with}}
Helpers.GetFile = function cfsGetFile(collectionName, id) {
  var collection = FS._collections[collectionName];
  return collection ? collection.findOne(id) : null;
};

// Usage: {{> FS.DeleteButton}} or {{#FS.DeleteButton}}Button Text{{/FS.DeleteButton}} (with FS.File as current context)
// Supported Options: any attribute
Helpers.DeleteButton = Template._fs_DeleteButton;

Template._fs_DeleteButton2.events({
  'click button': function(event, template) {
    var fileObj = template.data.fileObj;
    if (!fileObj) {
      return false;
    }
    fileObj.remove();
    return false;
  }
});

// Usage: {{> FS.UploadProgressBar attribute=value}} (with FS.File as current context or not for overall)
Helpers.UploadProgressBar = Template._fs_UploadProgressBar;

Template._fs_UploadProgressBar.getAttsAndFileObj = function getAttsAndFileObj(atts, fileObj) {
  if (atts instanceof FS.File) {
    fileObj = atts;
    atts = {};
  } else {
    atts = atts || {};
  }

  var progressFunc;
  if (fileObj instanceof FS.File) {
    progressFunc = function () {
      return fileObj.uploadProgress();
    };
  } else {
    progressFunc = function () {
      return FS.HTTP.uploadQueue.progress();
    };
  }

  // We clone atts so that we can remove bootstrap or semantic props without losing them for
  // later reactive reruns.
  atts = FS.Utility.extend({}, atts);

  var useBootstrap = false, useSemantic = false;
  if (atts.semantic) {
    useSemantic = true;
    if (typeof atts["class"] === "string") {
      atts["class"] += " ui progress";
    } else {
      atts["class"] = "ui progress";
    }
    delete atts.semantic;
  } else if (atts.bootstrap) {
    useBootstrap = true;
    var progress = progressFunc();
    if (typeof atts["class"] === "string") {
      atts["class"] += " progress-bar";
    } else {
      atts["class"] = "progress-bar";
    }
    if (typeof atts["style"] === "string") {
      atts["style"] += " width: " + progress + "%;";
    } else {
      atts["style"] = "width: " + progress + "%;";
    }
    atts.role = "progressbar";
    atts["aria-valuenow"] = ''+progress;
    atts["aria-valuemin"] = "0";
    atts["aria-valuemax"] = "100";
    delete atts.bootstrap;
  }

  return {
    progress: progressFunc,
    atts: atts,
    useBootstrap: useBootstrap,
    useSemantic: useSemantic
  };
};

FS.EventHandlers = {};

// Simplifies some of the repetitive code for making an event handler that does a file insert
FS.EventHandlers.insertFiles = function cfsInsertFiles(collection, options) {
  
  // Assign options to options paramater or default to an empty object
  options = options || {};
  var afterCallback = options.after;
  var metadataCallback = options.metadata;
  
  // Create a function insertFilesHandler which we will return 
  function insertFilesHandler(event, template) {
    // Use the .eachFile utility function to iterate over an array of files.
    FS.Utility.eachFile(event, function (file) {
      // Pass variable f to FS.file constructor function 
      var f = new FS.File(file);
      // if a metadataCallback exists then use the extend utility function to add the metadata to the 'f' file object
      metadataCallback && FS.Utility.extend(f, metadataCallback(f));
      // Insert a stream into the files collection - using the supplied metadata to set the queueId,fileStreamId and 
      // the streamSize for the file 
      Streams.Files.insert({
          queueId: f.queueId,
          fileStreamId: f.fileStreamId,
          uploadedSize: 0,
          streamSize: f.data.blob.size
      });

      // Query the database to see if a Queue stream of the Id supplied in the metadata already exists
      var queue = Streams.Queues.findOne({queueId: f.queueId});
      // if a queue is found:
      if (queue) {
         // Update the queue we found - incrementing the total streamSize to include the current file object
         Streams.Queues.update(queue._id, {$inc: {streamSize: f.data.blob.size}});
      } else {
        // else: insert a brand new Stream into the queues collection with an initial streamSize equal to the 
        // size of the current file
          Streams.Queues.insert(
              { queueId: f.queueId,
                uploadedSize: 0,
                streamSize: f.data.blob.size
              }
          )
      }
      // Once we are done with all the stream handling, insert the file into the collection 
        collection.insert(f, afterCallback);
    });
  }

  return insertFilesHandler;
};


