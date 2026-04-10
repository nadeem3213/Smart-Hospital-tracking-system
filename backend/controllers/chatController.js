const Groq = require("groq-sdk");
const Hospital = require("../models/Hospital");

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);  
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return Math.round(R * c * 10) / 10; // 1 decimal
}

// @desc    Process chat message with Groq AI
// @route   POST /api/chat
// @access  Public
const processChat = async (req, res) => {
  try {
    const { message, history, userPos } = req.body;
    
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.length < 10) {
      return res.status(400).json({ reply: "SYSTEM ALERT: Groq API Key is missing or invalid in the backend .env" });
    }

    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const hospitals = await Hospital.find({});
      const hospitalContext = hospitals.map(h => {
        let distText = h.distance; // defaults to "0 km" normally
        if (userPos && userPos.length === 2 && h.lat && h.lng) {
          const realDist = getDistanceFromLatLonInKm(userPos[0], userPos[1], h.lat, h.lng);
          distText = `${realDist} km`;
        }
        return `- ${h.name}: ${h.type} hospital, Specializes in ${h.specialization}. ` +
               `Beds: ${h.icuBeds} ICU. Status: ${h.status}. Distance: ${distText}.`;
      }).join("\n");

      const systemPrompt = `You are an Emergency Medical Routing Assistant for the Smart Hospital Tracking System.
Your job is to triage the user's symptoms and recommend the best PRE-REGISTERED hospital from the list below. 
Be empathetic, concise, and prioritize hospitals with available ICU beds and relevant specializations.

Current Database of Hospitals:
${hospitalContext}

IMPORTANT ROUTING INSTRUCTION:
If you determine that the user needs to go to a specific hospital, you MUST conclude your message with a routing token exactly in this format on its own line:
[ROUTE: Hospital Name]`;

      const formattedMessages = [
        { role: "system", content: systemPrompt }
      ];

      if (history && history.length > 0) {
        history.forEach(msg => {
          formattedMessages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
        });
      }
      formattedMessages.push({ role: "user", content: message });

      const chatCompletion = await groq.chat.completions.create({
        messages: formattedMessages,
        model: "llama-3.3-70b-versatile", // Currently supported top-tier model
        temperature: 0.5,
      });

      const responseText = chatCompletion.choices[0]?.message?.content || "";

      return res.json({ reply: responseText });
    } catch (apiError) {
      console.error("Groq API failed:", apiError.message);
      return res.json({ reply: "SYSTEM ALERT: Groq AI Error - " + apiError.message });
    }
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ message: "Server error processing chat" });
  }
};

module.exports = {
  processChat,
};
