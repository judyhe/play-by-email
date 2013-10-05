var mailer = require('./../lib/mailer');

function callbackFn(callingFn, email, groupId) {
  return function(err){
    if (err) console.log('EMAIL ERROR (' + callingFn + ')', email, groupId);
    console.log('EMAIL SENT (' + callingFn + ')', email, groupId);
  };
}

function getLocals(groupId, opts) {
  return _.extend({}, {
    botEmail: process.env.FROM_EMAIL,
    groupId: groupId
  }, opts);
}

exports.created = function(email, groupId, callback) {
  if (!callback) callback = callbackFn('created group', email, groupId);
  mailer.send('created',
    getLocals(groupId),
    {subject: "Your group has been created", to: email},
    callback
  );
};

exports.add = function(email, groupId, alreadyAdded, callback) {
  if (!callback) callback = callbackFn('add user', email, groupId);
  var subject = alreadyAdded ? "You are already in the group " + groupId : "You've been added to the group " + groupId;

  mailer.send('add',
    getLocals(groupId, {alreadyAdded: alreadyAdded}),
    {subject: subject, to: email},
    callback
  );
};

exports.alert = function(email, groupId, callback) {
  if (!callback) callback = callbackFn('alert user', email, groupId);

  var msgs = [
    "With great power comes great responsibility. Choose well young padawan",
    "Calm the chaos. Pick wisely my friend",
    "The power is yours.",
    "Everyone will be judging you. Find a worthy destination.",
    "Bring order to the infinite."
  ];
  var day =  new Date().getDay() === 5 ? 'Monday' : 'tomorrow';
  var msg = msgs[Math.floor((Math.random()*msgs.length)+1)-1];
  mailer.send('alert',
    getLocals(groupId, {msg: msg}),
    {subject: "You're picking lunch " + day + "!", to: email},
    callback
  );
};

exports.emergency = function(email, groupId, newEmergency, callback) {
  if (!callback) callback = callbackFn('emergency', email, groupId);

  var subject = newEmergency ? "You have put " + groupId + " into emergency mode!" : "You are in the midst of an emergency!";

  mailer.send('emergency',
    getLocals(groupId, {newEmergency: newEmergency}),
    {subject: subject, to: email},
    callback
  );
};

exports.help = function(email, callback) {
  if (!callback) callback = callbackFn('help', email);

  mailer.send('help',
    {botEmail: process.env.FROM_EMAIL},
    {subject: "Using the LunchPickr email commmands", to: email},
    callback
  );
};

exports.hold = function(email, groupId, newHold, callback) {
  if (!callback) callback = callbackFn('hold group', email, groupId);

  var subject = newHold ? 'You have put ' + groupId + ' on hold' : groupId + ' is on hold';
  mailer.send('hold',
    getLocals(groupId, {newHold: newHold}),
    {subject: subject, to: email},
    callback
  );
};

exports.list = function(email, groupId, users, callback) {
  if (!callback) callback = callbackFn('list users', email);
  mailer.send(
    'list',
    getLocals(groupId, {users: users}),
    {subject: "Users in your group", to: email},
    callback
  );
};

exports.pass = function(email, groupId, callback) {
  if (!callback) callback = callbackFn('pass user', email, groupId);
  mailer.send('pass',
    getLocals(groupId),
    {subject: 'You have passed on picking lunch', to: email},
    callback
  );
};

exports.remove = function(email, groupId, newRemove, callback) {
  if (!callback) callback = callbackFn('remove user', email, groupId);

  var subject = newRemove ? 'You have been removed from LunchPickr' : 'You were not in the LunchPickr ' + groupId + ' group';

  mailer.send('remove',
    getLocals(groupId, {newRemove: newRemove}),
    {subject: subject, to: email},
    callback
  );
};