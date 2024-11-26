import { isValidUsername } from "6pp"; // Ensure this is the correct path and function

export const usernameValidator = (username) => {
  if (!isValidUsername(username)) {
    return "Username is Invalid"; // Return a string instead of an object
  }
  return null; // No error
};
