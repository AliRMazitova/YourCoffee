export const drinks = [
  {
    slug: "caramel-macchiato",
    title: "Карамельный макиато",
    price: 575,
    priceLabel: "575 ₽",
    description:
      "Слои эспрессо, ванильного сиропа и вспененного молока, завершённые густой карамельной сеткой.",
    shortDescription:
      "Классический сладкий напиток с мягкой ванильной основой и насыщенным карамельным финишем.",
    tags: ["Сладкий", "Молочный"],
    badges: ["Карамель", "Горячий"],
    temperature: "hot",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCWYepmsZY_iB41BYO-nPI06DXsy3p0feV69bYNw4hg9KeJdVDQW86otC_E-xcNtMFedNqDwrnsxz8oAkWq3ocanCWajzam4yKVVCrQ8AesJtKa-k9h5g4PUIT-2nzGL7PtjHCH3N3u3cjcMn1WkQTWpTPTK6fi4SFdrMNn155iFGR0DAW7YTYjA5FAElu0ITZTuB7h_GsUIJTpSjU2wvdYsXN00vPBjkm7Pu52MD7ctvJHfaN2onFaFnQSumRPm2TJmHqdNJQUww",
    aromaNotes: ["Бархатный", "Сливочный"],
    milkOptions: [
      { id: "whole", label: "Цельное", icon: "local_cafe" },
      { id: "oat", label: "Овсяное", icon: "grass", featured: true },
      { id: "soy", label: "Соевое", icon: "eco" },
    ],
    toppings: ["Доп. карамель", "Морская соль", "Корица"],
    ingredients: [
      "Фирменный эспрессо-бленд",
      "Фильтрованная вода",
      "Ванильный сироп",
      "Молоко на выбор",
      "Густой карамельный соус",
    ],
    nutrition: [
      { label: "Калории", value: "250" },
      { label: "Белки", value: "10 г" },
      { label: "Жиры", value: "7 г" },
      { label: "Углеводы", value: "35 г" },
    ],
    servingNote: "Пищевая ценность рассчитана для порции 16 oz на овсяном молоке.",
  },
  {
    slug: "cappuccino",
    title: "Капучино",
    price: 350,
    priceLabel: "350 ₽",
    description: "Классика с густой молочной пенкой и мягким вкусом.",
    shortDescription:
      "Сбалансированный эспрессо с плотной пеной и чистым кофейным послевкусием.",
    tags: ["Молочный", "Горький"],
    badges: ["Молочный", "Горячий"],
    temperature: "hot",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-JKptV3svBXKAdcMcjnTDT-3zITf4-LvU9sZMIuhEeyRKPJUpvF4ZoVCUkO65qlL7xAsy7oOdbSNAQ5S-Q-zxmTITXkl5fX6fzewmNIYzLMaStKQ8N-rcS-tMGmsM40uvOtaFmZwbgW4qTb-jzPGFdQAWNQqbGho7a-nSAqVknDd8xelA9vqGNRrosymKSEMyyAidjsSUhhbh5tXckITrN9bIToqE29LnUi9Q4nqJG1DaAmRkCTzpM1pnkLRsQrSS_l__GGOMFA",
  },
  {
    slug: "latte",
    title: "Латте",
    price: 380,
    priceLabel: "380 ₽",
    description: "Больше молока, меньше кофе. Идеально для неспешного завтрака.",
    shortDescription:
      "Мягкий молочный кофе с деликатным телом и комфортной сладостью.",
    tags: ["Молочный", "Сладкий"],
    badges: ["Мягкий", "Горячий"],
    temperature: "hot",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBkQ2GCBKuIQkSxbLJdwVTiQY49dOlIiaaMZEiFjsdqZM9zdzRfoP2BoYpBwO2LvzHvdmW7j9lnXRysVdGLoHovVrwuGfZ6_gURGBmcN16uHwNwvIaYnA7pPBtHSDKOsK_NmZ_NZqnfc07mgnfgtg_xtviqgZ86XgQhX-8iZtIstyx_AF8uFGnPVLywR_4raVY2hArkWEOHIYxF3ONLUMO07p2afQ2pJ1hdfdo77N8Ytfa4L0dI4zqUTMDnXE7GX1bQMFKO8p4Ddw",
  },
  {
    slug: "americano",
    title: "Американо",
    price: 250,
    priceLabel: "250 ₽",
    description: "Чистый вкус эспрессо, разбавленный горячей водой для лёгкости.",
    shortDescription:
      "Прямой и бодрый профиль для тех, кто любит насыщенный кофе без молока.",
    tags: ["Горький"],
    badges: ["Чёрный", "Горячий"],
    temperature: "hot",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCPtf3gSKuEvhJJMnqK8h26LwXtATjof_gN55wyxul5XaUHc_0rlZVoxX_Ow04pT6iAVSBFEAMjkpT1UxYNnLrTjahZa0-uSpvOB7x9VRkVHYqokJIUhYGBTfVxCwK6Dx_3wtgyWl5luJ7th1SMpze0vxokRWqzeF5f5SHKIUGZ0DQp4DGjQ-3wY5_5cSIAcqTXDiPmcN_mzZsAiSCoWyAjeUKltEleIapDKZ4LsWh1XzRY5DPrwxWnpPVkGctP1ubJg-9lmj_x1w",
  },
  {
    slug: "espresso-tonic",
    title: "Эспрессо-тоник",
    price: 420,
    priceLabel: "420 ₽",
    description: "Освежающий микс эспрессо, тоника и цитрусового акцента.",
    shortDescription:
      "Холодный бодрящий напиток с яркой горчинкой и чистым цитрусовым послевкусием.",
    tags: ["Горький", "Свежий"],
    badges: ["Цитрус", "Холодный"],
    temperature: "cold",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA6PGcsTJ5n6gAXxeobpC_77LuvKR8sV2unW8dFRfgJJuafcJnWWT4UGuD6Cdc46GeApxxGPXoREE0gwzgGBIY4-lXHbzrhzU1B6UBx-exbQq05y7Ev2JpyBctWhwXG8vdrT3GIxO2nP7by08xVasaJi2yBHaYrzpGP3ahjLHo6W414gfuqM5FDDA40Ojff7uXBQ97Gr38FmUhyDCC8ppI3lvwmDH4rYqSxgOsfhd5VdsJGz6n5mQh1KVZtt9DSNCk53vdNA2XyNw",
  },
  {
    slug: "iced-latte",
    title: "Айс-латте",
    price: 400,
    priceLabel: "400 ₽",
    description: "Холодный латте с мягкой текстурой и сливочным послевкусием.",
    shortDescription:
      "Лёгкий летний формат с молочной округлостью и спокойным кофейным профилем.",
    tags: ["Молочный", "Сладкий"],
    badges: ["Молочный", "Холодный"],
    temperature: "cold",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDfBV7zB0hNKF_K8XWK4mUlCuWj8urUUgBeHvs-nzaj1rFYyfWzFZfs84ES41tooaR-loYRONm96Zs3C9snHLMV12S_e7I3U2psqfwNOzKtzEQbpALzozuJz7V2QISifoWh5RVeqz_i3jiBzm8DizQa2k9WXutyGZKpBz9w7u41zqpvykYUxZYscSHBRD23BSxtLYNg2BeO7NzDU0_R9qBaH8nbq54xzn5sr9nmcnkHbOk4AH0eSkaFvScaF2ziY7OQys5mPXY5qw",
  },
  {
    slug: "caramel-frappe",
    title: "Фраппе карамель",
    price: 460,
    priceLabel: "460 ₽",
    description: "Десертный холодный напиток с карамельной сладостью и плотной пеной.",
    shortDescription:
      "Насыщенный холодный десерт с карамельным телом и мягкой кофейной основой.",
    tags: ["Сладкий", "Молочный"],
    badges: ["Десертный", "Холодный"],
    temperature: "cold",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuASIf8ud6tEz8ylnu1uM911Ha6QDZNZksHOWEQB5L4Aen9T3baDCnfl4OUMEkqUdEMVD88LkMKOo74x-Gm5budzaCseY6fFEr7_hgufu0snFd14u9Tiz8wZIc7ZkMts7oGK_4AVfp2HVETfGvccjbahlk-dmIOjXDjCP85ByGzlJgdBXLasZm3h2cmgnzHgYiitzhKgVRvMFAk9mP3OgncxyUY12Yy_FvyS7KayiB1FdmUD5n0Uan_AE_2kNLzIAcCM_XjpjsgwHA",
  },
];

export function getDrinkBySlug(slug) {
  return drinks.find((drink) => drink.slug === slug);
}
