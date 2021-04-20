export const handleEditorRefresh = (cm: any, forceUpdate = false) => {
  if (cm) {
    if (forceUpdate) {
      return cm.refresh();
    }

    if (cm && cm.display.wrapper.offsetHeight) {
      if (cm.display.lastWrapHeight !== cm.display.wrapper.clientHeight) {
        return cm.refresh();
      }
    }
  }
};
