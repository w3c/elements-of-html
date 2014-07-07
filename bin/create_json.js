#!/usr/bin/env node

var fs = require("fs");
var jsdom = require("jsdom");
var src = fs.readFileSync(__dirname+"/../index.html", "utf-8");

/* read the index file and create a DOM for it, process the data */
jsdom.env(src, function(err, window) {
  if (err) {
    throw err;
  }

  /* poor man's jQuery */
  function $(selector, ctx) {
    ctx = ctx || window.document;
    return ctx.querySelectorAll(selector);
  }

  var trs = $('main tbody tr'),
      i = 0,
      j = trs.length,
      data = [],
      /* the list of specification names from thead (first th is "Element") */
      speclist = Array.prototype.map.call(
                   $('main thead th:not(:first-child)'),
                   function(th) {
                     return th.textContent.replace(/[^0-9.]+/, function(m) {
                       if (m.substr(0, 1) === 'X') {
                         return 'X';
                       } else {
                         return '';
                       }
                     });
                   }),
      dataset, tds, k, l;

  for (; i < j; i++) {
    dataset = {
      element: $('th', trs[i])[0]
                 .textContent
                 .replace(/ \[(.*)\]/, function(m, m1) {
                   /* for qualified <input> elements, change to valid
                    * CSS selector */
                   return '[type="'+m1+'"]';
                 })
    };
    if ($('th a', trs[i]).length) {
      /* extract the defining doc's URL.
       * TODO some elements have more than one URL */
      dataset.link = $('th a', trs[i])[0].href;
    }

    dataset.specs = [];
    tds = $('td', trs[i]);
    k = tds.length;

    for (l = 0; l < k; l++) {
      if ($('img', tds[l]).length &&
          $('img', tds[l])[0].alt.substr(0, 3) === 'yes') {
        /* if it's a "yes" image, add the spec to the list for this element */
        dataset.specs.push(speclist[l]);
      }
    }

    data.push(dataset);
  }

  fs.writeFile(
    __dirname+'/../elements.json',
    JSON.stringify(data, null, '  '),
    function (err) {
      if (err) {
        throw err;
      }
    });
});
