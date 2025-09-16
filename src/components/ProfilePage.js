import React from 'react';

function ProfilePage() {
	return (
		<>
			{/* Main Health & Anatomy Tracker content goes here */}
			{/* Floating mascot in bottom left corner */}
			<img
				src="/assets/pixel-heart.gif"
				alt="Pixel Heart"
				style={{
					position: 'fixed',
					left: '24px',
					bottom: '24px',
					width: '64px',
					height: '64px',
					zIndex: 1000,
					pointerEvents: 'none'
				}}
			/>
		</>
	);
}

export default ProfilePage;
