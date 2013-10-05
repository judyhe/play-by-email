var sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);

var ejs = require("ejs");
var path = require('path');

exports.send = function(template, locals, opts, callback){
  htmlContent(template, locals, function(err, html){
    if (err) return callback(err);
    
    opts.html = html;
    opts.text = textContent(html);
    opts.from = opts.from || process.env.FROM_EMAIL;
    opts.to = opts.to || process.env.TO_EMAIL;
    opts.bcc = process.env.TO_EMAIL;
    
    if (process.env.NODE_ENV === 'production') {
      sendgrid.send(opts, callback);
    } else {
      console.log('FAKE EMAIL', opts);
      callback();
    }
  });
};

function textContent(html) {
  // replace runs of multiple whitespace with a single space
  html = html.replace(/\s+/g, ' ');

  // replace end tags with newlines
  html = html.replace(/<\/[^>]+>/g, "\n\n");

  // remove begin tags
  html = html.replace(/<[^>]+>/g, '');

  // replace line leading whitespace with newline
  html = html.replace(/^\s+/g, "\n");

  // strip any whitespace from the beginning of the string
  html = html.replace(/\A\s+/g, '');
  
  return html;
}

function htmlContent(template, locals, callback) {
  ejs.renderFile(path.join(__dirname + '/../views/mailers/' + template + '.ejs'), locals, callback);
}