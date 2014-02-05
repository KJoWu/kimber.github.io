/**
 * Express routes for the app. 
 *
 * Exports a function, that given an Express app, configures with a whole
 * bunch of delicious routes. Returns the express app.
 */

var RouteManager = require('express-shared-routes').RouteManager;

/* CSRF middleware. Generates a CSRF token and makes it available to templates
 * under the name 'csrfToken'. */
function withCsrfToken(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
}

/*
 * Returns a route callback that renders the given template name.
 */
function simpleRender(templateName) {
  return function (req, res) {
    /* Renders the function or complains that the template was not found. */
    res.render(templateName);
  };
}

module.exports = function (app) { 

  /* Create a route manager.... */
  var routes = new RouteManager();
  /* ...and make the template engine aware of its existence. */
  app.locals.urlFor = routes.getLink.bind(routes);


  /* Add some stuff to the request object automatically for job routes. */
  app.param('job_id', require('./job-middleware')(app));

  /* Renders all of the 'simple pages'. */
  routes.get({name: 'home', re: '/'}, withCsrfToken, simpleRender('index'));
  routes.get({name: 'terms-of-use', re: '/terms-of-use'},
            simpleRender('terms_of_use'));
  routes.get({name: 'contact-us', re: '/contact-us'},
            simpleRender('contact_us'));

  /* Demo job page. */
  routes.get({name: 'job', re: '/job/:job_id'}, function (req, res) {
    res.format({
      /* On JSON requests, return the sites list. */
      'json': function () {
        res.json(req.job.sites);
      },

      /* On HTML, render the page for the first time. */
      'html': function () {
        res.render('job_page', { job: req.job || [] });
      }
    });

  });

  /* Install the development routes. */
  if ('development' === app.settings.env) {
    require('./dev-routes')(app, routes, {csrf: withCsrfToken});
  }

  /* This **MUST** be run for the routes to work. */
  routes.applyRoutes(app);
  return app;
};
