const bobaBerryMilktea = new URL('./assets/Boba Berry Milktea.jpg', import.meta.url).href
const caramelMacchiato = new URL('./assets/Caramel Macchiato.jpg', import.meta.url).href
const classicBobaTea = new URL('./assets/Classic Boba Tea.jpg', import.meta.url).href
const cocoPealMilktea = new URL('./assets/Coco Peal Milktea.jpg', import.meta.url).href
const icedMochaLatte = new URL('./assets/Iced Mocha Latte.jpg', import.meta.url).href
const icyChoco = new URL('./assets/Icy Choco.jpg', import.meta.url).href
const matchaLatte = new URL('./assets/Matcha Latte.jpg', import.meta.url).href
const spanishLatte = new URL('./assets/Spanish Latte.jpg', import.meta.url).href
const ubePearlMilktea = new URL('./assets/Ube Pearl Milktea.jpg', import.meta.url).href

export const initialProducts = [
	{ id: 'boba-berry-milktea', name: 'Boba Berry Milktea', price: 120, stock: 20, image: bobaBerryMilktea },
	{ id: 'caramel-macchiato', name: 'Caramel Macchiato', price: 135, stock: 20, image: caramelMacchiato },
	{ id: 'classic-boba-tea', name: 'Classic Boba Tea', price: 110, stock: 20, image: classicBobaTea },
	{ id: 'coco-peal-milktea', name: 'Coco Peal Milktea', price: 120, stock: 20, image: cocoPealMilktea },
	{ id: 'iced-mocha-latte', name: 'Iced Mocha Latte', price: 130, stock: 20, image: icedMochaLatte },
	{ id: 'icy-choco', name: 'Icy Choco', price: 125, stock: 20, image: icyChoco },
	{ id: 'matcha-latte', name: 'Matcha Latte', price: 135, stock: 20, image: matchaLatte },
	{ id: 'spanish-latte', name: 'Spanish Latte', price: 130, stock: 20, image: spanishLatte },
	{ id: 'ube-pearl-milktea', name: 'Ube Pearl Milktea', price: 125, stock: 20, image: ubePearlMilktea },
]

export const sampleTransactions = []
