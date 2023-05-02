import { Bytes } from '@graphprotocol/graph-ts';

function getRandomId(length: number): Bytes {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    let randomNumber = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(<i32>randomNumber);
    counter += 1;
  }
  return Bytes.fromUTF8(result);
}

export default getRandomId;
