import React from 'react';
import RoundIconButton from '../assets/Botao_bola.js';
import Footer from '../base/Footer.js';
// Supondo que você use uma biblioteca como react-icons
import { FiPlus } from 'react-icons/fi';

const Dashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Visão Geral</h1>
      {/* Outros componentes do seu app aqui */}
      
      {/* Footer */}
      <Footer />
      
    </div>
  );
};

export default Dashboard;