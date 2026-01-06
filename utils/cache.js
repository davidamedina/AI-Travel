import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'ai_travel_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Generate a cache key from trip parameters
 * @param {Object} tripData - Trip data object
 * @returns {string} Cache key
 */
const generateCacheKey = (tripData) => {
  const key = `${tripData?.locationInfo?.name || ''}_${tripData?.totalNumOfDays || ''}_${tripData?.traveler?.title || ''}_${tripData?.budget || ''}`;
  return `${CACHE_PREFIX}${key.replace(/\s+/g, '_').toLowerCase()}`;
};

/**
 * Get cached trip plan if available and not expired
 * @param {Object} tripData - Trip data object
 * @returns {Promise<Object|null>} Cached trip plan or null
 */
export const getCachedTripPlan = async (tripData) => {
  try {
    const cacheKey = generateCacheKey(tripData);
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (!cachedData) {
      return null;
    }

    const { data, timestamp } = JSON.parse(cachedData);
    const now = Date.now();

    // Check if cache is expired
    if (now - timestamp > CACHE_EXPIRY) {
      // Remove expired cache
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    console.log('Cache hit for trip plan');
    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

/**
 * Cache trip plan with timestamp
 * @param {Object} tripData - Trip data object
 * @param {Object} tripPlan - Generated trip plan
 * @returns {Promise<void>}
 */
export const cacheTripPlan = async (tripData, tripPlan) => {
  try {
    const cacheKey = generateCacheKey(tripData);
    const cacheData = {
      data: tripPlan,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log('Trip plan cached successfully');
  } catch (error) {
    console.error('Error caching trip plan:', error);
    // Don't throw - caching is not critical
  }
};

/**
 * Clear all cached trip plans
 * @returns {Promise<void>}
 */
export const clearTripCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log(`Cleared ${cacheKeys.length} cached trip plans`);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
