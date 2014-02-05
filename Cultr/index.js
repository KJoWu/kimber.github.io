/**
 * Designer-mode start up for the web server.
 *
 * Starts the server listening on localhost:3000.
 */

require('./app').listen(3000, function () {
  console.log('Express listening on port 3000');
  console.log('Press ctrl+c to quit.');
});
