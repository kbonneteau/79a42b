import React, { useEffect, useRef } from "react";
import { Box, Avatar } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";
// import { connect } from "react-redux";

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
  const { messages, otherUser, userId, unreadCount } = props;
  console.log("messages props",props)

  const lastReadMessageRef = useRef(null);

  useEffect(() => {
    const readMessages = messages.filter(
      (message) =>
        (message.senderId === userId && message.read) ||
        message.senderId === otherUser.id
    );
    lastReadMessageRef.current = readMessages[readMessages.length - 1];
  }, [unreadCount, messages, otherUser.id, userId])

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format("h:mm");

        return message.senderId === userId ? (
          <React.Fragment key={message.id}>
            <SenderBubble text={message.text} time={time} />
            {lastReadMessageRef.current && message.id === lastReadMessageRef.current.id && (
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
            {lastReadMessageRef.current && message.id === lastReadMessageRef.current.id && (
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

// const mapStateToProps = (state) => {
//   return {
//     conversations: state.conversations
//   };
// };

// export default connect(mapStateToProps)(Messages);
export default Messages;
