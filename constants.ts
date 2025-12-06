import { MenuItem } from './types';

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Truffle Wagyu Burger',
    description: 'A5 Wagyu beef patty, black truffle shavings, aged cheddar, caramelized onions, brioche bun.',
    price: 32,
    category: 'main',
    image: 'https://picsum.photos/seed/burger/400/300',
    popular: true
  },
  {
    id: '2',
    name: 'Lobster & Saffron Risotto',
    description: 'Creamy carnaroli rice, butter poached lobster tail, saffron threads, parmesan crisp.',
    price: 45,
    category: 'main',
    image: 'https://picsum.photos/seed/risotto/400/300'
  },
  {
    id: '3',
    name: 'Wood-Fired Margherita',
    description: 'San Marzano tomato sauce, buffalo mozzarella, fresh basil, extra virgin olive oil.',
    price: 18,
    category: 'pizza',
    image: 'https://picsum.photos/seed/pizza/400/300'
  },
  {
    id: '4',
    name: 'Burrata & Heirloom Tomato',
    description: 'Fresh burrata cheese, heirloom tomatoes, balsamic glaze, pesto drizzle.',
    price: 22,
    category: 'starter',
    image: 'https://picsum.photos/seed/salad/400/300'
  },
  {
    id: '5',
    name: 'Gold Leaf Tiramisu',
    description: 'Classic mascarpone cream, espresso soaked savoiardi, topped with 24k edible gold.',
    price: 16,
    category: 'dessert',
    image: 'https://picsum.photos/seed/cake/400/300',
    popular: true
  },
  {
    id: '6',
    name: 'Smoked Old Fashioned',
    description: 'Bourbon, angostura bitters, maple syrup, smoked with oak wood.',
    price: 18,
    category: 'drinks',
    image: 'https://picsum.photos/seed/drink/400/300'
  }
];

export const CATEGORIES = ['All', 'Starter', 'Main', 'Pizza', 'Dessert', 'Drinks'];
