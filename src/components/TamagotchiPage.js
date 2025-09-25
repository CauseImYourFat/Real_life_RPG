import React, { useState } from 'react';
import userDataService from '../services/UserDataService';

function TamagotchiPage({ userData, setUserData }) {
  // Use backend data from userData.tamagotchi
  const tamagotchi = userData.tamagotchi || {};
  const gneePoints = userData.preferences?.gneePoints || userData.gneePoints || 0;
  const petXP = tamagotchi.mascotXP || {};
  const petLevel = tamagotchi.petLevel || {};
  const petReqXP = tamagotchi.petReqXP || {};
  const purchased = tamagotchi.purchased || {};
  const shopPets = tamagotchi.shop || [];
  const currentMascot = tamagotchi.currentMascot || null;
  const [petActions] = useState(['wake']);
  const [currentAction, setCurrentAction] = useState('wake');
  const [xpBoost, setXpBoost] = useState(null);
  const [hiveTab, setHiveTab] = useState('pets');
  const [shopOpen, setShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState('pets');
  const [hiveOpen, setHiveOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  // Food files
  const foodFiles = [
    'bun.gif', 'candy.gif', 'drink.gif', 'fastfood.gif', 'kewto.gif', 'matcha.gif', 'noddle.gif', 'salmon eggs.gif', 'sushi salmon.gif', 'sushi.gif', 'sushi2.gif', 'sushii1.gif', 'tempura.gif', 'tofu.gif', 'wraped sushi.gif'
  ];

  // XP boost logic for pet actions
  const getXpWithBoost = (baseXp) => {
    if (xpBoost && xpBoost.expires > Date.now()) {
      return Math.floor(baseXp * 1.1 * 10) / 10; // 10% boost, round to 0.1
    }
    return baseXp;
  };

  // Always reload user data from backend after change
  const reloadUserData = async () => {
    const updated = await userDataService.loadUserData();
    setUserData(updated);
  };

  const handleAction = async (action) => {
    setCurrentAction(action);
    if (!currentMascot) return;
    await userDataService.saveTamagotchiData?.({ ...petXP, [currentMascot]: getXpWithBoost(0.1) + (petXP[currentMascot] ?? 0) }, purchased);
    await reloadUserData();
  };

  const handleBuyPet = async (type) => {
    const alreadyPicked = Object.keys(purchased).length > 0;
    if (!alreadyPicked) {
      await userDataService.buyPet(type);
      setShopOpen(false);
    } else if (gneePoints >= 5 && !purchased[type]) {
      await userDataService.buyPet(type);
      await userDataService.updateUserData?.({ gneePoints: gneePoints - 5 });
      setShopOpen(false);
    }
    await reloadUserData();
  };

  const handleBuyFood = async (foodName) => {
    if (gneePoints >= 1) {
      await userDataService.updateUserData?.({ gneePoints: gneePoints - 1 });
      alert(`You bought ${foodName} for 1 Gnee! point!`);
      setShopOpen(false);
      await reloadUserData();
    }
  };

  const handleRename = async () => {
    await userDataService.editPet(currentMascot, { name: renameValue });
    setEditModalOpen(false);
    await reloadUserData();
  };

  const handleSelectHiveMascot = async (type) => {
    await userDataService.updateTamagotchi?.({ currentMascot: type });
    setHiveOpen(false);
    await reloadUserData();
  };

  // Asset loading: link directly to dist/assets/pets/shop
  const getMascotImg = (mascot, action) => {
    const mascotLower = mascot.toLowerCase().replace(/\s+/g, '-');
    return `/assets/pets/shop/${mascot}/${mascotLower}-${action}.gif`;
  };

  return (
    <div className="container" style={{ maxWidth: 600, margin: '40px auto', padding: 32, background: '#222', borderRadius: 16, color: '#fff' }}>
      {/* Shop Modal */}
      {shopOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#222', padding: '32px 24px', borderRadius: 18, maxWidth: 420, maxHeight: '80vh', overflowY: 'auto', margin: 'auto', boxShadow: '0 2px 16px #0006' }} onClick={e => { if (e.target === e.currentTarget) setShopOpen(false); }}>
            <h2 style={{ color: '#ffd700', textAlign: 'center', marginTop: 0 }}>Tamagotchi Shop</h2>
            <div style={{ color: '#ffd700', textAlign: 'center', fontWeight: 600, fontSize: '1.1em', marginBottom: '18px' }}>
              <img src="/assets/point/gnee-point.gif" alt="Gnee!" style={{ width: 32, height: 32, verticalAlign: 'middle', marginRight: 8 }} />
              Gnee! points: <span style={{ color: '#fff', fontWeight: 700 }}>{gneePoints}</span>
            </div>
            {/* Shop tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 18 }}>
              <button onClick={() => setShopTab('pets')} style={{ background: shopTab === 'pets' ? '#ffd700' : '#444', color: shopTab === 'pets' ? '#222' : '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Pets</button>
              <button onClick={() => setShopTab('food')} style={{ background: shopTab === 'food' ? '#ffd700' : '#444', color: shopTab === 'food' ? '#222' : '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Food</button>
            </div>
            {/* Pets tab */}
            {shopTab === 'pets' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, justifyItems: 'center' }}>
                {shopPets.map(type => {
                  const alreadyPicked = Object.keys(purchased).length > 0;
                  const isPicked = purchased[type];
                  const locked = alreadyPicked && !isPicked;
                  const canBuy = !isPicked && (gneePoints >= 5 || !alreadyPicked);
                  return (
                    <div key={type} style={{ textAlign: 'center', opacity: locked && !canBuy ? 0.4 : 1 }}>
                      <div style={{ width: 70, height: 70, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002', marginBottom: 8 }}>
                        <img src={getMascotImg(type, 'wake')} alt={type} style={{ width: 48, height: 48 }} />
                      </div>
                      <div style={{ color: '#fff', fontSize: '1em' }}>{type}</div>
                      <div style={{ color: '#ffd700', fontSize: '0.95em' }}>{isPicked ? 'Owned' : (!alreadyPicked ? 'Free' : '5 Gnee! points')}</div>
                      <button onClick={() => canBuy && handleBuyPet(type)} disabled={!canBuy} style={{ marginTop: 6, background: canBuy ? '#ffd700' : '#aaa', color: '#222', padding: '4px 16px', border: 'none', borderRadius: 12, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: canBuy ? 'pointer' : 'not-allowed' }}>{isPicked ? 'Owned' : (!alreadyPicked ? 'Get Free' : 'Buy')}</button>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Food tab */}
            {shopTab === 'food' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, justifyItems: 'center' }}>
                {foodFiles.map(foodName => (
                  <div key={foodName} style={{ textAlign: 'center' }}>
                    <div style={{ width: 70, height: 70, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002', marginBottom: 8 }}>
                      <img src={`/assets/food/${foodName}`} alt={foodName} style={{ width: 48, height: 48 }} />
                    </div>
                    <div style={{ color: '#fff', fontSize: '1em' }}>{foodName.replace('.gif','').replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div style={{ color: '#ffd700', fontSize: '0.95em' }}>1 Gnee! point</div>
                    <button onClick={() => handleBuyFood(foodName.replace('.gif',''))} disabled={gneePoints < 1} style={{ marginTop: 6, background: gneePoints >= 1 ? '#ffd700' : '#aaa', color: '#222', padding: '4px 16px', border: 'none', borderRadius: 12, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: gneePoints >= 1 ? 'pointer' : 'not-allowed' }}>Buy</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShopOpen(false)} style={{ marginTop: 24, background: '#ffd700', color: '#222', padding: '8px 24px', border: 'none', borderRadius: 18, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>Close</button>
          </div>
        </div>
      )}

      {/* Hive Modal */}
      {hiveOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#222', padding: '32px 24px', borderRadius: 18, maxWidth: 420, maxHeight: '80vh', overflowY: 'auto', margin: 'auto', boxShadow: '0 2px 16px #0006' }} onClick={e => { if (e.target === e.currentTarget) setHiveOpen(false); }}>
            <h2 style={{ color: '#00d4aa', textAlign: 'center', marginTop: 0 }}>Your Hive</h2>
            {/* Hive tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 18 }}>
              <button onClick={() => setHiveTab('pets')} style={{ background: hiveTab === 'pets' ? '#ffd700' : '#444', color: hiveTab === 'pets' ? '#222' : '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Pets</button>
              <button onClick={() => setHiveTab('food')} style={{ background: hiveTab === 'food' ? '#ffd700' : '#444', color: hiveTab === 'food' ? '#222' : '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Food</button>
            </div>
            {/* Pets tab */}
            {hiveTab === 'pets' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, justifyItems: 'center' }}>
                {Object.keys(purchased).map(type => (
                  <div key={type} style={{ textAlign: 'center', position: 'relative' }}>
                    <div style={{ cursor: 'pointer', position: 'relative' }} onClick={() => handleSelectHiveMascot(type)}>
                      <div style={{ width: 70, height: 70, background: '#222', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002', marginBottom: 8, position: 'relative' }}>
                        <img src={getMascotImg(type, 'wake')} alt={type} style={{ width: 48, height: 48 }} />
                        {/* No XP boost indicator in Hive tab */}
                      </div>
                      <div style={{ color: '#fff', fontSize: '1em' }}>{purchased[type].name || type}</div>
                    </div>
                    <button onClick={openEditModal} style={{ position: 'absolute', top: 4, right: 4, background: '#ffd700', color: '#222', padding: '2px 10px', border: 'none', borderRadius: 8, fontSize: '0.9em', fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>Edit</button>
                  </div>
                ))}
              </div>
            )}
            {/* Food tab */}
            {hiveTab === 'food' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, justifyItems: 'center' }}>
                {foodFiles.map(foodName => (
                  <div key={foodName} style={{ textAlign: 'center' }}>
                    <div style={{ width: 70, height: 70, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002', marginBottom: 8 }}>
                      <img src={`/assets/food/${foodName}`} alt={foodName} style={{ width: 48, height: 48 }} />
                    </div>
                    <div style={{ color: '#fff', fontSize: '1em' }}>{foodName.replace('.gif','').replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div style={{ color: '#ffd700', fontSize: '0.95em' }}>Use on pet (+10% XP for 6h)</div>
                    <button onClick={() => handleUseFood(foodName.replace('.gif',''))} style={{ marginTop: 6, background: '#ffd700', color: '#222', padding: '4px 16px', border: 'none', borderRadius: 12, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>Use</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setHiveOpen(false)} style={{ marginTop: 24, background: '#00d4aa', color: '#fff', padding: '8px 24px', border: 'none', borderRadius: 18, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>Close</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#222', padding: '32px 24px', borderRadius: 18, maxWidth: 340, margin: 'auto', boxShadow: '0 2px 16px #0006' }}>
            <h2 style={{ color: '#ffd700', textAlign: 'center', marginTop: 0 }}>Edit Tamagotchi</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#fff' }}>Rename:</label>
              <input value={renameValue} onChange={e => setRenameValue(e.target.value)} type="text" style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: 'none', marginTop: 6, background: '#333', color: '#fff', fontSize: '1em' }} />
            </div>
            <button onClick={handleRename} style={{ background: '#00d4aa', color: '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, marginBottom: 10, cursor: 'pointer' }}>Rename</button>
            <button onClick={() => setEditModalOpen(false)} style={{ background: '#444', color: '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, marginTop: 10, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TamagotchiPage;
