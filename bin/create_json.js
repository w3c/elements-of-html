#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

var destPath = path.join(__dirname, '../elements.json');
var srcPath = path.join(__dirname, '../index.html');

var src = fs.readFileSync(srcPath, 'utf-8');
var $ = cheerio.load(src);

var data = [];
var trs = [].slice.call($('main tbody tr'));
var speclist = [].map.call($('main thead th:not(:first-child)'), function(th) {
  return $(th).text().replace(/[^0-9.]+/, function(m) {
    if (m.substr(0, 1) === 'X') {
      return 'X';
    } else {
      return '';
    }
  });
});

for (var i = 0; i < trs.length; i++) {
  var tr = trs[i];
  var ele = $('th', tr)[0];
  var element = $(ele).text();

  var dataset = {
    element: element.replace(/ \[(.*)\]/, function(m, $1) {
      /* for qualified <input> elements, change to valid CSS selector */
      return '[type="' + $1 + '"]';
    }),
    link: '',
    specs: []
  };

  /* extract the defining doc's URL. TODO some elements have more than one URL */
  $('th a', tr).each(function(idx, ele) {
    var attr = $(ele).attr();
    if (!dataset.link && attr && attr.href) {
      dataset.link = attr.href;
    }
  });

  var tds = [].slice.call($('td', tr));

  for (var n = 0; n < tds.length; n++) {
    var td = tds[n];

    $('img', td).each(function(idx, ele) {
      var attr = $(ele).attr();
      if (attr && attr.alt && attr.alt.slice(0, 3) === 'yes') {
        /* if it's a "yes" image, add the spec to the list for this element */
        dataset.specs.push(speclist[n]);
      }
    });
  }

  data.push(dataset);
}

fs.writeFileSync(destPath, JSON.stringify(data, null, '  '));
