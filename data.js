window.CAFEFLOW_DATA = {
  menu: [
    {
      id: "f1",
      name: "Jollof Rice & Chicken",
      category: "Main Meals",
      price: 42,
      available: true,
      prep: 8,
      image: "https://eatwellabi.com/wp-content/uploads/2022/11/Jollof-rice-16.jpg",
      description: "Smoky jollof rice served with grilled chicken and fresh vegetables."
    },
    {
      id: "f2",
      name: "Waakye Special",
      category: "Main Meals",
      price: 38,
      available: true,
      prep: 7,
      image: "https://tse3.mm.bing.net/th/id/OIP.GLZfAFjCqA-PfH1v7ieWfgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      description: "Waakye with spaghetti, egg, gari and spicy shito."
    },
    {
      id: "f3",
      name: "Fried Rice Combo",
      category: "Main Meals",
      price: 40,
      available: true,
      prep: 7,
      image: "https://th.bing.com/th/id/R.8265602878533bed28ecb3bb14e6a635?rik=OURGOE%2bapg7rbw&pid=ImgRaw&r=0",
      description: "Vegetable fried rice with chicken and a light pepper sauce."
    },
    {
      id: "f4",
      name: "Kelewele",
      category: "Snacks",
      price: 18,
      available: true,
      prep: 4,
      image: "https://tse2.mm.bing.net/th/id/OIP.9J6oeiRL31FE1wMUnGcEZwHaFi?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      description: "Spiced fried plantain served hot in a snack cup."
    },
    {
      id: "f5",
      name: "Sobolo",
      category: "Drinks",
      price: 10,
      available: true,
      prep: 1,
      image: "https://tse1.mm.bing.net/th/id/OIP.UuFn3HELXPEO29VCAm-ypgHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      description: "Chilled hibiscus drink with ginger and pineapple notes."
    },
    {
      id: "f6",
      name: "Fresh Pineapple Juice",
      category: "Drinks",
      price: 14,
      available: true,
      prep: 2,
      image: "https://tse1.mm.bing.net/th/id/OIP.tgZ1i7esQqQwQnl4sOeonQHaGZ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      description: "Cold pressed pineapple juice served fresh."
    },
    {
      id: "f7",
      name: "Egg Sandwich",
      category: "Breakfast",
      price: 22,
      available: true,
      prep: 5,
      image: "https://tse1.mm.bing.net/th/id/OIP.9W9X2PQ8vrxH-glbboWAUQHaFl?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      description: "Toasted bread with egg, tomato and a light house sauce."
    },
    {
      id: "f8",
      name: "Breakfast Tea",
      category: "Breakfast",
      price: 12,
      available: false,
      prep: 3,
      image: "https://media01.stockfood.com/largepreviews/MzQ3OTk0NzE2/11225636-English-breakfast-tea-in-a-cup.jpg",
      description: "Hot tea served with milk and sugar."
    }
  ],
  seedOrders: [
    {
      id: "CF-1041",
      customer: "Ama",
      status: "Preparing",
      total: 52,
      createdAt: "12:05",
      payment: "Mobile Money",
      items: [
        { id: "f1", name: "Jollof Rice & Chicken", price: 42, qty: 1 },
        { id: "f5", name: "Sobolo", price: 10, qty: 1 }
      ]
    },
    {
      id: "CF-1042",
      customer: "Kojo",
      status: "Preparing",
      total: 76,
      createdAt: "12:08",
      payment: "Campus Card",
      items: [
        { id: "f2", name: "Waakye Special", price: 38, qty: 2 }
      ]
    },
    {
      id: "CF-1043",
      customer: "Esi",
      status: "Ready",
      total: 40,
      createdAt: "12:10",
      payment: "Cash",
      items: [
        { id: "f3", name: "Fried Rice Combo", price: 40, qty: 1 }
      ]
    }
  ]
};
