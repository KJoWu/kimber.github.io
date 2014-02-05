/**
 * Creates and configures an Express app.
 * The export is a function that optionally takes the Express app, and
 * configures it. The app is then returned.
 */

var express = require('express');
var swig = require('swig');

module.exports = function (app) {

  /* Create a new app if it doesn't exist.. */
  app = app || express();

  var development = 'development' === app.settings.env;
  console.log('Configuring app for ' + app.settings.env + ' environment.');

  /* Register Swig as our template engine. */
  app.engine('html', swig.renderFile);
  app.set('view engine', 'html');

  /* Disable ALL view caching during development. */
  if (development) {
    app.set('view cache', false);
    swig.setDefaults({ cache: false });
  }

  /* Templates are going to exist in here, yo! */
  app.set('views', __dirname + '/../templates');


  /*************************************************************************
   *                        THE MIDDLEWARE SECTION                         *
   *************************************************************************/

  /* Log all requests. ALL OF THEM. */
  app.use(express.logger(development ? 'dev' : 'default'));

  /* Use cookies. Needed for the session middleware. */
  app.use(express.cookieParser());

  /* Cookie session middleware. Does cryptographic brouhaha. */
  app.use(express.session({
    secret: getSecret(),
    /* Store the cookie in the field 'sid'. */
    key: 'sid',
    /* Keep the cookie for about a year. */
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 365 }
  }));

  /* Parse URL-encoded and JSON bodies (e.g., for use with POST) */
  app.use(express.urlencoded());
  app.use(express.json());

  /* Parse and create CSRF tokens. */
  app.use(express.csrf());

  /* Finally, use the router to get requests. */
  app.use(app.router);

  /* If the URL does not match a route, open up the file in the 'public'
   * directory instead. */
  app.use(express.static(__dirname + '/../public'));

  /* TODO: Custom 404 middleware? */

  /* Finally, the generic error handler. */
  app.use(express.errorHandler());

  return app;
};

/**
 * Gets the cryptographic secret used for signing HTTP cookies. Uses a default
 * if the secret file does not exist.
 */
function getSecret() {
  try {
    return require('./secret');
  } catch (_err) {
    console.warn('Using secret for development mode. ' +
                 'Please provide a secret in the file ./app/secret.json');
    return "Curly's knickers";
  }
}
