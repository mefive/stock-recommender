import fetch = require('isomorphic-fetch');
import querystring = require('querystring');
import json5 = require('json5');
import camelize = require('camelize');

export function get(url, params) {
  const urlWithParams = params
    ? `${url}?${querystring.stringify(params)}`
    : url;

  return fetch(urlWithParams)
    .then(res => res.text())
    .then(text => json5.parse(text))
    .then(data => camelize(data));
}
