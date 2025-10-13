import * as webpush from 'web-push';

const vapidKeys = {
  publicKey: 'BDzuk_ZfPRI35ntZhosL6y7uCtje2I6D6oXVufJLcOMYT__Zr5gIGhIl-WMcA08ahCMbfwyXfpEDOLVYIXNW37c',
  
}
console.log(vapidKeys);

const pubKeyBytes = Buffer.from(vapidKeys.publicKey, 'base64');
const x = pubKeyBytes.slice(1, 33).toString('base64url');
const y = pubKeyBytes.slice(33).toString('base64url');
console.log({ x, y })