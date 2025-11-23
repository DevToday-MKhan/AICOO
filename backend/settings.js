const config = {
  storeName: "",
  notificationEmail: "",
};

const Settings = {
  getSettings() {
    console.log("getSettings called");
    return config;
  },

  updateSettings(newConfig) {
    console.log("updateSettings called", newConfig);
  },
};

export default Settings;
