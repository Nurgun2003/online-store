import './Root.css';
import logo from '../logo.png';
import { Form, Link, NavLink, Outlet } from 'react-router-dom';
import { useCartCount } from '../Cart';
import { useAccount } from '../Account';

export default function Root() {
  const cartCount = useCartCount();
  const { data, isLoading } = useAccount();

  if(isLoading)
    return null

  return (
    <div className="Root">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo box"><img src={logo} alt="Logo" /></Link>
          <div id="right">
            <div className="box">
              <b>Корзина</b><br />
              <Link to="/cart">{`Товаров: ${cartCount}`}</Link>
            </div>
            <div className="box" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div>{ data ? <Link to="/account" title={`${data.name} ${data.surname}`}>Личный кабинет</Link> : <><Link to="/login">Войти</Link> или <Link to="/register">зарегистрироваться</Link></> }</div>
              <Form method="get" action="/search">
                <input type="text" name="text" placeholder="Поиск" required />
                <button type="submit">Найти</button>
              </Form>
            </div>
          </div>
        </div>
        <hr />
        <nav>
          <NavLink to="/" className={({ isActive }) => (isActive ? " active": "")}>Главная</NavLink>
          <NavLink to="/catalog">Каталог</NavLink>
          <NavLink to="/delivery">Доставка</NavLink>
          <NavLink to="/contacts">Контакты</NavLink>
        </nav>
      </header>
      <div className="middle">
        <Outlet />
      </div>
    </div>
  );
}