import { Link } from "react-router-dom";
import RoundIconButton from '../assets/Botao_bola.js';
import { FiPlus } from 'react-icons/fi';
import { FaUser } from "react-icons/fa";

function Footer() {
    return(             // jsx
        <footer>

            {/* botao central Add*/}
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)' }}>
            <RoundIconButton 
            icon={<FiPlus size={24} />} 
            to="/nova-despesa" 
            ariaLabel="Adicionar nova despesa"
            color="#10B981" // Um verde agradável para ações de adição
            />
        </div>
        {/* botao direita User */}
        <div style={{ position: 'fixed', bottom: '2rem', left: '60%', transform: 'translateX(-50%)' }}>
            <RoundIconButton 
            icon={<FaUser size={24} />} 
            to="/perfil" 
            ariaLabel="Perfil do usuário"
            color="#10B981" // Um verde agradável para ações de adição
            />
        </div>



            <hr></hr>
            <p>&copy; Bolso Direito - 2024</p>
        </footer>
    );
    
}

export default Footer;