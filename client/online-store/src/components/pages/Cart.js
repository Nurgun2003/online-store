import './Cart.css';
import { AddToCart, cart, DecrementItem, RemoveFromCart, useCartCount } from '../../Cart';
import { Link, useLoaderData } from 'react-router-dom';
import { useAccount } from '../../Account';
// import image1 from './../../product1.jpg';
// import image2 from './../../product2.jpg';
// import image3 from './../../product3.jpg';
// import image4 from './../../product4.jpg';

// const cart = [
//     { image: image1, name: "Куртка из материала Softshell", price: 2999 },
//     { image: image2, name: "Куртка объёмная с капюшоном", price: 3999 },
//     { image: image3, name: "Куртка Hippasilla Розовая", price: 4999 },
//     { image: image4, name: "Легкая куртка для мальчиков Kappa", price: 5999 }
// ];

var productPrice = Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB"
});

const fetchProduct = async (id) => {
    const response = await fetch(`/products/${id}`);
    if(response.ok)
        return await response.json();
    else if(response.status === 400) {
        RemoveFromCart(id);
        return null;
    }
    else {
        throw new Error(response.statusText);
    }
}

export async function CartLoader() {
    return (await Promise.all(Object.keys(cart).map(id => fetchProduct(id)))).filter((item) => item !== null);
}

function CartProduct(props) {
    return (
        <div className="cart-product">
            <div>
                <img src={ `/products/images/${props.image}` } alt="product" />
                <b>{ props.name }</b>
            </div>
            <div>
                <div className="cart-product-count">
                    <button onClick={() => DecrementItem(props.id)}>-</button>
                    <span>{props.count}</span>
                    <button onClick={() => AddToCart(props.id)}>+</button>
                </div>
                <span>{ productPrice.format(props.price) }</span>
                <button onClick={() => RemoveFromCart(props.id)}>Убрать</button>
            </div>
        </div>
    );
}

function CartProducts() {
    const data = useLoaderData();
    return data.filter((item) => item.id in cart).map((item) => <CartProduct image={item.image} name={item.name} price={item.price} count={cart[item.id]} id={item.id} key={item.id} />);
}

export default function Cart() {
    const data = useLoaderData();
    const cartCount = useCartCount();
    const { data: accountData } = useAccount();
    return (
        <div>
            <h1>Корзина</h1>
            <CartProducts />
            <hr />
            <h3>Всего товаров: {cartCount}</h3>
            <h2>Итого: {productPrice.format(data.filter((item) => item.id in cart).reduce((prev, cur) => prev + cur.price * cart[cur.id], 0))}</h2>
            { accountData ? <button disabled={!cartCount}>Оплатить</button> : <p>Чтобы оформить заказ, сначала <Link to="/register">зарегистрируйтесь</Link> или <Link to="/login">войдите</Link> в свою учётную запись.</p> }
        </div>
    );
}