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

      // await axios.put("/api/messages", {
      //   conversationId: message.conversationId,
      //   userId: user.id,
      //   activeConversation: true,
      // });
      // await store.dispatch(updateMessages(message.conversationId, user.id));
      // notifyMessagesRead();
    }
  });

  socket.on("messages-read", (data) => {
    console.log("hello from socket :: messages read");
    console.log(data);
    const { conversationId, userId, lastReadMessage } = data;
    const recipientNotification = true;
    console.log(userId);
    store.dispatch(
      updateMessages(
        conversationId,
        userId,
        recipientNotification,
        lastReadMessage
      )
    );
    // break
  });
});

export default socket;
