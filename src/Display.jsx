import { useEffect, useState } from "react";
import { displayStyles, styles, infoStyles } from "./styles";
import { getLatestPhoto } from "./api";

const SERVER_URL = "https://photobooth-production-0ce1.up.railway.app";
const WS_URL = "wss://photobooth-production-0ce1.up.railway.app";

export default function Display() {
  const [photo, setPhoto] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  
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
      <h1 style={displayStyles.heading}>The most recent photo</h1>
      
      {!photo ? (
        <p style={displayStyles.noPhoto}>No photo taken yet</p>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <img src={photo} alt="Latest photo" style={displayStyles.photo} />
          
          <button 
            style={{...infoStyles.infoButton, marginTop: '20px'}}
            onClick={() => setShowInfo(!showInfo)}
            title="Storage information"
          >
            ℹ️
          </button>
        </div>
      )}
      
      {showInfo && (
        <div style={{...infoStyles.infoBox, position: 'absolute', bottom: '40px', zIndex: 10}}>
          <h3 style={infoStyles.infoTitle}>Photo Storage Information</h3>
          <p style={infoStyles.infoText}>
            🔒 Photos are kept for 48 hours and then automatically deleted.
          </p>
          <button 
            style={infoStyles.closeButton}
            onClick={() => setShowInfo(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}