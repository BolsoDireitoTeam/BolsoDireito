import React from 'react';
import RoundIconButton from '../assets/Botao_bola.js';
// Supondo que você use uma biblioteca como react-icons
import { FiPlus } from 'react-icons/fi'; 

const Dashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Visão Geral</h1>
      {/* Outros componentes do seu app aqui */}
      
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem' }}>
        <RoundIconButton 
          icon={<FiPlus size={24} />} 
          to="/nova-despesa" 
          ariaLabel="Adicionar nova despesa"
          color="#10B981" // Um verde agradável para ações de adição
        />
      </div>
    </div>
  );
};

export default Dashboard;