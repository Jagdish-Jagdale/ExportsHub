import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('exportshub_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('exportshub_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, selectedUnit, quantity) => {
        if (!user) {
            toast.error('Please login to add items to cart');
            return false;
        }


        setCart(prev => {
            const existingIndex = prev.findIndex(
                item => item.productId === product.id && item.selectedUnit === selectedUnit
            );
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex].quantity += quantity;
                toast.success('Cart updated!');
                return updated;
            }
            toast.success('Added to cart!');
            return [...prev, {
                productId: product.id,
                title: product.title,
                image: product.images?.[0] || '',
                selectedUnit,
                quantity,
            }];
        });
        return true;
    };

    const removeFromCart = (productId, selectedUnit) => {
        setCart(prev => prev.filter(
            item => !(item.productId === productId && item.selectedUnit === selectedUnit)
        ));
        toast.success('Removed from cart');
    };

    const updateQuantity = (productId, selectedUnit, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId, selectedUnit);
            return;
        }
        setCart(prev => prev.map(item =>
            item.productId === productId && item.selectedUnit === selectedUnit
                ? { ...item, quantity }
                : item
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
            {children}
        </CartContext.Provider>
    );
}
