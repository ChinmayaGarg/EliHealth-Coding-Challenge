import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_upload_queue';

export const addToQueue = async (item: { uri: string; name: string }) => {
  const queue = await getQueue();
  queue.push(item);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const getQueue = async (): Promise<{ uri: string; name: string }[]> => {
  const data = await AsyncStorage.getItem(QUEUE_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearQueue = async () => {
  await AsyncStorage.removeItem(QUEUE_KEY);
};
