/**
 * The Express.js app. Exports the app object.
 *
 * Author: Eddie Antonio Santos <easantos@ualberta.ca>
 */

var app;

/* Create and configure the Express app. */
module.exports = app = require('./config')();
/* Configure the routes. */
require('./routes')(app);

/* That's it! Check the associated files for extra goodies. */

