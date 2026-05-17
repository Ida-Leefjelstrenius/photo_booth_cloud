import { usePhoto, backgrounds } from "./PhotoContext";
import { mergeWithBackground } from "./useMerge";
import { styles, emailStyles, codeStyles, bgStyles, displayStyles } from "./styles";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { reuploadPhoto } from "./api";

const SERVER_URL = 'https://photobooth-production-0ce1.up.railway.app';

export default function ViewPicture() {
    const { mergedPhoto, setMergedPhoto, selectedBg, setSelectedBg, rawPhotoData } = usePhoto();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [currentCode, setCurrentCode] = useState(searchParams.get("code"));  // Store code in state
    const [remerging, setRemerging] = useState(false);
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [sendStatus, setSendStatus] = useState(null);
    
    const changeBg = async (index) => {
        if (!rawPhotoData) return;
        setSelectedBg(index);
        setRemerging(true);
        const dataUrl = await mergeWithBackground(rawPhotoData, index);
        setMergedPhoto(dataUrl);
        
        try {
            const newCode = await reuploadPhoto(dataUrl);
            setCurrentCode(newCode);  // Update the stored code
            navigate(`/view-picture?code=${newCode}`, { replace: true });  // Keep code in URL
        } catch (err) {
            console.error("Reupload failed:", err);
        }
        
        setRemerging(false);
    };
    
    const sendToEmail = async () => {
        if (!email || !email.includes('@')) {
            setSendStatus('Please enter a valid email address');
            return;
        }
        
        if (!currentCode) {
            setSendStatus('No photo code available');
            return;
        }
        
        setSending(true);
        setSendStatus(null);
        
        try {
            // Fetch the Cloudinary URL from the backend
            const photoResponse = await fetch(`${SERVER_URL}/download/${currentCode}`);
            
            if (!photoResponse.ok) {
                setSendStatus('Photo not found');
                setSending(false);
                return;
            }
            
            const photoData = await photoResponse.json();
            
            const response = await fetch(`${SERVER_URL}/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    photoUrl: photoData.url,  // Use Cloudinary URL
                    code: currentCode
                })
            });
            
            if (response.ok) {
                setSendStatus('Photo sent to your email!');
                setEmail('');
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                setSendStatus('Failed to send email. Please try again.');
            }
        } catch (err) {
            console.error('Send email error:', err);
            setSendStatus('Error sending email. Please try again.');
        }
        
        setSending(false);
    };
    
    const downloadPhoto = () => {
        const link = document.createElement("a");
        link.download = `photo-${currentCode || 'photo'}.png`;
        link.href = mergedPhoto;
        link.click();
    };
    
    return (
        <div style={styles.body}>
            <h1 style={{...displayStyles.heading, textAlign: 'center'}}>Your Photo</h1>
            
            {/* Background selector */}
            <div style={bgStyles.container}>
                <p style={bgStyles.label}>Try another background</p>
                <div style={bgStyles.grid}>
                    {backgrounds.map((bg, index) => (
                        <img
                            key={index}
                            src={bg.src}
                            alt={bg.name}
                            onClick={() => changeBg(index)}
                            style={{
                                ...bgStyles.thumbnail,
                                border: selectedBg === index
                                    ? "3px solid #FFD700"
                                    : "3px solid transparent",
                                opacity: remerging ? 0.5 : 1,
                            }}
                        />
                    ))}
                </div>
            </div>
            
            {remerging ? (
                <p>Applying background...</p>
            ) : mergedPhoto ? (
                <img src={mergedPhoto} alt="Merged photo" style={styles.media} />
            ) : (
                <p>No photo available.</p>
            )}
            
            {/* Email input section */}
            <div style={emailStyles.container}>
                <p style={emailStyles.label}>Get your photo by email:</p>
                <div style={emailStyles.inputGroup}>
                    <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={emailStyles.input}
                    />
                    <button 
                        style={styles.bigPrimaryButton}
                        onClick={sendToEmail}
                        disabled={sending}
                    >
                        {sending ? 'Sending...' : 'Send'}
                    </button>
                </div>
                {sendStatus && <p style={emailStyles.status}>{sendStatus}</p>}
            </div>
            
            <div style={styles.actionButtons}>
                <button style={styles.bigSecondaryButton} onClick={() => navigate("/")}>
                    Take Another Photo
                </button>
                <button style={styles.bigPrimaryButton} onClick={downloadPhoto}>
                    Download Picture 
                </button>
            </div>
        </div>
    );
}