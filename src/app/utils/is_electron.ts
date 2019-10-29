
export default !!((window && window['process'] && window['process'].versions['electron']) || window['ipc']);
