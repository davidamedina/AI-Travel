import { StyleSheet, Text, View, Image, Alert, ActivityIndicator } from 'react-native';
import { useEffect, useContext, useState } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { CreateTripContext } from '../../context/CreateTripContext';
import { Colors } from './../../constants/Colors';
import { AI_PROMPT } from './../../constants/data';
import { generateTravelPlan } from './../../config/AiModel';
import { auth, db } from './../../config/FirebaseConfig';
import { setDoc, doc } from 'firebase/firestore';

const GenerateTrip = () => {
  const user = auth.currentUser;
  const { tripData } = useContext(CreateTripContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    // Prevent going back during generation
    navigation.addListener('beforeRemove', (e) => {
      if (loading) {
        e.preventDefault();
        Alert.alert(
          'Generation in Progress',
          'Please wait while we generate your trip plan.',
          [{ text: 'OK' }]
        );
      }
    });

    // Start generation when component mounts
    if (tripData?.locationInfo?.name && tripData?.totalNumOfDays && tripData?.traveler?.title && tripData?.budget) {
      generateAiTrip();
    } else {
      setError('Missing trip information. Please go back and complete all steps.');
      setLoading(false);
    }

    return () => {
      navigation.removeListener('beforeRemove');
    };
  }, []);

  const generateAiTrip = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required data
      if (!tripData?.locationInfo?.name) {
        throw new Error('Destination is required');
      }
      if (!tripData?.totalNumOfDays) {
        throw new Error('Travel duration is required');
      }
      if (!tripData?.traveler?.title) {
        throw new Error('Traveler type is required');
      }
      if (!tripData?.budget) {
        throw new Error('Budget is required');
      }

      // Build the prompt with all replacements
      let FINAL_PROMPT = AI_PROMPT
        .replace(/{location}/g, tripData.locationInfo.name || 'Unknown')
        .replace(/{totalDay}/g, tripData.totalNumOfDays?.toString() || '3')
        .replace(/{totalNight}/g, (tripData.totalNumOfDays - 1)?.toString() || '2')
        .replace(/{traveler}/g, tripData.traveler?.title || 'Traveler')
        .replace(/{budget}/g, tripData.budget || 'Moderate');

      console.log('Generating trip with prompt:', FINAL_PROMPT.substring(0, 100) + '...');

      // Generate the travel plan using the AI model
      let tripResponse = await generateTravelPlan(FINAL_PROMPT);
      
      console.log('Trip generated successfully:', tripResponse);

      // Validate the response structure
      if (!tripResponse || typeof tripResponse !== 'object') {
        throw new Error('Invalid response format from AI');
      }

      // Ensure the response has the correct structure
      // If the AI returns just the trip object, wrap it properly
      if (tripResponse.trip && !tripResponse.travel_plan) {
        tripResponse = {
          travel_plan: {
            destination: tripData.locationInfo.name
          },
          trip: tripResponse.trip
        };
      } else if (!tripResponse.trip && !tripResponse.travel_plan) {
        // If AI returns a different structure, try to adapt it
        tripResponse = {
          travel_plan: {
            destination: tripData.locationInfo.name
          },
          trip: {
            flights: tripResponse.flights || [],
            hotels: tripResponse.hotels || [],
            itinerary: tripResponse.itinerary || []
          }
        };
      }

      // Validate required fields exist
      if (!tripResponse.travel_plan || !tripResponse.trip) {
        throw new Error('AI response missing required structure');
      }

      // Ensure user is authenticated
      if (!user || !user.email) {
        throw new Error('User not authenticated');
      }

      // Save trip data to Firebase
      const docId = Date.now().toString();
      await setDoc(doc(db, 'UserTrip', docId), {
        userEmail: user.email,
        tripPlan: tripResponse,
        tripData: JSON.stringify(tripData),
        docId: docId,
        createdAt: new Date().toISOString(),
      });

      setLoading(false);
      
      // Navigate to MyTrip page
      router.replace('/MyTrip');
    } catch (error) {
      console.error('Error generating trip:', error);
      setError(error.message || 'Failed to generate trip. Please try again.');
      setLoading(false);
      
      // Show error alert
      Alert.alert(
        'Generation Failed',
        error.message || 'Failed to generate your trip plan. Please check your internet connection and try again.',
        [
          {
            text: 'Go Back',
            onPress: () => router.back(),
          },
          {
            text: 'Retry',
            onPress: () => generateAiTrip(),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please Wait .........</Text>
      <Text style={styles.paragraph}>We are working on generating your dream Trip</Text>
      
      {loading && (
        <View style={styles.imageContainer}>
          <Image 
            source={require('./../../assets/images/plane.gif')} 
            style={styles.image} 
            resizeMode="contain"
          />
          <ActivityIndicator 
            size="large" 
            color={Colors.primary} 
            style={{ marginTop: 20 }}
          />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {loading && (
        <Text style={styles.paragraph}>Don't go back.</Text>
      )}
    </View>
  );
};

export default GenerateTrip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 85,
    padding: 25,
  },
  title: {
    fontFamily: 'Outfit-Bold',
    fontSize: 30,
    textAlign: 'center',
    marginTop: 10,
  },
  paragraph: {
    fontFamily: 'Outfit-Medium',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '70%',
    height: 200,
  },
  paragraphGray: {
    fontFamily: 'Outfit',
    fontSize: 20,
    color: Colors.gray,
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 10,
  },
  errorText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 16,
    color: '#c62828',
    textAlign: 'center',
  },
});
