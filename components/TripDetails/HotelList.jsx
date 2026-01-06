import { StyleSheet, Text, View, FlatList,Image } from 'react-native'
import React from 'react'

const HotelList = ({ hotelList }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏨 Hotel Recommendation</Text>
      <FlatList style={styles.hotelItem}
        data={hotelList}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{marginRight:20,width:180}}>
            {item.image_url ? (
              <Image 
                source={{ uri: item.image_url }} 
                style={styles.image}
                defaultSource={require('./../../assets/images/travel.jpg')}
              />
            ) : (
              <Image 
                source={require('./../../assets/images/travel.jpg')} 
                style={styles.image} 
              />
            )}
            <View>
                <Text style={styles.hotelName}>{item.name}</Text>
                <Text style={styles.hotelAddress}>{item.address}</Text>
                <View style={styles.flexContainer}>
                    <Text style={{fontFamily:'Outfit'}}>🌟 {item.rating || 'N/A'}</Text>
                    <Text style={{fontFamily:'Outfit'}}>💰 {item.price}</Text>
                </View> 
            </View>
          </View>
        )}
      />
    </View>
  )
}

export default HotelList

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontFamily: 'Outfit-Bold',
    fontSize: 20,
    marginBottom: 10,
  },
  hotelItem: {
    marginTop:8
  },
  hotelName: {
    fontFamily: 'Outfit-Medium',
    fontSize: 17,
  },
  hotelAddress: {
    fontFamily: 'Outfit-Light',
    fontSize: 14,
    color: '#777',
  },
  image:{
    width:180,
    height:120,
    borderRadius:15
  },
  flexContainer:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-around',
    gap:5
  }
})
