import { clearUserData } from '../../Account';
import { useNavigate } from 'react-router-dom';

export default function Account() {
    const navigate = useNavigate();
    const LogOut = () => {
        clearUserData();
        navigate("/")
    }
    return (
        <div>
            <h1>Личный кабинет</h1>
            <button onClick={LogOut}>Выйти</button>
        </div>
    );
}