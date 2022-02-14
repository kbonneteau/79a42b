export const addMessageToStore = (state, payload) => {
  const { message, sender } = payload;
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...state];
  }

  return state.map((convo) => {
    if (convo.id === message.conversationId) {
      return {
        ...convo,
        messages: [...convo.messages, message],
        latestMessageText: message.text,
      };
    } else {
      return convo;
    }
  });
};

export const addOnlineUserToStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser = { ...convoCopy.otherUser, online: true };
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser = { ...convoCopy.otherUser, online: false };
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, users) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach((convo) => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.push(fakeConvo);
    }
  });

  return newState;
};

export const addNewConvoToStore = (state, recipientId, message) => {
  return state.map((convo) => {
    if (convo.otherUser.id === recipientId) {
      // spread conversation properties to circumvent mutating state
      return {
        ...convo,
        id: message.conversationId,
        messages: [...convo.messages, message],
        latestMessageText: message.text,
        lastUnreadMessage: message.text,
      };
    } else {
      return convo;
    }
  });
};

export const updateReadStatus = (state, payload) => {
  return state.map((conversation) => {
    const {
      conversationId,
      currentUserId,
      recipientNotification,
      lastReadMessage,
    } = payload;
    // For the currently active conversation
    if (conversation.id === conversationId) {
      return {
        ...conversation,
        unreadCount: 0,
        messages: conversation.messages.map((message) => {
          // If the sender of the message isn't the current user, mark the messages as read in state
          if (message.senderId !== currentUserId) {
            return {
              ...message,
              read: true,
            };
          }
          // If the recipient provided a read receipt, mark as read
          if (recipientNotification && message.senderId !== currentUserId) {
            return {
              ...message,
              read: true,
            };
          }

          return message;
        }),
      };
    }
    return conversation;
  });
};
