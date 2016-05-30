var request = require('request');
var async = require('async');
var quote1 = require('./payloads/quote1');
var quote2 = require('./payloads/quote1');
var booking = require('./payloads/booking');

var options = function(body) {
  return {
    method: 'POST',
    url: 'https://sandbox.api.addisonlee.com/api/v2-sandbox/quickbook/quote/price',
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      authorization: process.env.AUTH_HEADER
    },
    body: body,
    json: true
  }
};

async.waterfall([bookQuote1, bookQuote2, makeMultiBook], function (err, result) {
  if (err) {
    console.error(err);
  }
  
  console.info(result);
});

function bookQuote1(callback) {
  request(options(quote1), function(error, response, body) {
    if (error) {
      return callback(error);
    }

    return callback(null, {
      request_id: body.request_id,
      quote_id: body.quotes[0].quote_id,
      service: body.quotes[0].service
    });
  });
}

function bookQuote2(quote1Response, callback) {
  request(options(quote2), function(error, response, body) {
    if (error) {
      return callback(error);
    }

    return callback(null, quote1Response, {
      request_id: body.request_id,
      quote_id: body.quotes[0].quote_id,
      service: body.quotes[0].service
    });
  });
}

function makeMultiBook(quote1Response, quote2Response, callback) {

  var quotes = [quote1Response, quote2Response];

  var payload = booking;
  payload.quotes = quotes;

  request({
    url: 'https://local.partnerships.addisonlee.com/api/v1/booking/multiple',
    method: 'POST',
    body: payload,
    json: true,
    strictSSL: false,
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      clientid: process.env.CLIENT_ID
    }
  }, function(error, response, body) {
    if (error) {
      return callback(error);
    }

    return callback(null, body);
  });
}
