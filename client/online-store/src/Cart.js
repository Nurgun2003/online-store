import { useEffect, useState } from "react";
import Cookies from 'js-cookie';

export const cart = {};
let cartCount = 0;
for(let [key, value] of Object.entries(Cookies.get())) {
    if(key.startsWith("cart_")) {
        const id = parseInt(key.substring(5));
        if(isNaN(id)) {
            Cookies.remove(key);
            continue;
        }
        value = parseInt(value);
        cart[id] = value;
        cartCount += value;
    }
}

let listeners = [];
const dispatchSetCartCount = (value) => {
    cartCount = value;
    for(const listener of listeners)
        listener(value);
}

export function AddToCart(id) {
    cart[id] = (typeof(cart[id]) === "number" ? cart[id] : 0) + 1;
    dispatchSetCartCount(cartCount + 1);
    Cookies.set("cart_" + id, cart[id]);
}
export function DecrementItem(id) {
    let count = cart[id] - 1;
    if(count < 1) count = 1;
    dispatchSetCartCount(cartCount - (cart[id] - count));
    cart[id] = count;
    Cookies.set("cart_" + id, cart[id]);
}
export function RemoveFromCart(id) {
    dispatchSetCartCount(cartCount - cart[id]);
    delete cart[id];
    Cookies.remove("cart_" + id);
}

export function useCartCount() {
    const [count, setCount] = useState(cartCount);
    useEffect(() => {
        listeners.push(setCount);
        return () => {
            listeners = listeners.filter((li) => li !== setCount);
        }
    }, [setCount]);
    return count;
}