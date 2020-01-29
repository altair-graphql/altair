export const handleEditorRefresh = (cm: any) => {
  if (cm) {
    setTimeout(() => {
      if (cm && cm.display.wrapper.offsetHeight) {
        if (cm.display.lastWrapHeight !== cm.display.wrapper.clientHeight) {
          cm.refresh();
        }
      }
    }, 50);
  }
};
