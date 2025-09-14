import React, { useState } from 'react';

function BodyVisualization({ data, onUpdate }) {
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [currentView, setCurrentView] = useState('fullbody');
  const [bodyConditions, setBodyConditions] = useState(data.conditions || {});
  const [isZoomedView, setIsZoomedView] = useState(false);

  // Enhanced anatomy system with zoom capability and detailed parts
  const anatomyViews = {
    fullbody: {
      name: 'Full Body Overview',
      image: 'image/anatomy/full body 5 1303.png',
      canZoom: true,
      parts: [
        { id: 'head', name: 'Head', x: 46, y: 8, width: 8, height: 8, view: 'head' },
        { id: 'left_shoulder', name: 'Left Shoulder', x: 62, y: 20, width: 8, height: 8, view: 'shoulder' },
        { id: 'right_arm', name: 'Right Arm', x: 26, y: 30, width: 8, height: 8, view: 'arm' },
        { id: 'right_hand', name: 'Right Hand', x: 20, y: 52, width: 6, height: 8, view: 'front_hand' },
        { id: 'torso', name: 'Core Body', x: 46, y: 25, width: 8, height: 8, view: 'body_zoom' },
        { id: 'right_leg', name: 'Right Leg', x: 37, y: 60, width: 8, height: 8, view: 'leg' },
        { id: 'left_leg', name: 'Left Leg', x: 55, y: 60, width: 8, height: 8, view: 'leg' },
        { id: 'right_foot', name: 'Right Foot', x: 30, y: 94, width: 8, height: 8, view: 'front_feet' },
        { id: 'left_foot', name: 'Left Foot', x: 62, y: 94, width: 8, height: 8, view: 'front_feet' }
      ]
    },
    head: {
      name: 'Head & Facial Features',
      image: 'image/anatomy/head 13 6212.png',
      canZoom: false,
      detailedParts: [
        { id: 'forehead', name: 'Forehead', x: 50, y: 25, width: 8, height: 8 },
        { id: 'eyes', name: 'Eyes', x: 35, y: 39, width: 8, height: 8 },
        { id: 'nose', name: 'Nose', x: 50, y: 47, width: 8, height: 8 },
        { id: 'mouth', name: 'Mouth', x: 50, y: 59, width: 8, height: 8 },
        { id: 'jaw', name: 'Jaw', x: 50, y: 70, width: 8, height: 8 },
        { id: 'ears', name: 'Ears', x: 17, y: 48, width: 8, height: 8 },
        { id: 'neck', name: 'Neck', x: 47, y: 85, width: 8, height: 8 }
      ],
      conditions: ['Headaches', 'Vision', 'Hearing', 'Sinus', 'Jaw Pain', 'Neck Tension']
    },
    shoulder: {
      name: 'Left Shoulder Complex',
      image: 'image/anatomy/shoulder 14 5104.png',
      canZoom: false,
      detailedParts: [
        { id: 'clavicle', name: 'Clavicle', x: 30, y: 35, width: 8, height: 8 },
        { id: 'acromion', name: 'Acromion', x: 64, y: 39, width: 8, height: 8 },
        { id: 'deltoid', name: 'Deltoid', x: 85, y: 60, width: 8, height: 8 },
        { id: 'rotator_cuff', name: 'Rotator Cuff', x: 50, y: 50, width: 8, height: 8 },
        { id: 'scapula', name: 'Scapula', x: 35, y: 80, width: 8, height: 8 }
      ],
      conditions: ['Range of Motion', 'Strength', 'Pain Level', 'Stiffness', 'Injury History']
    },
    arm: {
      name: 'Right Arm Detail',
      image: 'image/anatomy/arm 15 6513.png',
      canZoom: false,
      detailedParts: [
        { id: 'bicep', name: 'Bicep', x: 39, y: 30, width: 8, height: 8, conditions: ['Muscle Strength', 'Flexibility', 'Pain Level', 'Fatigue', 'Range of Motion'] },
        { id: 'tricep', name: 'Tricep', x: 56, y: 31, width: 8, height: 8, conditions: ['Muscle Strength', 'Flexibility', 'Pain Level', 'Fatigue', 'Range of Motion'] },
        { id: 'forearm', name: 'Forearm', x: 40, y: 55, width: 8, height: 8, conditions: ['Muscle Strength', 'Grip Strength', 'Pain Level', 'Stiffness', 'Circulation'] },
        { id: 'elbow', name: 'Elbow', x: 51, y: 46, width: 8, height: 8, conditions: ['Joint Flexibility', 'Pain Level', 'Swelling', 'Range of Motion', 'Stiffness'] },
        { id: 'upper_arm', name: 'Upper Arm', x: 48, y: 20, width: 8, height: 8, conditions: ['Muscle Strength', 'Pain Level', 'Fatigue', 'Circulation', 'Nerve Function'] }
      ],
      conditions: ['Muscle Strength', 'Joint Flexibility', 'Tendon Health', 'Nerve Function', 'Circulation']
    },
    front_hand: {
      name: 'Right Hand Detail',
      image: 'image/anatomy/front hand 11 3451.png',
      canZoom: false,
      detailedParts: [
        { id: 'thumb', name: 'Thumb', x: 71, y: 40, width: 8, height: 8, conditions: ['Grip Strength', 'Flexibility', 'Pain Level', 'Joint Mobility', 'Dexterity'] },
        { id: 'index_finger', name: 'Index', x: 55, y: 18, width: 8, height: 8, conditions: ['Finger Dexterity', 'Joint Pain', 'Flexibility', 'Strength', 'Sensation'] },
        { id: 'middle_finger', name: 'Middle', x: 44, y: 14, width: 8, height: 8, conditions: ['Finger Dexterity', 'Joint Pain', 'Flexibility', 'Strength', 'Sensation'] },
        { id: 'ring_finger', name: 'Ring', x: 33, y: 18, width: 8, height: 8, conditions: ['Finger Dexterity', 'Joint Pain', 'Flexibility', 'Strength', 'Sensation'] },
        { id: 'pinky', name: 'Pinky', x: 23, y: 26, width: 8, height: 8, conditions: ['Finger Dexterity', 'Joint Pain', 'Flexibility', 'Strength', 'Sensation'] },
        { id: 'palm', name: 'Palm', x: 40, y: 55, width: 8, height: 8, conditions: ['Grip Strength', 'Pressure Sensitivity', 'Pain Level', 'Circulation', 'Muscle Fatigue'] },
        { id: 'wrist', name: 'Wrist', x: 35, y: 85, width: 8, height: 8, conditions: ['Joint Mobility', 'Carpal Tunnel', 'Pain Level', 'Stiffness', 'Range of Motion'] }
      ],
      conditions: ['Grip Strength', 'Finger Dexterity', 'Joint Pain', 'Carpal Tunnel', 'Circulation']
    },
    body_zoom: {
      name: 'Core Body (Torso)',
      image: 'image/anatomy/body zoom (without arms legs) 17 6665.png',
      canZoom: false,
      detailedParts: [
        { id: 'chest', name: 'Chest', x: 58, y: 42, width: 8, height: 8 },
        { id: 'upper_back', name: 'Upper Back', x: 46, y: 35, width: 8, height: 8 },
        { id: 'lower_back', name: 'Lower Back', x: 50, y: 58, width: 8, height: 8 },
        { id: 'abdomen', name: 'Abdomen', x: 42, y: 70, width: 8, height: 8 },
        { id: 'ribs', name: 'Ribs', x: 30, y: 57, width: 8, height: 8 }
      ],
      conditions: ['Core Strength', 'Posture', 'Breathing', 'Digestion', 'Back Health', 'Chest Health']
    },
    leg: {
      name: 'Right Leg Structure',
      image: 'image/anatomy/leg 16 4298.png', 
      canZoom: false,
      detailedParts: [
        { id: 'thigh', name: 'Thigh (Quadriceps)', x: 35, y: 15, width: 8, height: 8, conditions: ['Muscle Strength', 'Pain Level', 'Fatigue', 'Flexibility', 'Cramps'] },
        { id: 'knee', name: 'Knee Joint', x: 28, y: 39, width: 8, height: 8, conditions: ['Joint Pain', 'Swelling', 'Range of Motion', 'Stability', 'Stiffness'] },
        { id: 'calf', name: 'Calf', x: 55, y: 49, width: 8, height: 8, conditions: ['Muscle Strength', 'Cramps', 'Pain Level', 'Tightness', 'Circulation'] },
        { id: 'shin', name: 'Shin', x: 63, y: 65, width: 8, height: 8, conditions: ['Pain Level', 'Soreness', 'Shin Splints', 'Sensitivity', 'Swelling'] },
        { id: 'ankle', name: 'Ankle', x: 63, y: 77, width: 8, height: 8, conditions: ['Joint Mobility', 'Pain Level', 'Swelling', 'Stability', 'Range of Motion'] }
      ],
      conditions: ['Leg Strength', 'Knee Health', 'Thigh Muscles', 'Calf Muscles', 'Joint Mobility']
    },
    front_feet: {
      name: 'Foot Structure',
      image: 'image/anatomy/front feet 9 1185.png',
      canZoom: false,
      detailedParts: [
        { id: 'heel', name: 'Heel', x: 49, y: 75, width: 8, height: 8 },
        { id: 'arch', name: 'Arch', x: 47, y: 55, width: 8, height: 8 },
        { id: 'ball_of_foot', name: 'Ball of Foot', x: 52, y: 29, width: 8, height: 8 },
        { id: 'big_toe', name: 'Big Toe', x: 59, y: 13, width: 8, height: 8 },
        { id: 'other_toes', name: 'Other Toes', x: 38, y: 18, width: 8, height: 8 },
        { id: 'ankle_area', name: 'Ankle Area', x: 37, y: 50, width: 8, height: 8 }
      ],
      conditions: ['Balance', 'Arch Support', 'Toe Flexibility', 'Heel Pain', 'Circulation', 'Gait']
    },
    back_feet: {
      name: 'Back Foot View',
      image: 'image/anatomy/back feet 10 1512.png',
      canZoom: false,
      detailedParts: [
        { id: 'achilles', name: 'Achilles Tendon', x: 45, y: 70, width: 8, height: 8 },
        { id: 'heel_back', name: 'Heel (Back)', x: 40, y: 85, width: 8, height: 8 },
        { id: 'calf_lower', name: 'Lower Calf', x: 42, y: 50, width: 8, height: 8 }
      ],
      conditions: ['Achilles Health', 'Heel Stability', 'Calf Tension']
    },
    back_hand: {
      name: 'Back Hand View',
      image: 'image/anatomy/back hand 12 1417.png',
      canZoom: false,
      detailedParts: [
        { id: 'knuckles', name: 'Knuckles', x: 30, y: 25, width: 8, height: 8 },
        { id: 'hand_back', name: 'Back of Hand', x: 35, y: 45, width: 8, height: 8 },
        { id: 'wrist_back', name: 'Wrist (Back)', x: 38, y: 75, width: 8, height: 8 }
      ],
      conditions: ['Knuckle Health', 'Hand Flexibility', 'Wrist Mobility']
    }
  };

  const handleBodyPartClick = (part) => {
    if (anatomyViews[currentView].canZoom && part.view) {
      setCurrentView(part.view);
      setIsZoomedView(true);
      setSelectedBodyPart(null);
    } else {
      setSelectedBodyPart(part);
    }
  };

  const handleBackToFullBody = () => {
    setCurrentView('fullbody');
    setSelectedBodyPart(null);
    setIsZoomedView(false);
  };

  const updateCondition = (bodyPartId, condition, severity) => {
    const updated = {
      ...bodyConditions,
      [bodyPartId]: {
        ...bodyConditions[bodyPartId],
        [condition]: severity
      }
    };
    setBodyConditions(updated);
    onUpdate({ ...data, conditions: updated });
  };

  const getBodyPartStatus = (bodyPartId) => {
    const conditions = bodyConditions[bodyPartId] || {};
    const generalCondition = conditions.general || 1;
    
    // For main body parts in full body view, check if this part has detailed sub-parts
    if (currentView === 'fullbody') {
      const mainPart = anatomyViews.fullbody.parts.find(part => part.id === bodyPartId);
      if (mainPart && mainPart.view && anatomyViews[mainPart.view] && anatomyViews[mainPart.view].detailedParts) {
        // This main part has detailed sub-parts, aggregate their conditions
        const detailedParts = anatomyViews[mainPart.view].detailedParts;
        const detailedConditions = detailedParts.map(detailedPart => {
          const detailedCondition = bodyConditions[detailedPart.id]?.general || 1;
          return detailedCondition;
        });
        
        // If any detailed part has conditions, use the worst condition
        if (detailedConditions.length > 0) {
          const worstCondition = Math.max(...detailedConditions);
          if (worstCondition > generalCondition) {
            // Use the worst detailed condition for the main part color
            if (worstCondition === 1) return 'good';
            if (worstCondition === 2) return 'minor';
            if (worstCondition <= 3) return 'minor';
            if (worstCondition === 4) return 'moderate';
            return 'severe';
          }
        }
      }
    }
    
    // Default behavior for individual parts or when no detailed parts exist
    if (generalCondition === 1) return 'good';
    if (generalCondition === 2) return 'minor';
    if (generalCondition <= 3) return 'minor';
    if (generalCondition === 4) return 'moderate';
    return 'severe';
  };

  const currentViewData = anatomyViews[currentView];

  return (
    <div className="body-visualization">
      <div className="anatomy-header">
        <h2>🫀 Interactive Anatomy Tracker</h2>
        {isZoomedView && (
          <div className="zoom-navigation">
            <span className="current-view-title">{currentViewData.name}</span>
          </div>
        )}
      </div>

      {/* Enhanced instructions */}
      <div className="anatomy-instructions-enhanced">
        <h4>How to Use:</h4>
        <ul>
          {currentView === 'fullbody' ? (
            <>
              <li><strong>Click body parts</strong> to zoom into detailed view</li>
              <li><strong>Hover over parts</strong> to see health status colors</li>
              <li>🟢 Good | 🟡 Minor Issues | 🟠 Moderate | 🔴 Severe</li>
            </>
          ) : (
            <>
              <li><strong>Click detailed parts</strong> to assess conditions</li>
              <li><strong>Use condition sliders</strong> to rate severity (1-5)</li>
              <li><strong>Add notes</strong> for specific symptoms or pain locations</li>
            </>
          )}
        </ul>
      </div>

      <div className="anatomy-main-layout">
        <div className="anatomy-container">
          <div className="anatomy-image-container">
            {/* Back button overlay - top corner */}
            {isZoomedView && (
              <button className="back-to-full-body-overlay" onClick={handleBackToFullBody}>
                ← Back to Full Body
              </button>
            )}
            
            <img
              src={currentViewData.image}
              alt={currentViewData.name}
              className="anatomy-image"
            />
          
          {/* Render hotspots for current view */}
          {currentView === 'fullbody' ? (
            // Full body view with main parts
            currentViewData.parts.map((part) => (
              <button
                key={part.id}
                className={`anatomy-hotspot main-part ${getBodyPartStatus(part.id)}`}
                style={{
                  left: `${part.x}%`,
                  top: `${part.y}%`,
                  width: `${part.width}%`,
                  height: `${part.height}%`
                }}
                onClick={() => handleBodyPartClick(part)}
                title={`${part.name} - Click to zoom in`}
              >
                <span className="hotspot-label">{part.name}</span>
              </button>
            ))
          ) : (
            // Detailed view with specific parts
            currentViewData.detailedParts?.map((part) => (
              <button
                key={part.id}
                className={`anatomy-hotspot detailed-part ${getBodyPartStatus(part.id)} ${
                  selectedBodyPart?.id === part.id ? 'selected' : ''
                }`}
                style={{
                  left: `${part.x}%`,
                  top: `${part.y}%`,
                  width: `${part.width}%`,
                  height: `${part.height}%`
                }}
                onClick={() => handleBodyPartClick(part)}
                title={`${part.name} - Click to assess`}
              >
                <span className="hotspot-label">{part.name}</span>
              </button>
            ))
          )}

          {/* Popup Assessment Panel - Inside Image Frame */}
          {selectedBodyPart && (
            <div className="assessment-popup-overlay">
              <div className="assessment-popup">
                <div className="popup-header">
                  <h3>🔍 Assess: {selectedBodyPart.name}</h3>
                  <button 
                    className="close-popup-btn"
                    onClick={() => setSelectedBodyPart(null)}
                    title="Close assessment"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Available conditions for this specific body part */}
                {selectedBodyPart.conditions && (
                  <div className="popup-conditions-list">
                    {selectedBodyPart.conditions.map((condition) => (
                      <div key={condition} className="popup-condition-item">
                        <label className="popup-condition-label">{condition}:</label>
                        <div className="popup-condition-slider-container">
                          <span className="popup-slider-label left">Normal</span>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={bodyConditions[selectedBodyPart.id]?.[condition] || 1}
                            onChange={(e) => updateCondition(selectedBodyPart.id, condition, parseInt(e.target.value))}
                            className="popup-condition-slider"
                          />
                          <span className="popup-slider-label right">Damaged</span>
                        </div>
                        <div className="popup-severity-indicator">
                          Severity: {bodyConditions[selectedBodyPart.id]?.[condition] || 1}/5
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Enhanced notes section */}
                <div className="popup-notes-section">
                  <label className="popup-notes-label">📝 Detailed Notes & Pain Zones:</label>
                  <textarea
                    placeholder="Describe specific symptoms, pain location, triggers, duration, or any relevant details..."
                    value={bodyConditions[selectedBodyPart.id]?.notes || ''}
                    onChange={(e) => updateCondition(selectedBodyPart.id, 'notes', e.target.value)}
                    className="popup-notes-textarea"
                    rows="3"
                  />
                </div>

                {/* Quick severity assessment */}
                <div className="popup-quick-assessment">
                  <label className="popup-condition-label">Overall Condition:</label>
                  <div className="popup-condition-slider-container">
                    <span className="popup-slider-label left">Normal</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={bodyConditions[selectedBodyPart.id]?.general || 1}
                      onChange={(e) => updateCondition(selectedBodyPart.id, 'general', parseInt(e.target.value))}
                      className="popup-condition-slider main-slider"
                    />
                    <span className="popup-slider-label right">Damaged</span>
                  </div>
                  <div className="popup-severity-indicator main">
                    Overall: {bodyConditions[selectedBodyPart.id]?.general || 1}/5
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Body Condition Summary Panel */}
        <div className="body-condition-summary-panel">
          <h4>🫀 Body Condition Overview</h4>
          <div className="condition-summary-grid">
            {(currentView === 'fullbody' ? currentViewData.parts : currentViewData.detailedParts || []).map((part) => {
              const status = getBodyPartStatus(part.id);
              const statusEmoji = {
                'good': '🟢',
                'minor': '🟡', 
                'moderate': '🟠',
                'severe': '🔴'
              }[status] || '⚪';
              const condition = bodyConditions[part.id]?.general || 1;
              
              return (
                <div key={part.id} className={`condition-summary-item ${status}`}>
                  <div className="condition-item-header">
                    <span className="condition-emoji">{statusEmoji}</span>
                    <span className="condition-name">{part.name}</span>
                  </div>
                  <div className="condition-severity">
                    <span className="severity-value">{condition}/5</span>
                    <div className="severity-bar">
                      <div 
                        className={`severity-fill ${status}`}
                        style={{ width: `${(condition / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  {bodyConditions[part.id]?.notes && (
                    <div className="condition-notes">
                      📝 {bodyConditions[part.id].notes.substring(0, 50)}
                      {bodyConditions[part.id].notes.length > 50 ? '...' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default BodyVisualization;
