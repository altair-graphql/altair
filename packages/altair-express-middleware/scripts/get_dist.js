const ncp = require('ncp').ncp;
const path = require('path');

ncp.limit = 16;
const source = path.join(__dirname, '../../../dist');

const destination = path.join(__dirname, '../dist');
console.log(source, ', ', destination);
ncp(source, destination, function (err) {
 if (err) {
   return console.error(err);
 }
 console.log('Done copying dist folder!');
});
