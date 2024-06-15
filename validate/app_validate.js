import {compare, hash} from 'bcrypt';

const isValidEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const isValidPassword = (password) => String(password).length >= 6;

const hashcodeData = async (data) => {
  try {
    return await hash(data, 10)
  } catch(e) {
    console.log(e)
    return null
  }
};

const compareHashcode =  async (data, encrypted) => {
  try {
    return await compare(data, encrypted)
  } catch(e) {
    return false
  }
}

export { isValidEmail, isValidPassword, hashcodeData, compareHashcode };
