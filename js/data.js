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
    },
    science: {
      label: "Science",
      words: ["ATOM", "CELL", "GENE", "MASS", "FORCE", "ENERGY", "MATTER", "GRAVITY", "MAGNET", "OXYGEN",
        "CARBON", "PROTON", "NEUTRON", "ELECTRON", "MOLECULE", "ELEMENT", "COMPOUND", "REACTION",
        "FRICTION", "VELOCITY", "PHOTOSYNTHESIS", "EVOLUTION", "ECOSYSTEM", "HYPOTHESIS", "EXPERIMENT",
        "MICROSCOPE", "TELESCOPE", "LABORATORY", "OBSERVATION", "TEMPERATURE", "CONDUCTOR", "NUCLEUS"]
    },
    space: {
      label: "Space",
      words: ["SUN", "MOON", "STAR", "MARS", "ORBIT", "COMET", "EARTH", "VENUS", "SATURN", "PLANET",
        "GALAXY", "METEOR", "ROCKET", "JUPITER", "MERCURY", "NEPTUNE", "URANUS", "ECLIPSE", "ASTEROID",
        "ASTRONAUT", "SATELLITE", "UNIVERSE", "TELESCOPE", "GRAVITY", "NEBULA", "CRATER", "SUPERNOVA",
        "CONSTELLATION", "OBSERVATORY", "SPACECRAFT"]
    },
    body: {
      label: "The Human Body",
      words: ["ARM", "LEG", "EYE", "EAR", "NOSE", "HAND", "FOOT", "KNEE", "BONE", "SKIN", "HEART", "LUNGS",
        "BRAIN", "BLOOD", "MUSCLE", "SPINE", "ELBOW", "SHOULDER", "STOMACH", "KIDNEY", "LIVER", "SKELETON",
        "INTESTINE", "ARTERY", "NERVOUS", "DIGESTION", "CIRCULATION", "RESPIRATION", "VERTEBRA", "TENDON"]
    },
    technology: {
      label: "Technology",
      words: ["APP", "WIFI", "MOUSE", "EMAIL", "PHONE", "TABLET", "LAPTOP", "SCREEN", "BUTTON", "CHARGER",
        "BATTERY", "PRINTER", "WEBSITE", "PASSWORD", "KEYBOARD", "INTERNET", "SOFTWARE", "HARDWARE",
        "DOWNLOAD", "COMPUTER", "BROWSER", "DATABASE", "ALGORITHM", "BLUETOOTH", "SPREADSHEET",
        "CALCULATOR", "PROGRAMMING", "ENCRYPTION", "BANDWIDTH", "SMARTPHONE"]
    },
    geography: {
      label: "Countries of the World",
      words: ["PERU", "CUBA", "CHAD", "INDIA", "JAPAN", "EGYPT", "KENYA", "NEPAL", "GHANA", "CHINA",
        "ITALY", "SPAIN", "CHILE", "FRANCE", "CANADA", "BRAZIL", "MEXICO", "NORWAY", "SWEDEN", "GREECE",
        "TURKEY", "ICELAND", "IRELAND", "POLAND", "VIETNAM", "MOROCCO", "JAMAICA", "PORTUGAL", "THAILAND",
        "COLOMBIA", "AUSTRALIA", "ARGENTINA", "INDONESIA", "PHILIPPINES", "SWITZERLAND"]
    },
    vocabulary: {
      label: "Challenge Vocabulary",
      words: ["VIVID", "FRUGAL", "CANDID", "HUMBLE", "ZEALOUS", "DILIGENT", "ABUNDANT", "ELOQUENT",
        "JUBILANT", "INNOVATE", "PERSEVERE", "RESILIENT", "NOSTALGIA", "TENACIOUS", "PRAGMATIC",
        "EPHEMERAL", "AMBIGUOUS", "BENEVOLENT", "GREGARIOUS", "METICULOUS", "OPTIMISTIC", "UBIQUITOUS",
        "WHIMSICAL", "SERENDIPITY", "CONSCIENTIOUS", "MAGNANIMOUS", "PERSPECTIVE", "INDEPENDENT",
        "COLLABORATE", "PERSPICACIOUS", "EMPATHETIC", "INQUISITIVE"]
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
