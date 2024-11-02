import Root, { RootLoader } from './components/Root';
import NotFound from './components/NotFound';
import Search from './components/Search';
import Home from './components/pages/Home';
import Catalog, { CatalogLoader } from './components/pages/Catalog';
import Delivery from './components/pages/Delivery';
import Contacts from './components/pages/Contacts';
import Cart, { CartLoader } from './components/pages/Cart';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Account from './components/pages/Account';
import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route
} from 'react-router-dom';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />} loader={RootLoader}>
      <Route index element={<Home />} />
      <Route path="catalog/*" element={<Catalog />} loader={CatalogLoader} />
      <Route path="delivery" element={<Delivery />} />
      <Route path="contacts" element={<Contacts />} />
      <Route path="cart" element={<Cart />} loader={CartLoader} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="account" element={<Account />} />
      <Route path="search" element={<Search />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
