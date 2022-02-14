import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
  updateMessages,
} from "./store/conversations";

import { updateReadMessages } from "./store/utils/thunkCreators";

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    store.dispatch(addOnlineUser(id));
  });

  socket.on("remove-offline-user", (id) => {
    store.dispatch(removeOfflineUser(id));
  });

  socket.on("new-message", async (data) => {
    const { activeConversation, user } = store.getState();
    const { message, sender, recipientId, senderName } = data;

    await store.dispatch(setNewMessage(message, sender, recipientId));

    // If the new message is part of the user's active conversation, mark as read.
    if (activeConversation === senderName && user.id === recipientId) {
      store.dispatch(
        updateReadMessages({
          conversationId: message.conversationId,
          userId: user.id,
        })
      );
    }
  });

  socket.on("messages-read", (data) => {
    const { conversationId, userId } = data;
    // If this socket is received, the recipient sent a read receipt
    const recipientNotification = true;
    store.dispatch(
      updateMessages(conversationId, userId, recipientNotification)
    );
  });
});

export default socket;
