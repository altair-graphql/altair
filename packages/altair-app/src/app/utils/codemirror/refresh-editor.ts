export const handleEditorRefresh = (cm: any) => {
  if (cm) {
    if (cm && cm.display.wrapper.offsetHeight) {
      if (cm.display.lastWrapHeight !== cm.display.wrapper.clientHeight) {
        cm.refresh();
      }
    }
  }
};
