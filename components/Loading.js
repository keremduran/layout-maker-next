import React from 'react';

const Loading = () => {
  return (
    <div
      style={{
        backgroundColor: '#ff8c00',
        position: 'fixed',
        left: '50%',
        border: '5px solid black',
        borderRadius: '50%',
        height: 60,
        width: 60,
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        padding: '1rem',
        fontWeight: '700',
      }}
    >
      <p>Loading...</p>
    </div>
  );
};

export default Loading;
