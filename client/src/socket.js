import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
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
    const state = store.getState();
    await store.dispatch(
      setNewMessage(data.message, data.sender, data.recipientId)
    );

    // If the new message is part of the user's active conversation, mark as read.
    if (
      state.activeConversation === data.message.conversationId &&
      state.user.id === data.recipientId
    ) {
      // This code isn't executing... however dispatching a state update will not update the server-side data
      // And reducers shouldn't have any side-effects like async API calls.
      await updateReadMessages({
        conversationId: state.activeConversation,
        userId: state.user.id,
      });
    }
  });
});

export default socket;
