import ElectronStore from "electron-store";
import { settingsStoreFileName } from "../constants";

interface SettingStore {
  settings: {
    proxy_setting: "none" | "autodetect" | "system" | "pac" | "proxy_server";
    pac_address?: string;
    proxy_host?: string;
    proxy_port?: string;
  };
}

export const store = new ElectronStore<SettingStore>({
  name: settingsStoreFileName
});
