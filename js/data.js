/* Word lists for Wrkshets.
 * Themes are everyday, adult-appropriate topics. All words are single words
 * using only the letters A–Z so they work in every puzzle type. */
(function (root) {
  var WS = (root.WS = root.WS || {});

  WS.THEMES = {
    kitchen: {
      label: "Kitchen & Cooking",
      words: ["PAN", "POT", "CUP", "BOWL", "FORK", "SPOON", "KNIFE", "PLATE", "OVEN", "STOVE",
        "SINK", "KETTLE", "TOASTER", "BLENDER", "FRIDGE", "APRON", "RECIPE", "MIXER", "LADLE",
        "GRATER", "TONGS", "WHISK", "NAPKIN", "SKILLET", "COLANDER", "TIMER", "MUG", "LID", "JAR"]
    },
    grocery: {
      label: "Grocery Store",
      words: ["MILK", "BREAD", "EGGS", "RICE", "BEANS", "APPLE", "BANANA", "CHEESE", "BUTTER",
        "CEREAL", "PASTA", "SOUP", "CARROT", "ONION", "POTATO", "TOMATO", "ORANGE", "LETTUCE",
        "CHICKEN", "YOGURT", "COFFEE", "TEA", "JUICE", "CART", "BASKET", "RECEIPT", "COUPON",
        "CASHIER", "AISLE", "OATS", "HONEY", "LEMON", "GRAPES", "PEAS", "CORN"]
    },
    home: {
      label: "Around the House",
      words: ["BED", "LAMP", "SOFA", "CHAIR", "TABLE", "DOOR", "WINDOW", "RUG", "CLOCK", "SHELF",
        "PILLOW", "BLANKET", "MIRROR", "SHOWER", "TOWEL", "CLOSET", "DRAWER", "CURTAIN", "STAIRS",
        "HALLWAY", "GARDEN", "PORCH", "KEYS", "BROOM", "MOP", "VACUUM", "LAUNDRY", "DESK", "FAN", "SOAP"]
    },
    weather: {
      label: "Weather & Seasons",
      words: ["SUN", "RAIN", "SNOW", "WIND", "FOG", "HAIL", "CLOUD", "STORM", "SUNNY", "RAINBOW",
        "THUNDER", "FROST", "ICE", "HEAT", "COLD", "WARM", "BREEZE", "SPRING", "SUMMER", "AUTUMN",
        "WINTER", "UMBRELLA", "JACKET", "BOOTS", "SLEET", "DRIZZLE", "FORECAST", "HUMID", "CHILLY"]
    },
    feelings: {
      label: "Feelings",
      words: ["HAPPY", "SAD", "CALM", "PROUD", "TIRED", "ANGRY", "SCARED", "BRAVE", "KIND", "GLAD",
        "UPSET", "RELAXED", "EXCITED", "NERVOUS", "BORED", "CONFUSED", "HOPEFUL", "THANKFUL",
        "LONELY", "CURIOUS", "SAFE", "PEACEFUL", "JOYFUL", "WORRIED", "FRIENDLY", "CONTENT", "OKAY"]
    },
    work: {
      label: "Jobs & Work",
      words: ["NURSE", "CHEF", "BAKER", "PILOT", "FARMER", "DOCTOR", "TEACHER", "DRIVER", "CLERK",
        "PAINTER", "PLUMBER", "COOK", "DENTIST", "LIBRARY", "OFFICE", "SHIFT", "BADGE", "UNIFORM",
        "PAYCHECK", "SCHEDULE", "MEETING", "BREAK", "LUNCH", "TEAM", "BOSS", "TASK", "SALARY",
        "GARDENER", "CASHIER", "JANITOR", "MECHANIC"]
    },
    transport: {
      label: "Getting Around",
      words: ["BUS", "CAR", "TRAIN", "BIKE", "TAXI", "PLANE", "BOAT", "TRUCK", "SUBWAY", "TICKET",
        "STATION", "ROAD", "MAP", "STOP", "SEATBELT", "HELMET", "CROSSWALK", "SIGNAL", "PARKING",
        "SIDEWALK", "FERRY", "TRAM", "SCOOTER", "WALK", "ROUTE", "DRIVER", "WHEEL", "TRIP", "LANE"]
    },
    animals: {
      label: "Animals",
      words: ["CAT", "DOG", "COW", "PIG", "OWL", "FOX", "BEAR", "DEER", "DUCK", "FROG", "GOAT",
        "HORSE", "MOUSE", "RABBIT", "TURTLE", "TIGER", "LION", "ZEBRA", "MONKEY", "GIRAFFE",
        "ELEPHANT", "PENGUIN", "DOLPHIN", "SHARK", "WHALE", "PARROT", "SQUIRREL", "HAMSTER",
        "SHEEP", "EAGLE"]
    },
    nature: {
      label: "Nature & Outdoors",
      words: ["TREE", "LEAF", "ROCK", "LAKE", "HILL", "SAND", "PARK", "SEED", "ROOT", "FERN",
        "RIVER", "OCEAN", "BEACH", "FLOWER", "FOREST", "MEADOW", "VALLEY", "ISLAND", "DESERT",
        "MOUNTAIN", "PEBBLE", "BRANCH", "SUNSET", "MOSS", "TRAIL", "CREEK", "PINE", "STONE",
        "GRASS", "PETAL"]
    },
    hobbies: {
      label: "Hobbies & Fun",
      words: ["MUSIC", "DRAW", "PAINT", "READ", "BAKE", "SING", "DANCE", "SWIM", "HIKE", "KNIT",
        "PUZZLE", "GAMES", "MOVIES", "CARDS", "CHESS", "GUITAR", "PIANO", "GARDEN", "CAMERA",
        "CRAFTS", "BOWLING", "FISHING", "COOKING", "YOGA", "POETRY", "LEGO", "COMICS", "BIKING",
        "WRITING", "SEWING"]
    },
    money: {
      label: "Money & Shopping",
      words: ["CASH", "COIN", "BILL", "CARD", "BANK", "SAVE", "SPEND", "PRICE", "SALE", "WALLET",
        "PURSE", "CHANGE", "DOLLAR", "PENNY", "NICKEL", "DIME", "QUARTER", "BUDGET", "RECEIPT",
        "STORE", "TOTAL", "DEPOSIT", "CHECK", "REFUND", "DISCOUNT", "PAYMENT", "TAX", "TIP", "COST"]
    },
    health: {
      label: "Health & Self-Care",
      words: ["SLEEP", "WATER", "WALK", "REST", "BATH", "BRUSH", "FLOSS", "SOAP", "SHAMPOO",
        "STRETCH", "BREATHE", "VITAMIN", "DOCTOR", "NURSE", "HEALTHY", "EXERCISE", "MEDICINE",
        "LOTION", "COMB", "TOOTHPASTE", "NAP", "SNACK", "FRUIT", "SALAD", "STEPS", "PULSE",
        "CALM", "QUIET", "HYDRATE"]
    },
    clothing: {
      label: "Clothing",
      words: ["HAT", "CAP", "SHIRT", "PANTS", "SOCKS", "SHOES", "COAT", "DRESS", "SKIRT", "SCARF",
        "GLOVES", "JACKET", "SWEATER", "HOODIE", "BOOTS", "SANDALS", "BELT", "TIE", "VEST",
        "PAJAMAS", "SHORTS", "JEANS", "MITTENS", "SNEAKERS", "POCKET", "BUTTON", "ZIPPER",
        "COLLAR", "SLEEVE"]
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
