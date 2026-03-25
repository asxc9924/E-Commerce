// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

const app = express();
app.use(express.json());
app.use(express.static('public')); // This serves your HTML file
app.use(cors());

// Secure Product Database (Matches Frontend)
const storeItems = new Map([
    [1, { priceInCents: 149900, name: "AURA | Serenity Edition" }],
    [2, { priceInCents: 159900, name: "AURA | Harmony Edition" }],
    [3, { priceInCents: 12000, name: "Replacement Bioluminescent Core" }],
    [4, { priceInCents: 7500, name: "AURA Care Kit" }]
]);

// Checkout Route
app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id);
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: storeItem.name,
                        },
                        unit_amount: storeItem.priceInCents,
                    },
                    quantity: item.quantity,
                };
            }),
            // These URLs tell Stripe where to send the user after payment
            success_url: `${process.env.SERVER_URL}/success.html`,
            cancel_url: `${process.env.SERVER_URL}/cancel.html`,
        });
        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AURA Server running on port ${PORT}`));