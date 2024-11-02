import './Catalog.css';
import { Children } from 'react';
import { Link, useLoaderData, useParams } from 'react-router-dom';
import Products from '../../Products';

export async function CatalogLoader() {
    const response = await fetch("/products/categories");
    if(!response.ok)
        throw new Error(response.statusText);
    return await response.json();
}

function Category({ name, path, children }) {
    if(children !== undefined) {
        return (
            <details>
                <summary><Link to={ path }>{ name }</Link></summary>
                <ul>
                    { Children.map(children, child => <li>{ child }</li>) }
                </ul>
            </details>
        );
    }
    else
        return <Link to={ path }>{ name }</Link>;
}

function Categories({ data, path = "/catalog" }) {
    if(Array.isArray(data))
        return data.map(item => <Categories data={ item } path={ path } key={ item.id } />);

    path += "/" + data.refName
    return (
        <Category name={ data.name } path={ path }>
            { data.children && data.children.map(item => <Categories data={ item } path={ path } key={ item.id } />) }
        </Category>
    );
}

function NavCrumbs() {
    const params = useParams();
    const crumbs = [
        { name: "Главная", path: "/" }
    ];
    let last = { name: "Каталог", path: "/catalog" };
    let data = useLoaderData();
    if(params["*"] !== '') {
        let path = "/catalog";
        for(const part of params["*"].replace(/\/$/, "").split('/')) {
            path += "/" + part;
            let name = part;
            if(data)
                for(const item of data)
                    if(item.refName.toLowerCase() === part.toLowerCase()) {
                        data = item.children;
                        name = item.name;
                        break;
                    }
            crumbs.push(last);
            last = { name: name, path: path };
        }
    }
    return (
        <nav className="crumbs">
            <ol>
                {crumbs.map((item, index) => <li className="crumb" key={index}><Link to={item.path}>{item.name}</Link></li>)}
                <li className="crumb">{last.name}</li>
            </ol>
        </nav>
    );
}

function CatalogProducts() {
    const params = useParams();
    return <Products category={params["*"]} />;
}

export default function Catalog() {
    const categories = useLoaderData();
    return (
        <div className="Catalog">
            <div id="catalog-left">
                <h2>Категории</h2>
                <div className="catalog-categories">
                    <Categories data={ categories }/>
                </div>
            </div>
            <div id="catalog-right">
                <NavCrumbs />
                <CatalogProducts />
            </div>
        </div>
    );
}