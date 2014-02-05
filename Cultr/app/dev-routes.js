/**
 * Routes that should be active only in development.
 */
module.exports = function (app, routes, middleware) {

  var csrf = middleware.csrf;

  /*
   * Configure a 'any template' renderer. Simply type:
   * localhost:3000/t/template-name (without extension) and it shall render.
   *
   * For example: localhost:3000/t/index renders the original site.
   */
  routes.get({name: 'template', re: '/t/:template'}, csrf, function (req, res) {
    var templateName = req.params.template;
    res.render(templateName);
  });

  /* Debug form test route. */
  routes.post({name: 'form-test', re: '/form-test'}, function (req, res) {
    console.log(req.body);

    res.send(204);
  });

};
