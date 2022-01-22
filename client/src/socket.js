import io from "socket.io-client";
import axios from 'axios';
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
  updateMessages
} from "./store/conversations";

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
    const { message, sender, recipientId, senderName } = data

    await store.dispatch(
      setNewMessage(message, sender, recipientId)
    );

    // If the new message is part of the user's active conversation, mark as read.
    if (
      activeConversation === senderName &&
      user.id === recipientId
    ) {
      await axios.put("/api/messages", { conversationId: message.conversationId, userId: user.id });
      await store.dispatch(updateMessages(message.conversationId, user.id))
    }
  });
});

export default socket;
