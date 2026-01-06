import { StyleSheet, Text, View, FlatList } from 'react-native';
import React from 'react';

// Define how each activity should be rendered
const renderActivity = ({ item }) => (
  <View style={styles.activity}>
    <Text style={styles.activityTitle}>{item.activity}</Text>
    <Text>Time: {item.time} ({item.time_to_spend})</Text>
    <Text>Details: {item.details}</Text>
    <Text>Best Time to Visit: {item.best_time_to_visit}</Text>
  </View>
);

const PlannedTrip = ({ details }) => {
  console.log("details from plan trip", details);

  if (!details || (Array.isArray(details) && details.length === 0)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🏕️ Plan Details</Text>
        <Text style={styles.para}>No itinerary available.</Text>
      </View>
    );
  }

  // Handle array format (itinerary array)
  if (Array.isArray(details)) {
    // Group by day
    const groupedByDay = details.reduce((acc, item) => {
      const day = item.day || 'Day 1';
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(item);
      return acc;
    }, {});

    return (
      <View style={styles.container}>
        <Text style={styles.title}>🏕️ Plan Details</Text>
        {Object.entries(groupedByDay).map(([day, activities], index) => (
          <View key={index} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{day}</Text>
            <FlatList
              data={activities}
              renderItem={renderActivity}
              keyExtractor={(item, idx) => `${day}-${idx}`}
            />
          </View>
        ))}
      </View>
    );
  }

  // Handle object format (if it's already grouped by day)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏕️ Plan Details</Text>
      {Object.entries(details).map(([day, activities], index) => (
        <View key={index} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
          <FlatList
            data={Array.isArray(activities) ? activities : [activities]}
            renderItem={renderActivity}
            keyExtractor={(item, idx) => `${day}-${idx}`}
          />
        </View>
      ))}
    </View>
  );
};

export default PlannedTrip;

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Outfit-Bold',
    fontSize: 20,
    marginBottom: 10,
  },
  container: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activity: {
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  para: {
    fontFamily: 'Outfit',
    fontSize: 17,
    color: '#777',
  },
});
