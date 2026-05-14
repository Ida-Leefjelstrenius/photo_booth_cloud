import { useEffect, useState } from "react";
import { displayStyles, styles } from "./styles";
import { getLatestPhoto } from "./api";

const SERVER_URL = "https://photobooth-production-0ce1.up.railway.app";
const WS_URL = "wss://photobooth-production-0ce1.up.railway.app";  // wss instead of ws

export default function Display() {
  const [photo, setPhoto] = useState(null);
  
  useEffect(() => {
    getLatestPhoto().then(data => {
      if (data) {
        setPhoto(data.url.startsWith('http') ? data.url : `${SERVER_URL}${data.url}`);
      }
    });
    
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPhoto(data.url.startsWith('http') ? data.url : `${SERVER_URL}${data.url}`);
    };
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
    return () => ws.close();
  }, []);
  
  return (
    <div style={displayStyles.container}>
    <h1 style={displayStyles.heading}>The most recent photo:</h1>
    {!photo ? (
      <p style={displayStyles.noPhoto}>No photo taken yet</p>
    ) : (
      <div style={displayStyles.content}>
      <img src={photo} alt="Latest photo" style={displayStyles.photo} />
      </div>
    )}
    </div>
  );
}