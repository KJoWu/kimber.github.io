/**
 * Export is a function, that given an Express app, returns parameter
 * middleware for job IDs. It fetches the job from the database and gets basic
 * information about it.
 */

/* TODO: There should be some sort of client re-use, but for demo purposes,
 * create a client every time. */

var MongoClient = require('mongodb').MongoClient
  , redis = require('redis')
  , async = require('async');

/**
 * Translates the given job ID to the a valid BSON object for querying.
 * Right now, this is simply an identity function, but will soon change.
 */
function jobIDtoMongo(id) {
  return id;
}

/**
 * Adds information about each site to
 */
function augmentSiteWithStats (sites, stats)  {

  sites.forEach(function (entry, idx) {
    var site = entry.url
      , errors = (stats.errors || {})[site] || 0
      , pages = (stats.done || {})[site] || 0;

    sites[idx].error = errors;
    sites[idx].pages = pages;
    sites[idx].percentage = undefined;
  });

  return sites;
}

/**
 * Retrieves meta information from MongoDB.
 */
function metaFromMongo(jobID) {

  return function (done) {

    async.waterfall(
      [
        /* Connect to the database... */
        async.apply(MongoClient.connect, 'mongodb://localhost:27017/cultr'),

        /* Find the job in the jobs collection... */
        function (db, callback) {
          var jobMeta = db.collection('jobs');
          var id = jobIDtoMongo(jobID);

          /* Find the job. */
          jobMeta.findOne({ _id: id }, callback);
        }
    ],
    /* Finally, return the document. */
    function (err, doc) {
      if (err) return done(err);

      if (!doc) {
        console.log('Mongo: could not find doc for ' + jobID);
        return done(new Error("Job not found"));
      }

      done(null, doc);

    });
  };

}

/**
 * Get job stats from Redis.
 */
function statsFromRedis(jobID) {

  function key(name) {
    return 'jobs:' + jobID + ':' + name;
  }

  return function (done) {
    var client = redis.createClient();
    client.on('error', function (err) { done(err); });

    /* Need to bind hgetall to client in order to use apply. */
    var hgetall = client.hgetall.bind(client);

    async.parallel(
      {
        'errors': async.apply(hgetall, key('error')),
        'done':   async.apply(hgetall, key('done')),
      },
      function (err, results) {
        if (err) return done(err);
        done(null, results);
      }
    );

  };

}



module.exports = function (app) {
  return function (req, res, next, jobID) {
    /* This final callback could be called with an error **multiple times**.
     * To handle this, simply keep track if we've already seen an error.  */
    var hasError = false;

    /* Fetch data from MongoDB and Redis concurrently. */
    async.parallel([
      metaFromMongo(jobID),
      statsFromRedis(jobID)
    ],
    function (err, results) {
      if (err && !hasError) {
        hasError = true;
        return next(err);
      }

      var meta = results[0]
        , stats = results[1];

      var sitesWithStats = augmentSiteWithStats(meta.sites, stats);

      var data = {
        job_id: jobID,
        owner: meta.owner,
        sites: sitesWithStats
      };

      /* Set the data and continue. */
      req.job = data;
      next();

    });
  };

};
