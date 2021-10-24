export default !!((window && (window as any).process && (window as any).process.versions.electron) || (window as any).ipc);
