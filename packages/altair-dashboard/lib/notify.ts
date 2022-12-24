import { showNotification } from "@mantine/notifications";

export const notify = {
  success(message: string) {
    showNotification({
      color: "green",
      message
    });
  },
  error(message: string) {
    showNotification({
      color: "red",
      message
    });
  }
};
