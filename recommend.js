const recommendations = {
    'Dry Skin': [
        {
            product_name: 'CeraVe Moisturizing Cream',
            price: '$19.99',
            product_url: 'https://www.amazon.com/CeraVe-Moisturizing-Cream-Ounce-Count/dp/B000E3Q4ZI'
        },
        {
            product_name: 'La Roche-Posay Toleriane Double Repair Face Moisturizer',
            price: '$29.99',
            product_url: 'https://www.amazon.com/La-Roche-Posay-Toleriane-Moisturizer/dp/B07R4Q4Q7Q'
        }
    ],
    'Oily Skin': [
        {
            product_name: 'Neutrogena Oil-Free Moisture',
            price: '$12.99',
            product_url: 'https://www.amazon.com/Neutrogena-Oil-Free-Moisture-3-Ounce/dp/B000052M5U'
        },
        {
            product_name: 'CeraVe PM Facial Moisturizing Lotion',
            price: '$14.99',
            product_url: 'https://www.amazon.com/CeraVe-Moisturizing-Lotion-Ounce-Count/dp/B000E3Q4ZI'
        }
    ],
    'Normal Skin': [
        {
            product_name: 'Olay Complete All Day Moisturizer',
            price: '$16.99',
            product_url: 'https://www.amazon.com/Olay-Complete-Moisturizer-Sensitive-Skin/dp/B000052M5U'
        },
        {
            product_name: 'Cetaphil Daily Hydrating Lotion',
            price: '$14.99',
            product_url: 'https://www.amazon.com/Cetaphil-Daily-Hydrating-Lotion-Ounce/dp/B000E3Q4ZI'
        }
    ],
    'Combination Skin': [
        {
            product_name: 'Clinique Dramatically Different Moisturizing Gel',
            price: '$30.00',
            product_url: 'https://www.amazon.com/Clinique-Dramatically-Different-Moisturizing-Gel/dp/B000052M5U'
        },
        {
            product_name: 'Kiehl’s Ultra Facial Oil-Free Gel Cream',
            price: '$38.00',
            product_url: 'https://www.amazon.com/Kiehls-Ultra-Facial-Oil-Free-Cream/dp/B000E3Q4ZI'
        }
    ]
};

function getRecommendations(req, res) {
    try {
        const skinType = req.params.skinType;
        const skinTypeFormatted = skinType.replace(/\s+/g, '_');
        
        if (!recommendations[skinType]) {
            res.status(404).json({ error: 'Skin type not found' });
            return;
        }

        res.json({
            skin_type: skinType,
            recommended_products: recommendations[skinType]
        });
    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
}

module.exports = {
    getRecommendations
};
