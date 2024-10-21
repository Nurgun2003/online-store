import './Catalog.css';
import { Children } from 'react';
import { Link, useLoaderData, useParams } from 'react-router-dom';
import Products from '../../Collection';

export async function CatalogLoader() {
    const response = await fetch("/collection/categories");
    if(!response.ok)
        throw new Error(response.statusText);
    return await response.json();
}
/*
const collection = [
    {
        name: "Девочкам",
        path: "devochkam",
        collection: [
            {
                name: "Одежда",
                path: "odezhda",
                collection: [
                    {
                        name: "Платья",
                        path: "platya"
                    },
                    {
                        name: "Костюмы",
                        path: "kostumy"
                    },
                    {
                        name: "Джинсы",
                        path: "jeansy"
                    }
                ]
            },
            {
                name: "Верхняя одежда",
                path: "verhnyaya-odezhda",
                collection: [
                    {
                        name: "Куртки",
                        path: "kurtki"
                    },
                    {
                        name: "Комбинезоны",
                        path: "kombinezony"
                    }
                ]
            }
        ]
    },
    {
        name: "Мальчикам",
        path: "malchikam",
        collection: [
            {
                name: "Одежда",
                path: "odezhda",
                collection: [
                    {
                        name: "Брюки",
                        path: "bruki"
                    },
                    {
                        name: "Костюмы",
                        path: "kostumy"
                    },
                    {
                        name: "Джинсы",
                        path: "jeansy"
                    }
                ]
            },
            {
                name: "Верхняя одежда",
                path: "verhnyaya-odezhda",
                collection: [
                    {
                        name: "Куртки",
                        path: "kurtki"
                    },
                    {
                        name: "Комбинезоны",
                        path: "kombinezony"
                    }
                ]
            }
        ]
    }
];
/*
const Collection = (value, url = "/catalog") => {
    if(Array.isArray(value))
        return <ul>{ value.map(value => <li>{ Collection(value, url) }</li>) }</ul>;
    else {
        url += "/" + value.url;
        if(value.collection !== undefined)
            return (
                <details>
                    <summary><a href={ url }>{ value.name }</a></summary>
                    { Collection(value.collection, url) }
                </details>
            );
        else
            return <a href={ url }>{ value.name }</a>
    }
}
*/
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

function Categories({ col, path = "/catalog" }) {
    if(Array.isArray(col))
        return col.map(item => <Categories col={ item } path={ path } key={ item.id } />);

    path += "/" + col.refName
    return (
        <Category name={ col.name } path={ path }>
            { col.children && col.children.map(item => <Categories col={ item } path={ path } key={ item.id } />) }
        </Category>
    );
}

function NavCrumbs() {
    const params = useParams();
    const crumbs = [
        { name: "Главная", path: "/" }
    ];
    let last = { name: "Каталог", path: "/catalog" };
    let col = useLoaderData();
    if(params["*"] !== '') {
        let path = "/catalog";
        for(const part of params["*"].replace(/\/$/, "").split('/')) {
            path += "/" + part;
            let name = part;
            if(col)
                for(const item of col)
                    if(item.refName.toLowerCase() === part.toLowerCase()) {
                        col = item.children;
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
                <div className="catalog-container">
                    <Categories col={ categories }/>
                </div>
            </div>
            <div id="catalog-right">
                <NavCrumbs />
                <CatalogProducts />
            </div>
        </div>
    );
}