import React from 'react';

const CartModal = ({ cart, total, onClose, onCheckout }) => {
    return (
        <div style={styles.modal}>
            <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                    <h3>Mon Panier</h3>
                    <button onClick={onClose} style={styles.closeButton}>✕</button>
                </div>

                {cart.length === 0 ? (
                    <p style={styles.emptyCart}>Votre panier est vide</p>
                ) : (
                    <>
                        <div style={styles.cartItems}>
                            {cart.map((item, index) => (
                                <div key={index} style={styles.cartItem}>
                                    <div>
                                        <strong>{item.name}</strong>
                                        <span style={styles.quantity}>x{Number(item.quantity || 1)}</span>

                                        <p style={styles.itemPrice}>

                                            {Number(item.discount || 0) > 0 && item.originalPrice ? (
                                                <>
                                                    <span style={styles.originalPrice}>{item.originalPrice} DT</span>
                                                    <span style={styles.discountBadge}>-{item.discount}%</span>
                                                </>
                                            ) : null}
                                            <span>{Number(item.price || 0).toFixed(2)} DT</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={styles.cartTotal}>
                            <span>Total</span>
                            <strong>{total} DT</strong>
                        </div>

                        <button onClick={onCheckout} style={styles.checkoutButton}>
                            Passer commande
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '450px',
        maxWidth: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
    },
    emptyCart: {
        textAlign: 'center',
        padding: '40px',
        color: '#6b7280',
    },
    cartItems: {
        padding: '20px',
    },
    cartItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #f3f4f6',
    },
    itemPrice: {
        fontSize: '12px',
        color: '#6b7280',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
    },
    quantity: {
        marginLeft: '8px',
        color: '#6b7280',
        fontSize: '12px',
        fontWeight: 700,
    },
    originalPrice: {
        color: '#9ca3af',
        textDecoration: 'line-through',
    },
    discountBadge: {
        color: '#dc2626',
        fontWeight: 700,
    },
    cartTotal: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        fontWeight: 'bold',
        fontSize: '18px',
    },
    checkoutButton: {
        width: 'calc(100% - 40px)',
        margin: '0 20px 20px 20px',
        padding: '14px',
        backgroundColor: '#22c55e',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px',
    },
};

export default CartModal;
