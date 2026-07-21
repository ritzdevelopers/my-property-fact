"use client";

let toastRef = null;

export function setToastRef(ref) {
  toastRef = ref;
}

function callToastRef(method, message, options = {}) {
  if (toastRef && typeof toastRef[method] === "function") {
    return toastRef[method](message, options);
  }
  console.warn(`Admin toast not initialized. Message: ${message}`);
  return null;
}

function createToast(type) {
  return (message, options = {}) => callToastRef(type, message, options);
}

const toast = (message, options) => callToastRef("info", message, options);

toast.success = createToast("success");
toast.error = createToast("error");
toast.warning = createToast("warning");
toast.info = createToast("info");
toast.loading = (message, options = {}) => callToastRef("loading", message, options);

toast.dismiss = (id) => {
  if (toastRef?.dismiss) {
    toastRef.dismiss(id);
  }
};
toast.update = (id, options = {}) => {
  if (toastRef?.update) {
    toastRef.update(id, options);
  }
};
toast.clearWaitingQueue = () => {};
toast.isActive = () => false;
toast.done = () => {};
toast.onChange = () => () => {};
toast.play = () => {};
toast.pause = () => {};

export { toast };
export default toast;
