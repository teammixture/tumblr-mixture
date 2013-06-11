tumblr-mixture
==============

This script will migrate a tumblr blog posts to a (Mixture)[http://mixture.io] ready format.

### Notes:

There are some settings you will need to change to match your project and details:

- apiKey // http://www.tumblr.com/docs/en/api/v2
- blogAddress // your-address.tumblr.com
- outputPath // path on disk to save the output
- collectionName // the name of your collection
- imageDirectoryPath // the path (based on your mixture project to save images eg. '/assets/images/'

The script will pull all post files into markdown files. You edit "to-markdown.js" if you want it to strip specific html tags from the original posts.

All images in the post content will be pulled and saved into imageDirectoryPath.

The script will also output a routes.json file - these routes can be dropped into your Mixture settings file and will redirect the old Tumblr URLs to your new Mixture URLs. It's important that to note that a lot of these routes could cause performance issues in your project and if you make adjustments to any collection item URL you will need to manually adjust this data.
