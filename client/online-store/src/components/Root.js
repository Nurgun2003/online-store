import './Root.css';
import logo from '../logo.png';
import { Form, Link, NavLink, Outlet } from 'react-router-dom';
import { useCartCount } from '../Cart';
import { account, fetchUserData, useAccount } from '../Account';

export async function RootLoader() {
  if(!account.data)
    await fetchUserData();
  return account.data;
}

function Header() {
  const cartCount = useCartCount();
  const { data } = useAccount();
  return <>
    <div>
      <Link to="/" className="logo box"><img src={logo} alt="Logo" /></Link>
      <div>
        <div className="box">
          <b>Корзина</b><br />
          <Link to="/cart">{`Товаров: ${cartCount}`}</Link>
        </div>
        <div className="box column">
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
  </>;
}

function Footer() {
  return <p>Copyright © Нюргун Неустроев-Алексеев, 2024. Все права защищены.</p>;
}

export default function Root() {
  return (
    <div className="Root">
      <header>
        <Header />
      </header>
      <div className="container">
        <Outlet />
      </div>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}