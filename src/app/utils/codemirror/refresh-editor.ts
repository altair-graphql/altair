export const handleEditorRefresh = (cm: any) => {
  if (cm) {
    if (cm.display.wrapper.offsetHeight) {
      if (cm.display.lastWrapHeight !== cm.display.wrapper.clientHeight) {
        console.log('changes', cm);
        cm.refresh();
      }
    }
  }
};
