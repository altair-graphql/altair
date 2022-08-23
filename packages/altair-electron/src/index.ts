import unhandled from "electron-unhandled";
import { ElectronApp } from "./app";

new ElectronApp();
unhandled({ showDialog: false });
