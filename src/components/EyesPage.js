import React, { useEffect, useState } from 'react';

const frogPath = '/assets/pets/shop/Frog/';
const donutPath = '/assets/donut.gif';

export default function EyesPage() {
  const [frogGifs, setFrogGifs] = useState([]);
  const [frogIndex, setFrogIndex] = useState(0);

  useEffect(() => {
    fetch('/api/frog-gifs')
      .then(res => res.json())
      .then(gifs => setFrogGifs(gifs));
  }, []);

  useEffect(() => {
    if (frogGifs.length === 0) return;
    const interval = setInterval(() => {
      setFrogIndex(i => (i + 1) % frogGifs.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [frogGifs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, marginTop: 40 }}>
      <h1 style={{ fontSize: '2em' }}>👀 Eyes</h1>
      <div style={{ display: 'flex', gap: 40 }}>
        <div>
          {frogGifs.length > 0 ? (
            <img src={frogPath + frogGifs[frogIndex]} alt="Frog" style={{ width: 180, height: 180, borderRadius: 16, boxShadow: '0 2px 8px #0002' }} />
          ) : (
            <div>Loading frog GIFs...</div>
          )}
          <div style={{ textAlign: 'center', marginTop: 8 }}>Frog GIF</div>
        </div>
        <div>
          <img src={donutPath} alt="Donut" style={{ width: 180, height: 180, borderRadius: 16, boxShadow: '0 2px 8px #0002' }} />
          <div style={{ textAlign: 'center', marginTop: 8 }}>Donut GIF</div>
        </div>
      </div>
    </div>
  );
}
