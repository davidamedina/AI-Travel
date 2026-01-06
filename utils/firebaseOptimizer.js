import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'firebase_cache_';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes for Firebase queries

/**
 * Get cached Firebase query result
 * @param {string} cacheKey - Cache key
 * @returns {Promise<Array|null>} Cached data or null
 */
const getCachedQuery = async (cacheKey) => {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${cacheKey}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${cacheKey}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading Firebase cache:', error);
    return null;
  }
};

/**
 * Cache Firebase query result
 * @param {string} cacheKey - Cache key
 * @param {Array} data - Data to cache
 */
const cacheQuery = async (cacheKey, data) => {
  try {
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${cacheKey}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (error) {
    console.error('Error caching Firebase query:', error);
  }
};

/**
 * Optimized query for user trips with caching
 * @param {string} userEmail - User email
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Promise<Array>} Array of user trips
 */
export const getOptimizedUserTrips = async (userEmail, useCache = true) => {
  const cacheKey = `user_trips_${userEmail}`;

  // Try cache first
  if (useCache) {
    const cached = await getCachedQuery(cacheKey);
    if (cached) {
      console.log('Using cached user trips');
      return cached;
    }
  }

  try {
    // Optimized query with ordering and limit
    // Note: Requires composite index in Firebase Console:
    // Collection: UserTrip, Fields: userEmail (Ascending), createdAt (Descending)
    // If index doesn't exist, fallback to simple query without orderBy
    let q;
    try {
      q = query(
        collection(db, 'UserTrip'),
        where('userEmail', '==', userEmail),
        orderBy('createdAt', 'desc'),
        limit(50) // Limit results for better performance
      );
    } catch (indexError) {
      // Fallback if composite index doesn't exist
      console.warn('Composite index not found, using fallback query:', indexError.message);
      q = query(
        collection(db, 'UserTrip'),
        where('userEmail', '==', userEmail),
        limit(50)
      );
    }

    const querySnapshot = await getDocs(q);
    const trips = [];

    querySnapshot.forEach((doc) => {
      trips.push(doc.data());
    });

    // Sort manually if orderBy wasn't used (fallback case)
    if (trips.length > 0 && !trips[0].createdAt) {
      // If no createdAt field, just return as-is
    } else {
      trips.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order
      });
    }

    // Cache the results
    if (useCache) {
      await cacheQuery(cacheKey, trips);
    }

    return trips;
  } catch (error) {
    console.error('Error fetching user trips:', error);
    throw error;
  }
};

/**
 * Invalidate cache for user trips
 * @param {string} userEmail - User email
 */
export const invalidateUserTripsCache = async (userEmail) => {
  try {
    const cacheKey = `user_trips_${userEmail}`;
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${cacheKey}`);
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
};
