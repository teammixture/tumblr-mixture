/* Copyright Mixture
 * MIT Licence
 */
var tumblrApi = require('tumblrwks'), // npm install tumblrwks
fs = require('fs'), 
toMarkdown = require('./to-markdown.js').toMarkdown,
http = require('http'),
path = require('path'),
url = require('url');

var apiKey = 'your-consumer-key'; // http://www.tumblr.com/docs/en/api/v2
var blogAddress = 'your-address.tumblr.com';
var outputPath = '/your/path';
var collectionName = 'name' // the name of your collection
var imageDirectoryPath = '/assets/images'; // the path to save images

var tumblr = new tumblrApi(
  {
    consumerKey: apiKey,
  }, 
  blogAddress
);

var template = "---\r\n{meta}---\r\n\r\n{content}";

tumblr.get('/posts', {hostname: blogAddress}, function(json){

  var tumblrUrls = [];

  for (var i in json.posts)
  {
    var obj = json.posts[i];
    var meta = "";
    var filename = obj.slug + ".md";
    var savePath = outputPath.replace(/\/$/, "") + "/collections/" + collectionName + "/" + filename;
    var body = (obj.body === undefined) ? toMarkdown(obj.caption) : toMarkdown(obj.body);
    var title = (obj.title === undefined) ? obj.slug : obj.title;
    var tagstr = obj.tags + "";

    meta += "title: \"" + title + "\"\r\n";
    meta += "date: " + obj.date.substring(0, obj.date.lastIndexOf(':')) + "\r\n";
    meta += "published: true\r\n";

    if (tagstr != "") meta += "tags: " + tagstr + "\r\n";

    var linkMatches = findLinks(body);

    fs.mkdirParent(outputPath.replace(/\/$/, "") + imageDirectoryPath);
    fs.mkdirParent(outputPath.replace(/\/$/, "") + "/collections/" + collectionName);

    for (var lnk in linkMatches){

      body = body.replace(linkMatches[lnk], imageDirectoryPath + '/' + path.basename(linkMatches[lnk]));

      var ext = path.extname(linkMatches[lnk]);

      if (ext != undefined){
        var file = linkMatches[lnk];

        (function(file, outputPath) {
          var shortname = path.basename(file);
          http.get(file, function(response) {
          var outStream = fs.createWriteStream(outputPath.replace(/\/$/, "") + imageDirectoryPath + "/" + shortname);
            response.pipe(outStream);
            console.log('Created image file');
          });
        })(file, outputPath);

      }
    }

    var temp = template.replace('{meta}', meta).replace('{content}', body);

    (function(temp, savePath) {
      fs.writeFile(savePath, temp, function (err, data) {
        if (err) return console.log(err);
        console.log("Created markdown file");
      });
    })(temp, savePath);

    if (obj.post_url != undefined)
    {
      var pos = obj.post_url.indexOf('/post');
      var routeObj = new Object();
      routeObj.redirect = "/" + collectionName + "/" + obj.slug;

      var originalRoute = obj.post_url.substring(pos,obj.post_url.length);
      originalRoute = originalRoute.substring(0, originalRoute.lastIndexOf('/')) + "/:tumblr-slug"

      routeObj.route = originalRoute;
      routeObj.template = null;
      tumblrUrls.push(routeObj);
    }
  }

  var saveRoutePath = outputPath.replace(/\/$/, "") + "/routes.json";

  if (tumblrUrls.length > 0)
  {
    fs.writeFile(saveRoutePath, JSON.stringify(tumblrUrls, undefined, 2), function (err) {
      if (err) return console.log(err);
      console.log('Created routes file');
    });
  }

});

function findLinks(text) {
  var urlRegex = /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/ig;
  return text.match(urlRegex);
}

fs.mkdirParent = function(dirPath, mode, callback) {
  //Call the standard fs.mkdir
  fs.mkdir(dirPath, mode, function(error) {
    //When it fail in this way, do the custom steps
    if (error && error.errno === 34) {
      //Create all the parents recursively
      fs.mkdirParent(path.dirname(dirPath), mode, callback);
      //And then the directory
      fs.mkdirParent(dirPath, mode, callback);
    }
    //Manually run the callback since we used our own callback to do all these
    callback && callback(error);
  });
};
