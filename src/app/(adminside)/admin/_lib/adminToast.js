"use client";

let toastRef = null;

export function setToastRef(ref) {
  toastRef = ref;
}

function createToast(type) {
  return (message, options = {}) => {
    if (toastRef) {
      return toastRef[type](message, options);
    }
    console.warn(`Admin toast not initialized. Message: ${message}`);
    return null;
  };
}

const toast = (message, options) => {
  if (toastRef) {
    return toastRef.info(message, options);
  }
  console.warn(`Admin toast not initialized. Message: ${message}`);
  return null;
};

toast.success = createToast("success");
toast.error = createToast("error");
toast.warning = createToast("warning");
toast.info = createToast("info");

toast.dismiss = () => {};
toast.clearWaitingQueue = () => {};
toast.isActive = () => false;
toast.update = () => {};
toast.done = () => {};
toast.onChange = () => () => {};
toast.play = () => {};
toast.pause = () => {};

export { toast };
export default toast;
