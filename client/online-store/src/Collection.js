import './Collection.css';
import { useEffect, useState } from 'react';
import { AddToCart } from './Cart';

var productPrice = Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB"
});

function Product(props) {
    return (
        <div className="product">
            <img src={ `/collection/images/${props.image}` } alt="product" />
            <span>{ props.name }</span>
            <div>
                <b>{productPrice.format(props.price)}</b>
                <button onClick={() => AddToCart(props.id)}>В корзину</button>
            </div>
        </div>
    );
}

export default function Products(props) {
    const [data, setData] = useState();
    const [error, setError] = useState();
    useEffect(() => {
        fetch(`/collection?${new URLSearchParams(props)}`)
            .then(response => {
                if(response.ok)
                    return response.json();
                else
                    throw new Error(response.statusText);
            })
            .then(result => setData(result))
            .catch(error => setError(error));
    }, [props]);
    if(error) return error.message;
    if(data) {
        if(data.length === 0) return "Ничего не найдено.";
        return (
            <div className="products">
                { data.map((item) => <Product image={ item.image } name={ item.name } price={ item.price } id={ item.id } key={ item.id } />) }
            </div>
        );
    }
    return "Загрузка…";
}