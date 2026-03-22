/* global google */
export const initializeGoogle = (callback) => {
  if (window.google && !window.google._initialized) {
    google.accounts.id.initialize({
      client_id: "1659854909-ot1fb6idch1rraokqd2enregomv71j7h.apps.googleusercontent.com",
      callback: callback,
    });
    window.google._initialized = true; // Custom flag to prevent double-init
  }
};

export const renderGoogleButton = (divId) => {
  const rootDiv = document.getElementById(divId);
  if (rootDiv && window.google) {
    google.accounts.id.renderButton(rootDiv, {
      theme: "outline",
      size: "large",
      shape: "pill",
      width: "380",
    });
  }
};