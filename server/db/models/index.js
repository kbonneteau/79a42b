const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");
const Member = require("./member");

// associations

User.belongsToMany(Conversation, { through: "Member" });
Conversation.belongsToMany(User, { through: "Member" });
User.hasMany(Member);
Member.belongsTo(User);
Conversation.hasMany(Message);
Member.belongsTo(Conversation);
Conversation.hasMany(Member);
Message.belongsTo(Conversation);

module.exports = {
  User,
  Conversation,
  Message,
};
