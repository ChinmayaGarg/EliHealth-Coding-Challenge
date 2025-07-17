import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Snackbar } from 'react-native-paper';
import { API_URL } from '../config';
import NetInfo from '@react-native-community/netinfo';

type HistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'History'
>;

type Submission = {
  id: number;
  qrCode: string;
  status: string;
  filename: string;
  created_at: string;
  imageUrl: string;
};

const HistoryScreen = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const [data, setData] = useState<Submission[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const response = await axios.get<Submission[]>(`${API_URL}/test-strips/history`);
      setData(response?.data);
    } catch (error) {
      // console.error('Failed to fetch history:', error);
      if ((error  as any)?.response?.status === 404) {
        Alert.alert('History not found', 'No tests uploaded yet.');
      } else {
        Alert.alert('Error', 'Could not load test strip history.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = useCallback(async() => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      setLoading(false);
      console.log('Offline — skipping history fetch');
      return;
    }
    setRefreshing(true);
    fetchHistory().then(() => {
        setSnackbarVisible(true);
    });
  }, []);

  const renderItem = ({ item }: { item: Submission }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
      <View style={styles.details}>
        <Text style={styles.qrCode}>QR Code: {item.qrCode || 'N/A'}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>
        <Text style={styles.timestamp}>Date: {new Date(item.created_at).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : data.length === 0 ? (
        <Text style={styles.message}>No submissions found.</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.backText}>← Back to Camera</Text>
      </TouchableOpacity>
      <Snackbar
  visible={snackbarVisible}
  onDismiss={() => setSnackbarVisible(false)}
  duration={3000}
  action={{
    label: 'Dismiss',
    onPress: () => setSnackbarVisible(false),
  }}
>
  History refreshed!
</Snackbar>
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  qrCode: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    paddingTop: 40,
    color: '#666',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
});
