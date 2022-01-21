const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");
const Member = require("./member")

// associations

User.hasMany(Member);
User.belongsToMany(Conversation, { through: 'Member' })
Message.belongsTo(Conversation);
Conversation.hasMany(Message);
Conversation.hasMany(Member);

module.exports = {
  User,
  Conversation,
  Message
};
