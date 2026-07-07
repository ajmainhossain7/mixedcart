import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const localData = localStorage.getItem('cartItems');
        return localData ? JSON.parse(localData) : [];
    });
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        setCartItems((prevItems) => {
            const exists = prevItems.find((item) => item._id === product._id);
            if (exists) {
                return prevItems.map((item) =>
                    item._id === product._id ? { ...item, qty: item.qty + quantity } : item
                );
            }
            return [...prevItems, { ...product, qty: quantity }];
        });
        setIsDrawerOpen(true);
    };

    const removeFromCart = (id) => {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
    };

    const updateCartQty = (id, qty) => {
        if (qty <= 0) {
            removeFromCart(id);
            return;
        }
        setCartItems((prevItems) =>
            prevItems.map((item) => (item._id === id ? { ...item, qty } : item))
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateCartQty,
                clearCart,
                cartCount,
                cartTotal,
                isDrawerOpen,
                setIsDrawerOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
