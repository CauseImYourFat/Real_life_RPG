import React, { useState, useEffect } from 'react';

// Standalone TamagotPage: does not sync with global app state or backend
function TamagotPage() {
  // Local state only
  const [pets, setPets] = useState(() => JSON.parse(localStorage.getItem('tamagot_pets')) || []);
  const [food, setFood] = useState(() => JSON.parse(localStorage.getItem('tamagot_food')) || []);
  const [gneePoints, setGneePoints] = useState(() => Number(localStorage.getItem('tamagot_gneePoints')) || 0);
  const [currentMascot, setCurrentMascot] = useState(() => localStorage.getItem('tamagot_currentMascot') || null);
  const [shopOpen, setShopOpen] = useState(false);
  const [hiveOpen, setHiveOpen] = useState(false);
  const [buffs, setBuffs] = useState(() => JSON.parse(localStorage.getItem('tamagot_buffs')) || []);
  const [healthPercent, setHealthPercent] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist local state to localStorage
  useEffect(() => {
    localStorage.setItem('tamagot_pets', JSON.stringify(pets));
    localStorage.setItem('tamagot_food', JSON.stringify(food));
    localStorage.setItem('tamagot_gneePoints', gneePoints);
    localStorage.setItem('tamagot_currentMascot', currentMascot);
    localStorage.setItem('tamagot_buffs', JSON.stringify(buffs));
  }, [pets, food, gneePoints, currentMascot, buffs]);

  // Shop: buy pet/food
  const handleBuyPet = (petType) => {
    if (gneePoints < 30) return setError('Not enough Gnee! points');
    setPets([...pets, petType]);
    setGneePoints(gneePoints - 30);
    setError(null);
  };
  const handleBuyFood = (foodType) => {
    if (gneePoints < 1) return setError('Not enough Gnee! points');
    setFood([...food, { type: foodType }]);
    setGneePoints(gneePoints - 1);
    setError(null);
  };

  // Hive: sell item
  const handleSellItem = (itemType, index) => {
    if (itemType === 'pet') {
      setPets(pets.filter((_, i) => i !== index));
      setGneePoints(gneePoints + 15); // 50% resale
    } else {
      setFood(food.filter((_, i) => i !== index));
      setGneePoints(gneePoints + 0.5);
    }
    setError(null);
  };

  // Buff: use food
  const handleUseFood = (foodIndex) => {
    setBuffs([...buffs, { type: 'xp', value: 20, duration: 12 }]);
    setFood(food.filter((_, i) => i !== foodIndex));
    setError(null);
  };

  // Health impact (local only)
  const getPetPerformance = () => {
    if (healthPercent < 100) {
      return `Pet performance reduced by ${100 - healthPercent}%`;
    }
    return 'Pet performance normal';
  };

  // UI
  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 64 }}>Loading Tamagotchi...</div>;
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#222', color: '#fff', borderRadius: 16, padding: 32 }}>
      <h2 style={{ color: '#ffd700', textAlign: 'center', marginTop: 0 }}>Tamagotchi Game (Standalone)</h2>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <span style={{ fontWeight: 600 }}>Gnee! Points:</span> <span style={{ color: '#ffd700', fontWeight: 700 }}>{gneePoints}</span>
        <button onClick={() => setShopOpen(true)} style={{ marginLeft: 24, background: '#ffd700', color: '#222', borderRadius: 8, padding: '4px 16px', fontWeight: 600, cursor: 'pointer' }}>Open Shop</button>
        <button onClick={() => setHiveOpen(true)} style={{ marginLeft: 12, background: '#00d4aa', color: '#fff', borderRadius: 8, padding: '4px 16px', fontWeight: 600, cursor: 'pointer' }}>Open Hive</button>
      </div>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontWeight: 600 }}>Current Mascot:</span> <span style={{ color: '#ffd700', fontWeight: 700 }}>{currentMascot || 'None'}</span>
        <span style={{ marginLeft: 24 }}>{getPetPerformance()}</span>
      </div>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontWeight: 600 }}>Buffs:</span> {buffs.length === 0 ? 'None' : buffs.map((buff, i) => <span key={i} style={{ color: '#ffd700', marginLeft: 8 }}>{buff.type} +{buff.value}% ({buff.duration}h)</span>)}
      </div>
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 16 }}>{error}</div>}
      {/* Shop Modal */}
      {shopOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#222', padding: '32px 24px', borderRadius: 18, maxWidth: 420, maxHeight: '80vh', overflowY: 'auto', margin: 'auto', boxShadow: '0 2px 16px #0006' }}>
            <h3 style={{ color: '#ffd700', textAlign: 'center' }}>Shop</h3>
            <div style={{ marginBottom: 18 }}>
              <b>Pets (30 Gnee! points each):</b>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                {['white dog', 'Frog', 'Bird', 'plant'].map(pet => (
                  <button key={pet} onClick={() => handleBuyPet(pet)} style={{ background: '#ffd700', color: '#222', borderRadius: 8, padding: '4px 16px', fontWeight: 600, marginBottom: 8 }}>{pet}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <b>Food (1 Gnee! point each):</b>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                {['bun', 'candy', 'drink', 'fastfood', 'kewto', 'matcha', 'noddle', 'salmon eggs', 'sushi salmon', 'sushi', 'sushi2', 'sushii1', 'tempura', 'tofu', 'wraped sushi'].map(food => (
                  <button key={food} onClick={() => handleBuyFood(food)} style={{ background: '#ffd700', color: '#222', borderRadius: 8, padding: '4px 16px', fontWeight: 600, marginBottom: 8 }}>{food}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setShopOpen(false)} style={{ marginTop: 24, background: '#ffd700', color: '#222', padding: '8px 24px', border: 'none', borderRadius: 18, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>Close</button>
          </div>
        </div>
      )}
      {/* Hive Modal */}
      {hiveOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#222', padding: '32px 24px', borderRadius: 18, maxWidth: 420, maxHeight: '80vh', overflowY: 'auto', margin: 'auto', boxShadow: '0 2px 16px #0006' }}>
            <h3 style={{ color: '#00d4aa', textAlign: 'center' }}>Hive Inventory</h3>
            <div style={{ marginBottom: 18 }}>
              <b>Pets:</b>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                {pets.map((pet, i) => (
                  <div key={pet + i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{pet}</span>
                    <button onClick={() => handleSellItem('pet', i)} style={{ background: '#ffd700', color: '#222', borderRadius: 8, padding: '2px 10px', fontWeight: 600 }}>Sell</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <b>Food:</b>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                {food.map((f, i) => (
                  <div key={f.type + i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{f.type}</span>
                    <button onClick={() => handleSellItem('food', i)} style={{ background: '#ffd700', color: '#222', borderRadius: 8, padding: '2px 10px', fontWeight: 600 }}>Sell</button>
                    <button onClick={() => handleUseFood(i)} style={{ background: '#00d4aa', color: '#fff', borderRadius: 8, padding: '2px 10px', fontWeight: 600 }}>Use</button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setHiveOpen(false)} style={{ marginTop: 24, background: '#00d4aa', color: '#fff', padding: '8px 24px', border: 'none', borderRadius: 18, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TamagotPage;
