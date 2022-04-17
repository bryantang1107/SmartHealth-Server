const users = [];

export const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const user = { id, username, room };
  users.push(user);
  return { user };
};

export const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    //if user exist in array
    //-1 means no match found
    return users.splice(index, 1)[0]; //remove user from users array
  }
};

export const getUser = (id) => users.find((user) => user.id === id);

export const getUsersInRoom = (room) =>
  users.filter((user) => user.room === room);
