import { FaMoneyBillWave, FaBalanceScale, FaGem } from 'react-icons/fa'; 

export const selectTravelersList = [
    {
      id: 1,
      title: "Just Me",
      desc: "A sole traveler in exploration",
      people: "1",
      icon: "🧍", // Use appropriate icon
    },
    {
      id: 2,
      title: "A Couple",
      desc: "Two travelers in tandem",
      people: "2 People",
      icon: "👫", // Use appropriate icon
    },
    {
      id: 3,
      title: "Family",
      desc: "A group of loving adventurers",
      people: "5 to 10 People",
      icon: "👩‍👦",
    },
    {
      id: 4,
      title: "Friends",
      desc: "A bunch of thrill seekers",
      people: "3 to 5 People",
      icon: "👯‍♂️", // Use appropriate icon
    }
  ];
  
  export const selectBudgetOption = [
    {
      id: 1,
      title: "Cheap",
      desc: "Stay conscious of cost",
      icon: "💸", 
    },
    {
      id: 2,
      title: "Moderate",
      desc: "Keep cost at an average level",
      icon: "⚖️", 
    },
    {
      id: 3,
      title: "Luxury",
      desc: "Don't worry about the cost",
      icon: "💎", 
    },
  ];

export const AI_PROMPT = 'Generate a comprehensive travel plan for the location: {location} for {totalDay} Days and {totalNight} Night for {traveler} with a {budget} budget. Return ONLY valid JSON (no markdown, no code blocks, no explanations). The JSON must have this exact structure: {"travel_plan": {"destination": "{location}"}, "trip": {"flights": [{"airline": "...", "flight_number": "...", "departure_city": "...", "departure_airport": "...", "arrival_city": "...", "arrival_airport": "...", "departure_date": "...", "departure_time": "...", "arrival_date": "...", "arrival_time": "...", "price": "...", "booking_url": "..."}], "hotels": [{"name": "...", "address": "...", "price": "...", "image_url": "...", "geo_coordinates": "lat,lng", "rating": number, "description": "...", "nearby_places": [{"name": "...", "details": "...", "image_url": "...", "geo_coordinates": "lat,lng", "ticket_pricing": "...", "time_to_travel": "..."}]}], "itinerary": [{"day": "Day 1", "time": "Morning", "activity": "...", "details": "...", "time_to_spend": "...", "best_time_to_visit": "..."}]}}. Ensure all fields are filled with realistic data. Return ONLY the JSON object.'

