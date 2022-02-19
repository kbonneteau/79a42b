import React, { useEffect, useMemo, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Input, Header, Messages } from "./index";
import { connect } from "react-redux";
import { updateReadMessages } from "../../store/utils/thunkCreators";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexGrow: 8,
    flexDirection: "column",
  },
  chatContainer: {
    marginLeft: 41,
    marginRight: 41,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "space-between",
  },
}));

const ActiveChat = (props) => {
  const classes = useStyles();
  const { user, updateReadMessages } = props;
  const conversation = props.conversation || {};
  const conversationRef = useRef(null);
  const messages = useMemo(() => {
    return conversation.messages;
  }, [conversation.messages]);

  useEffect(() => {
    const updateMessages = async (conversationId, userId) => {
      const response = await updateReadMessages({ conversationId, userId });
      return response;
    };
    // If there's a conversation ID active, update the messages in chat to read.
    if (conversation.id) {
      updateMessages(conversation.id, user.id);
      conversationRef.current = conversation.id;
    }
  }, [updateReadMessages, conversation.id, user.id]);

  return (
    <Box className={classes.root}>
      {conversation.otherUser && (
        <>
          <Header
            username={conversation.otherUser.username}
            online={conversation.otherUser.online || false}
          />
          <Box className={classes.chatContainer}>
            <Messages
              messages={messages}
              otherUser={conversation.otherUser}
              userId={user.id}
              unreadCount={conversation.unreadCount}
            />
            <Input
              otherUser={conversation.otherUser}
              conversationId={conversation.id}
              user={user}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
    conversation:
      state.conversations &&
      state.conversations.find(
        (conversation) =>
          conversation.otherUser.username === state.activeConversation
      ),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateReadMessages: (body) => {
      dispatch(updateReadMessages(body));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActiveChat);
