
export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error?.response) {
    return "We could not reach the server. Check your connection and try again.";
  }
  const message = error.response.data?.message;
  if (typeof message === "string" && message.trim() && message.length < 300 && !/\bat\s+[\w$.]+\(/.test(message)) {
    return message;
  }
  return fallback;
}
