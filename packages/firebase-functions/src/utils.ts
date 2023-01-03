import { DocumentReference } from 'firebase-admin/firestore';
export const getDocument = async <T extends { id: string }>(
  ref: DocumentReference
): Promise<T | undefined> => {
  const sn = await ref.get();

  const data = sn.data() as T;
  if (!data) {
    return;
  }

  return {
    ...data,
    id: sn.id,
  };
};
