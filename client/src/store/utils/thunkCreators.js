import axios from "axios";
import socket from "../../socket";
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setSearchedUsers,
  updateMessages,
} from "../conversations";
import { gotUser, setFetchingStatus } from "../user";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// USER THUNK CREATORS

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    if (data.id) {
      socket.emit("go-online", data.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const logout = (id) => async (dispatch) => {
  try {
    await axios.delete("/auth/logout");
    await localStorage.removeItem("messenger-token");
    dispatch(gotUser({}));
    socket.emit("logout", id);
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

export const fetchConversations = () => async (dispatch, getState) => {
  try {
    const { user } = getState();
    console.log("state", user);
    const { data } = await axios.get("/api/conversations");
    // Sort the messages in each conversation before setting state.
    console.log("fetchConversations data", data);

    data.forEach((conversation) => {
      conversation.messages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      const unreadMessages = conversation.messages.filter((message) => {
        const { read, senderId } = message;
        // console.log("message", message)
        return !read && senderId !== user.id;
      });
      conversation.lastReadMessage = unreadMessages;
      conversation.unreadCount = unreadMessages.length;
      // console.log("unread messages", unreadMessages)
      // console.log("conversation", conversation)
    });
    console.log("data", data);
    dispatch(gotConversations(data));
  } catch (error) {
    console.error(error);
  }
};

const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const sendMessage = (data, body) => {
  socket.emit("new-message", {
    message: data.message,
    recipientId: body.recipientId,
    sender: data.sender,
    senderName: body.senderName,
  });
};

export const notifyMessagesRead = (body) => {
  const { conversationId, userId, lastReadMessage } = body;
  socket.emit("messages-read", {
    conversationId,
    userId,
    lastReadMessage,
  });
};

// format of body: {conversationId, userId}
export const updateReadMessages = (body) => async (dispatch) => {
  console.log("=== thunk read:", body);
  try {
    const { data } = await axios.put("/api/messages", body);
    console.log("=== data", data);
    dispatch(updateMessages(body.conversationId, body.userId));

    notifyMessagesRead({
      conversationId: body.conversationId,
      userId: body.userId,
      lastReadMessage: data.lastReadMessage,
    });
  } catch (error) {
    console.error(error);
  }
};

// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage = (body) => async (dispatch) => {
  try {
    const data = await saveMessage(body);

    if (!body.conversationId) {
      dispatch(addConversation(body.recipientId, data.message));
    } else {
      dispatch(setNewMessage(data.message, data.sender));
    }

    sendMessage(data, body);
  } catch (error) {
    console.error(error);
  }
};

export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};
