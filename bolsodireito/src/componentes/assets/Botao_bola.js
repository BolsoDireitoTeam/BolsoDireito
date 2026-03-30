import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoundIconButton = ({ icon, to, ariaLabel, color = '#4F46E5' }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleNavigation}
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: color,
        color: '#FFFFFF',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s ease, background-color 0.2s ease',
      }}
      // Efeitos de hover simples usando onMouseEnter/Leave (em projetos reais, prefira CSS/Tailwind)
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {icon}
    </button>
  );
};

export default RoundIconButton;