
import React, { useEffect, useState } from 'react';
import userDataService from '../services/UserDataService';

// Skeleton for TamagotchiPage, compatible with webapp architecture
export default function TamagotchiPage() {
  // State hooks for pets, shop, hive, XP, etc.
  const [shopPets, setShopPets] = useState([]); // List of available pets
  const [purchased, setPurchased] = useState({}); // User's owned pets
  const [currentMascot, setCurrentMascot] = useState(null); // Displayed pet
  const [currentAction, setCurrentAction] = useState(null); // Current pet action
  const [mascotXP, setMascotXP] = useState({}); // XP per pet
  const [editModalOpen, setEditModalOpen] = useState(false); // Edit modal state
  const [renameValue, setRenameValue] = useState(''); // Rename input

  // List of pets from assets/pets/shop
  const assetShopPets = ['white dog', 'Frog', 'Bird', 'plant'];

  useEffect(() => {
    async function fetchData() {
      const tama = await userDataService.getTamagotchi();
      if (tama) {
        // Shop pets: always show all asset pets
        setShopPets(assetShopPets);
        setPurchased(tama.purchased || {});
        setCurrentMascot(tama.currentMascot || null);
        setMascotXP(tama.mascotXP || {});
      }
    }
    fetchData();
  }, []);

  // Action buttons for mascot
  const petActions = currentMascot && purchased[currentMascot]?.actions ? purchased[currentMascot].actions : [];

  // Handle action click (gain XP)
  const handleAction = async (action) => {
    setCurrentAction(action);
    // Gain XP for mascot
    await userDataService.gainXP(currentMascot, 1);
    // Reload XP
    const tama = await userDataService.getTamagotchi();
    setMascotXP(tama.mascotXP || {});
  };

  // Handle mascot edit (rename)
  const openEditModal = () => {
    setRenameValue(purchased[currentMascot]?.name || currentMascot);
    setEditModalOpen(true);
  };
  const handleRename = async () => {
    await userDataService.editPet(currentMascot, { name: renameValue });
    setEditModalOpen(false);
    // Reload purchased
    const tama = await userDataService.getTamagotchi();
    setPurchased(tama.purchased || {});
  };

  // Shop/hive modals (simplified)
  const [shopOpen, setShopOpen] = useState(false);
  const [hiveOpen, setHiveOpen] = useState(false);
  // Only allow picking one free pet
  const handleBuyPet = async (type) => {
    if (Object.keys(purchased).length === 0) {
      await userDataService.buyPet(type);
      setShopOpen(false);
      // Reload shop/hive
      const tama = await userDataService.getTamagotchi();
      setShopPets(assetShopPets);
      setPurchased(tama.purchased || {});
      setCurrentMascot(type);
    }
  };
  const handleSelectHiveMascot = (type) => {
    setCurrentMascot(type);
    userDataService.setCurrentMascot(type);
    setHiveOpen(false);
  };

  // Calculate level from XP
  const calcLevel = (mascot) => {
    let xp = mascotXP[mascot] || 0;
    let level = 1;
    let req = 100;
    while (xp >= req) {
      xp -= req;
      level++;
      req = Math.floor(100 * (1 + 0.05 * level));
    }
    return level;
  };

  // Asset loading: link directly to dist/assets/pets/shop
  const getMascotImg = (mascot, action) => {
  // Use lowercase mascot name for file path
  const mascotLower = mascot.toLowerCase();
  return `/assets/pets/shop/${mascot}/${mascotLower}-${action}.gif`;
  };

  return (
    <div className="container" style={{ maxWidth: 600, margin: '40px auto', padding: 32, background: '#222', borderRadius: 16, color: '#fff' }}>
      <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '1em', marginBottom: '2em' }}>
        <span style={{ fontSize: '2em' }}>👀</span>
        <h1 style={{ margin: 0 }}>Tamagotchi</h1>
      </div>
      {/* Shop & Hive buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2em' }}>
        <button onClick={() => setHiveOpen(true)} style={{ background: '#00d4aa', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: '18px', fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>🐝 Hive</button>
        <button onClick={() => setShopOpen(true)} style={{ background: '#ffd700', color: '#222', padding: '8px 18px', border: 'none', borderRadius: '18px', fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>🛒 Shop</button>
      </div>
      {/* Mascot display */}
      {currentMascot ? (
        <div style={{ margin: '32px auto 0 auto', textAlign: 'center', color: '#ccc', fontSize: '1.1em' }}>
          <div style={{ width: 200, height: 200, margin: 'auto', background: 'transparent', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002' }}>
            <img src={getMascotImg(currentMascot, currentAction || 'wake')} alt={currentMascot} style={{ width: 180, height: 180 }} />
          </div>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
            {petActions.map(action => (
              <button key={action} onClick={() => handleAction(action)} style={{ background: '#222', color: '#fff', padding: '6px 16px', border: 'none', borderRadius: 12, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>{action.charAt(0).toUpperCase() + action.slice(1)}</button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ margin: '32px auto 0 auto', textAlign: 'center', color: '#ccc', fontSize: '1.1em' }}>
          <p>No Tamagotchi pets yet.<br />Start building your Tamagotchi here!</p>
        </div>
      )}
      {/* Stats */}
      <div className="tama-stats" style={{ marginTop: '2em', color: '#00d4aa' }}>
        <div><b>Name:</b> {currentMascot && purchased[currentMascot]?.name ? purchased[currentMascot].name : '--'}</div>
        <div><b>Mood:</b> Happy 😊</div>
        <div><b>Level:</b> {currentMascot ? calcLevel(currentMascot) : '--'}</div>
        <div className="progress-bar" style={{ background: '#444', borderRadius: 8, overflow: 'hidden', height: 18, marginTop: 8 }}>
          <div className="progress" style={{ background: '#00d4aa', height: '100%', width: `${currentMascot ? Math.round((mascotXP[currentMascot] || 0) / 100 * 100) : 0}%` }}></div>
        </div>
        <div style={{ fontSize: '0.95em', color: '#aaa', marginTop: 4 }}>Progress to next evolution</div>
      </div>
      {/* Evolution display */}
      <div className="evolution" style={{ marginTop: '2em', color: '#ffd700', display: 'flex', alignItems: 'center', gap: 10 }}>
        <b>Evolution:</b> <span id="evolutionName">{currentMascot && purchased[currentMascot]?.name ? purchased[currentMascot].name : '--'}</span>
        {currentMascot && <button onClick={openEditModal} style={{ background: '#ffd700', color: '#222', padding: '2px 10px', border: 'none', borderRadius: 8, fontSize: '0.95em', fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>Edit</button>}
      </div>
      {/* Info text */}
      <div style={{ marginTop: '2em', textAlign: 'center', color: '#ccc', fontSize: '1em' }}>
        <p>Your tamagotchi evolves as you complete skills and earn points!<br />Keep progressing to unlock new forms and animations.</p>
      </div>

      {/* Shop Modal */}
      {shopOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#222', padding: '32px 24px', borderRadius: 18, maxWidth: 420, margin: 'auto', boxShadow: '0 2px 16px #0006' }}>
            <h2 style={{ color: '#ffd700', textAlign: 'center', marginTop: 0 }}>Tamagotchi Shop</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, justifyItems: 'center' }}>
              {shopPets.map(type => {
                const alreadyPicked = Object.keys(purchased).length > 0;
                const isPicked = purchased[type];
                const locked = alreadyPicked && !isPicked;
                return (
                  <div key={type} style={{ textAlign: 'center', opacity: locked ? 0.4 : 1 }}>
                    <div style={{ width: 70, height: 70, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002', marginBottom: 8 }}>
                      <img src={getMascotImg(type, 'wake')} alt={type} style={{ width: 48, height: 48 }} />
                    </div>
                    <div style={{ color: '#fff', fontSize: '1em' }}>{type}</div>
                    <div style={{ color: '#ffd700', fontSize: '0.95em' }}>{locked ? 'Locked' : 'Free'}</div>
                    <button onClick={() => !locked && handleBuyPet(type)} disabled={locked} style={{ marginTop: 6, background: locked ? '#aaa' : '#ffd700', color: '#222', padding: '4px 16px', border: 'none', borderRadius: 12, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: locked ? 'not-allowed' : 'pointer' }}>{locked ? 'Locked' : 'Buy'}</button>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShopOpen(false)} style={{ marginTop: 24, background: '#ffd700', color: '#222', padding: '8px 24px', border: 'none', borderRadius: 18, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>Close</button>
          </div>
        </div>
      )}

      {/* Hive Modal */}
      {hiveOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#222', padding: '32px 24px', borderRadius: 18, maxWidth: 420, margin: 'auto', boxShadow: '0 2px 16px #0006' }}>
            <h2 style={{ color: '#00d4aa', textAlign: 'center', marginTop: 0 }}>Your Hive</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, justifyItems: 'center' }}>
              {Object.keys(purchased).map(type => (
                <div key={type} style={{ textAlign: 'center', position: 'relative' }}>
                  <div style={{ cursor: 'pointer' }} onClick={() => handleSelectHiveMascot(type)}>
                    <div style={{ width: 70, height: 70, background: '#222', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002', marginBottom: 8 }}>
                      <img src={getMascotImg(type, 'wake')} alt={type} style={{ width: 48, height: 48 }} />
                    </div>
                    <div style={{ color: '#fff', fontSize: '1em' }}>{purchased[type].name || type}</div>
                  </div>
                  <button onClick={openEditModal} style={{ position: 'absolute', top: 4, right: 4, background: '#ffd700', color: '#222', padding: '2px 10px', border: 'none', borderRadius: 8, fontSize: '0.9em', fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>Edit</button>
                </div>
              ))}
            </div>
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
