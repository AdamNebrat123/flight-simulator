// convert's in a specific structure that the server expects.
// type : msgType
// data : msg
export function prepareMessageToServer(msgType, msg) {
  return JSON.stringify({
    type: msgType,
    data: msg
  });
}