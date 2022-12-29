import { getDocs, query, where } from "firebase/firestore";
import { FirebaseUtilsContext, usersRef } from "./utils";

export const getUserByEmail = async (
  ctx: FirebaseUtilsContext,
  email: string
) => {
  const snapshots = await getDocs(
    query(usersRef(ctx.db), where("email", "==", email))
  );
  if (snapshots.empty) {
    return;
  }

  const snapshot = snapshots.docs[0];

  return {
    ...snapshot.data(),
    id: snapshot.id
  };
};
