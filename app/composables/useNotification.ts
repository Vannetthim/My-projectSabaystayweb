import { collection, addDoc, serverTimestamp, type Firestore } from "firebase/firestore";
import { useNuxtApp } from "#imports";

export const useNotification = () => {
  const { $db } = useNuxtApp();
  const db = $db as Firestore | undefined;

  const sendNotification = async (recipientId: string, title: string, message: string) => {
    if (!db || !recipientId) return false;

    try {
      await addDoc(collection(db, "notifications"), {
        recipientId,
        title,
        message,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    }
  };

  return {
    sendNotification,
  };
};