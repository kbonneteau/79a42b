import React from "react";
import { Box, Avatar } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  profilePic: {
    height: 26,
    width: 26,
    margin: "9px 0 9px auto",
  },
}));

const Messages = (props) => {
  const classes = useStyles();
  const { messages, otherUser, userId } = props;

  const readMessages = messages.filter((message) => {
    if (message.senderId === userId && message.read) return message;
    if (message.senderId === otherUser.id) return message;
  });
  const lastReadMessage = readMessages[readMessages.length - 1];

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format("h:mm");

        return message.senderId === userId ? (
          <React.Fragment key={message.id}>
            <SenderBubble text={message.text} time={time} />
            {lastReadMessage && message.id === lastReadMessage.id && (
              <Avatar
                alt={otherUser.username}
                src={otherUser.photoUrl}
                className={classes.profilePic}
              ></Avatar>
            )}
          </React.Fragment>
        ) : (
          <React.Fragment key={message.id}>
            <OtherUserBubble
              key={message.id}
              text={message.text}
              time={time}
              otherUser={otherUser}
            />
            {lastReadMessage && message.id === lastReadMessage.id && (
              <Avatar
                alt={otherUser.username}
                src={otherUser.photoUrl}
                className={classes.profilePic}
              ></Avatar>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default Messages;
