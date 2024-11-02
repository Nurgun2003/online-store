import Products from '../../Products.js';

export default function Home() {
    return (
        <div>
            <h1>Главная</h1>
            <h2>Популярные товары</h2>
            <Products sort="popular" limit="8" />
            <h2>Новинки</h2>
            <Products sort="new" limit="8" />
        </div>
    );
}