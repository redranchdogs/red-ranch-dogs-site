import previousLitters from "./previousLitters.json";
const cdn = "https://images.squarespace-cdn.com/content/v1/5f62b20fcd7dbb04e4f4f5a6";
const seed = "/images/seed";

export const brand = {
  name: "Red Ranch Dogs",
  tagline: "Country Raised Doodles",
  phone: "512-309-1077",
  sms: "sms:+15123091077",
  email: "support@redranchdogs.com",
  paymentEmail: "adam@redranchdogs.com",
  instagram: "https://www.instagram.com/redranchdogs/",
  googleReviews: "https://www.google.com/maps/search/?api=1&query=Red%20Ranch%20Dogs&query_place_id=ChIJ70JDw_7GNIURHsrR6cWBqXQ",
  location: "Salado, Texas",
  logo: `${seed}/red-ranch-dogs-2026-logo-wide.png`,
  favicon: `${cdn}/18651cef-f4eb-4430-9ab3-2826e9d3b2fc/favicon.ico?format=100w`
};

export const images = {
  hero: `${seed}/hero-puppy.webp`,
  homeHero: `${seed}/home-scone-hero.jpg`,
  doodles: `${seed}/doodles.webp`,
  cta: `${seed}/cta-puppy.webp`,
  family: `${seed}/family.webp`,
  damsGoldendoodle: `${seed}/dam-goldendoodle.webp`,
  damsBernedoodle: `${seed}/dam-bernedoodle.webp`,
  damsPoodle: `${seed}/dam-poodle.webp`,
  damsCavapoo: `${seed}/dam-cavapoo.webp`,
  flora: `${seed}/flora.webp`,
  studBernedoodle: `${seed}/stud-bernedoodle.webp`,
  studGoldendoodle: `${seed}/stud-goldendoodle.webp`,
  studPoodle: `${seed}/stud-poodle.webp`,
  currentHoney: `${seed}/family.webp`,
  currentBirdie: `${seed}/birdie.webp`
};

export const navGroups = [
  { label: "Home", href: "/" },
  {
    label: "Puppies",
    href: "/puppies",
    links: [
      { label: "Available Puppies", href: "/puppies/available" },
      { label: "Current Litters", href: "/puppies/current-litters" },
      { label: "Upcoming Litters", href: "/puppies/upcoming-litters" },
      { label: "Previous Litters", href: "/puppies/previous-litters" },
      { label: "Goldendoodle Puppies", href: "/puppies/goldendoodle-puppies" },
      { label: "Cavapoo Puppies", href: "/puppies/cavapoo-puppies" },
      { label: "Bernedoodle Puppies", href: "/puppies/bernedoodle-puppies" }
    ]
  },
  {
    label: "Parents",
    href: "/parents",
    links: [
      { label: "Mamas", href: "/parents/mamas" },
      { label: "Studs", href: "/parents/studs" },
      { label: "Goldendoodle Parents", href: "/parents/goldendoodle-parents" },
      { label: "Cavapoo Parents", href: "/parents/cavapoo-parents" },
      { label: "Bernedoodle Parents", href: "/parents/bernedoodle-parents" }
    ]
  },
  {
    label: "Process",
    href: "/process",
    links: [
      { label: "How It Works", href: "/process/how-it-works" },
      { label: "Pricing", href: "/process/pricing" },
      { label: "Application and Waitlist", href: "/process/application-and-waitlist" },
      { label: "Public Waitlist", href: "/process/waitlist" },
      { label: "What Comes With Your Puppy", href: "/puppies/what-comes-with-your-puppy" },
      { label: "Coat Traits", href: "/puppies/coat-traits" },
      { label: "Doodle Generations", href: "/puppies/doodle-generations" },
      { label: "FAQ", href: "/process/faq" },
      { label: "Puppy Pickup and Delivery", href: "/process/pickup-and-delivery" }
    ]
  },
  {
    label: "Stud Services",
    href: "/stud-services",
    links: [
      { label: "Our Studs", href: "/stud-services/our-studs" },
      { label: "Reproductive Services", href: "/stud-services/reproductive-services" },
      { label: "Reproductive Education", href: "/stud-services/reproductive-education" }
    ]
  },
  {
    label: "Guardian Program",
    href: "/guardian-program",
    links: [
      { label: "Guardian Program Overview", href: "/guardian-program" },
      { label: "Guardian Application", href: "/guardian-program/application" },
      { label: "Guardian Opportunities", href: "/guardian-program" },
      { label: "Guardian FAQ", href: "/guardian-program/faq" }
    ]
  },
  {
    label: "About",
    href: "/about",
    links: [
      { label: "Our Family", href: "/about/our-family" },
      { label: "Meet the Team", href: "/about/meet-the-team" },
      { label: "Reviews", href: "/about/reviews" },
      { label: "Contact", href: "/contact" }
    ]
  },
  { label: "Apply", href: "/apply" }
];

export const breeds = [
  {
    name: "Goldendoodles",
    route: "/puppies/goldendoodle-puppies",
    image: "/images/home/red-ranch-dogs-goldendoodle-home-card.jpg",
    imageAlt: "Goldendoodle puppy from Red Ranch Dogs",
    imagePosition: "50% 34%",
    copy: "A friendly, intelligent Golden Retriever and Poodle mix known for low-shedding coats, family-friendly temperaments, and teddy-bear looks."
  },
  {
    name: "Cavapoos",
    route: "/puppies/cavapoo-puppies",
    image: "/images/home/red-ranch-dogs-cavapoo-home-card.jpg",
    imageAlt: "Cavapoo puppy from Red Ranch Dogs",
    imagePosition: "50% 36%",
    copy: "A sweet Cavalier King Charles Spaniel and Poodle mix loved for cuddly personalities, adaptable size, and playful affection."
  },
  {
    name: "Bernedoodles",
    route: "/puppies/bernedoodle-puppies",
    image: "/images/home/red-ranch-dogs-bernedoodle-home-card.jpg",
    imageAlt: "Bernedoodle puppy from Red Ranch Dogs",
    imagePosition: "50% 42%",
    copy: "A loyal Bernese Mountain Dog and Poodle mix with affectionate personalities, calm confidence, and beautiful low-shedding coats."
  }
];

export const availablePuppies = [
  // The public Squarespace page currently does not expose individual available puppy cards.
  // Add puppies here when the next available list is confirmed.
];

export const currentLitters = [
  {
    name: "Honey + Bram",
    breed: "Micro Goldendoodles",
    delivery: "March 15, 2026",
    goHome: "May 2026",
    coloring: "Red Abstract",
    size: "10-15 lbs",
    coat: "Wavy, Straight",
    price: "$4500",
    status: "Current Litter",
    href: "/honey-bram",
    image: "/images/litters/honey-bram.webp"
  },
  // Legacy starter data retained for archive compatibility; public traffic redirects to /litters/birdie-waylon-spring-2026.
  {
    name: "Birdie + Waylon",
    breed: "Micro Goldendoodles",
    delivery: "April 1, 2026",
    goHome: "May 22-24, 2026",
    coloring: "Red Abstract",
    size: "20-25 lbs",
    coat: "Wavy, Straight",
    price: "$3200",
    status: "Current Litter",
    href: "/birdie-waylon-jennings-1",
    image: "/images/litters/birdie-waylon.webp"
  }
];

export const litterDetails = {
  "/honey-bram": {
    name: "Honey + Bram",
    breed: "Multigen Micro Goldendoodles",
    image: "/images/litters/honey-bram.webp",
    facts: [
      ["Delivery", "March 16, 2026"],
      ["Go Home", "May 9-10, 2026"],
      ["Coloring", "Apricot, Red, Red Chocolate"],
      ["Size", "10-15 lbs"],
      ["Coat", "Straight"],
      ["Price", "$4500"]
    ],
    parents: "Honey + Bram, outside stud",
    genetics: ["~70% Poodle", "~30% Golden Retriever"],
    copy: [
      "We are so excited to share this very special pairing between Honey and Bram, producing a stunning litter of Multigen Micro Goldendoodles.",
      "Honey is a beautiful multigen micro Goldendoodle weighing around 13 pounds. She has rich red-chocolate coloring, a gorgeous straight coat, and the sweetest temperament imaginable.",
      "Bram weighs around 10 pounds and brings an energetic, confident, and playful personality to this pairing. He is spunky, intelligent, and full of charm.",
      "These puppies are expected to be truly micro in size, likely falling right in the 10-15 pound full-grown range, with the potential for rich red-chocolate and caramel tones."
    ],
    puppies: [
      ["Buzz", "Male", "Blue Collar"],
      ["Bumble", "Male", "Orange Collar"],
      ["Bee", "Female", "Yellow Collar"],
      ["Honeycomb", "Female", "Pink Collar"],
      ["Hive", "Male", "Mint Collar"]
    ],
    milestones: ["4 Weeks Old", "3 Weeks Old", "2 Weeks Old", "1 Week Old"]
  },
  // Legacy detail entry retained for archive data; public traffic redirects to /litters/birdie-waylon-spring-2026.
  "/birdie-waylon-jennings-1": {
    name: "Birdie + Waylon",
    breed: "Multigen Goldendoodles",
    image: "/images/litters/birdie-waylon.webp",
    facts: [
      ["Delivery", "April 1, 2026"],
      ["Go Home", "May 23-24, 2026"],
      ["Coloring", "Red, Red Abstract"],
      ["Size", "20-25 lbs"],
      ["Coat", "Wavy, Straight"],
      ["Price", "$3200"]
    ],
    parents: "Birdie + Waylon",
    genetics: ["Approximately 42% Golden Retriever", "Approximately 58% Poodle"],
    copy: [
      "This pairing brings together gentle temperaments, intelligent instincts, and beautifully manageable coats.",
      "The balanced genetic makeup combines the affectionate, family-friendly nature of the Golden Retriever with the intelligence and coat qualities of the Poodle.",
      "These puppies are expected to have soft wavy to straight coats and genetically low-shedding traits.",
      "They are expected to mature to a petite mini size, typically between 20 and 25 pounds full grown."
    ],
    theme: "Birdie's Route 66 Road Trip Litter",
    puppies: [
      ["Diesel", "Male", "Blue Collar"],
      ["Arizona", "Female", "Pink Collar"],
      ["Ranger", "Male", "Brown Collar"],
      ["Axel", "Male", "Orange Collar"],
      ["Dakota", "Female", "Red Collar"],
      ["Indie", "Female", "Purple Collar"],
      ["Sedona", "Female", "Yellow Collar"]
    ],
    milestones: ["3 Weeks Old", "2 Weeks Old", "Newborn Photos"]
  },
  // Legacy detail entry retained for archive data; public traffic redirects to /litters/penny-wyatt-spring-2026.
  "/penny-wyatt": {
    name: "Penny + Wyatt",
    breed: "F1b Micro Cavapoos",
    image: "/images/litters/penny-wyatt.webp",
    facts: [
      ["Due", "April 2026"],
      ["Go Home", "June 2026"],
      ["Coloring", "Red Abstract, Parti"],
      ["Size", "10-18 lbs"],
      ["Coat", "Wavy"],
      ["Price", "$4500"]
    ],
    parents: "Penny + Wyatt",
    genetics: ["75% Poodle", "25% Cavalier King Charles Spaniel"],
    copy: [
      "We are incredibly excited about this sweet pairing between Penny and Wyatt, which will produce a beautiful litter of F1B Cavapoos.",
      "Penny is a lovely F1 Cavapoo weighing around 25 pounds, with a beautiful red and white parti coat and a deeply people-oriented temperament.",
      "Wyatt is a tiny 4 pound toy poodle with intelligence, confidence, and an affectionate temperament.",
      "These puppies should have soft, silky, wavy coats with beautiful red, apricot, and red-and-white parti coloring possible."
    ],
    puppies: [],
    milestones: []
  },
  // Legacy detail entry retained for archive data; public traffic redirects to /litters/winnie-wyatt-spring-2026.
  "/winnie-wyatt": {
    name: "Winnie + Wyatt",
    breed: "F1B Petite Mini Cavapoos",
    image: "/images/dams/winnie-red-ranch-dogs.webp",
    facts: [
      ["Due", "Late Summer 2026"],
      ["Go Home", "To be announced"],
      ["Coloring", "Red Abstract"],
      ["Size", "15-20 lbs"],
      ["Coat", "Wavy"],
      ["Price", "$3200"]
    ],
    parents: "Winnie + Wyatt",
    genetics: [],
    copy: ["This planned F1B Petite Mini Cavapoo pairing is expected later in summer once Winnie's timing is confirmed."],
    puppies: [],
    milestones: []
  }
};

export const upcomingLitters = {
  updated: "7/18/2026",
  groups: [
    {
      breed: "Goldendoodles",
      litters: [
        ["Ginny + Butch", "Mini Petite Goldendoodles", "Red Abstract | 20-25 lbs", "Due April 2026", "Go Home June 2026"],
        ["Whitley + Waylon", "Mini Goldendoodles", "Red Abstract | 25-30 lbs", "Due April 2026", "Go Home June 2026"],
        ["Faye + Sundance", "Multigen Petite Goldendoodles", "Chocolate + merle possibilities | 25-35 lbs", "Born May 23, 2026", "Go Home July 2026"],
        ["Georgia + Waylon", "Mini Goldendoodles", "Red Abstract | 20-25 lbs", "Born May 2026", "Go Home July 2026"]
      ]
    },
    {
      breed: "Bernedoodles",
      litters: [["Kylie + Ranger", "Micro Bernedoodles", "Tri Colored Chocolate | 20-25 lbs", "Planning in progress", ""]]
    },
    {
      breed: "Cavapoos",
      litters: [
        ["Reece + Wyatt", "F1B Micro Cavapoos", "Red Abstract, Apricot, Parti | 8-12 lbs", "Summer 2026 Planning", "/litters/reece-wyatt-summer-2026"],
        ["Winnie + Wyatt", "F1B Petite Mini Cavapoos", "Red Abstract | 15-20 lbs", "Expected Late Summer 2026", "/winnie-wyatt"]
      ]
    }
  ],
  pairingNote:
    "Upcoming pairings are planned around genetics, color traits, breed percentage, timing, and stud availability. Pairings may change if a better option is needed or a planned stud is unavailable."
};

const publicPreviousLitterGroups = [
  {
    group: "Goldendoodles",
    name: "Previous Litters Goldendoodles",
    href: "/previous-litters-goldendoodles",
    copy: "Mini, petite mini, and micro Goldendoodle litter history."
  },
  {
    group: "Bernedoodles",
    name: "Previous Litters Bernedoodles",
    href: "/previous-litters-bernedoodles",
    copy: "Browse previous Red Ranch Dogs Bernedoodle pairings with parent dogs, puppy photo examples, coat notes, and size history."
  },
  {
    group: "Cavapoos",
    name: "Previous Litters Cavapoos",
    href: "/previous-litters-cavapoos",
    copy: "Browse previous Red Ranch Dogs Cavapoo pairings with parent dogs, puppy photo examples, coat notes, and size history."
  }
];

const publicPreviousLitters = previousLitters.filter((litter) =>
  litter.visibility === "public" && publicPreviousLitterGroups.some((group) => group.group === litter.group)
);

export const previousLitterGroups = publicPreviousLitterGroups.map((group) => {
  const featuredLitter = publicPreviousLitters.find((litter) => litter.group === group.group);

  return {
    name: group.name,
    href: group.href,
    image: featuredLitter?.image || images.doodles,
    copy: group.copy
  };
});

export const previousLitterDetails = Object.fromEntries(
  publicPreviousLitters.map((litter) => {
    const details = { ...litter };
    const { href } = details;

    delete details.href;
    delete details.visibility;

    return [href, details];
  })
);

export const previousLitterArchiveGroups = Object.fromEntries(
  publicPreviousLitterGroups.map((group) => [
    group.href,
    {
      title: group.name,
      copy: group.copy,
      litters: publicPreviousLitters
        .filter((litter) => litter.group === group.group)
        .map((litter) => litter.href)
    }
  ])
);

export const parentDogs = {
  dams: [
    { name: "Goldendoodle Mamas", type: "Goldendoodle moms", image: images.damsGoldendoodle, href: "/parents/goldendoodle-parents" },
    { name: "Bernedoodle Mamas", type: "Bernedoodle moms", image: images.damsBernedoodle, href: "/parents/bernedoodle-parents" },
    { name: "Poodle Mamas", type: "Poodle moms", image: images.damsPoodle, href: "/parents/mamas" },
    { name: "Cavapoo Mamas", type: "Cavalier and Poodle lines", image: images.damsCavapoo, href: "/parents/cavapoo-parents" },
    { name: "Golden Retriever Mamas", type: "AKC Golden Retriever moms", image: images.flora, href: "/parents/mamas" }
  ],
  studs: [
    { name: "Bernedoodle Studs", type: "Tri, merle, chocolate and parti lines", image: images.studBernedoodle, href: "/stud-services/our-studs" },
    { name: "Goldendoodle Studs", type: "Red, chocolate and abstract lines", image: images.studGoldendoodle, href: "/stud-services/our-studs" },
    { name: "Poodle Studs", type: "Health-tested poodle studs", image: images.studPoodle, href: "/stud-services/our-studs" }
  ]
};

export const damProfiles = [
  {
    name: "Birdie",
    href: "/birdie",
    group: "Goldendoodle Dams",
    type: "F1 Mini Goldendoodle",
    weight: "28 lbs",
    image: "/images/dams/birdie.webp",
    genetics: "",
    copy: "Birdie is a mini F1 Goldendoodle and is a momma to F1b and multigenerational goldendoodles with straight and wavy coats.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair"],
    previousLitters: ["Birdie Litter 1", "Birdie Litter 2"]
  },
  {
    name: "Honey",
    href: "/honey",
    group: "Goldendoodle Dams",
    type: "Multigen Micro Goldendoodle",
    weight: "10-15 lbs",
    image: "/images/dams/honey.webp",
    genetics: "20% Golden Retriever, 80% Poodle",
    copy: "Honey is a micro Goldendoodle momma with gorgeous brown points and a sweet temperament. Her puppies are known for beautiful straight coats.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair"],
    previousLitters: ["Honey Litter 1"]
  },
  {
    name: "Phoebe",
    href: "/phoebe",
    group: "Goldendoodle Dams",
    type: "Multigen Goldendoodle",
    weight: "15 lbs",
    image: "/images/dams/phoebe.webp",
    genetics: "",
    copy: "Phoebe is a multigen Goldendoodle with a deeply sweet personality and a love for chasing water from the hose.",
    testing: ["Embark Testing", "GenSol Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips good"],
    previousLitters: ["Phoebe Litter 1", "Phoebe Litter 2", "Phoebe Litter 3"]
  },
  {
    name: "Daisy",
    href: "/daisy",
    group: "Goldendoodle Dams",
    type: "F1 Mini Goldendoodle",
    weight: "28 lbs",
    image: "/images/dams/daisy.webp",
    genetics: "",
    copy: "Daisy is an F1 mini Goldendoodle planned for F1b mini and micro goldendoodles with straight and wavy coats.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair"],
    previousLitters: []
  },
  {
    name: "Beatrix",
    href: "/beatrix",
    group: "Goldendoodle Dams",
    type: "F1 Goldendoodle",
    weight: "50 lbs",
    image: "/images/dams/beatrix.webp",
    genetics: "",
    copy: "Beatrix is an F1 Goldendoodle and a momma to F1b mini goldendoodles with straight and wavy coats.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair"],
    previousLitters: ["Beatrix Litter 1"]
  },
  {
    name: "June",
    href: "/june-2",
    group: "Goldendoodle Dams",
    type: "F1 Mini Goldendoodle",
    weight: "30 lbs",
    image: "/images/dams/june-2.webp",
    genetics: "ee KBKB ata BB SS FI +/- Curl, 7:3 Red Intensity, 50% Golden Retriever, 50% Poodle",
    copy: "June is a micro Goldendoodle momma from Flora and Enzo. She will produce F1b and multigen Goldendoodles.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair"],
    previousLitters: ["June Litter 1"]
  },
  {
    name: "Georgia",
    href: "/georgia",
    group: "Goldendoodle Dams",
    type: "F1 Mini Goldendoodle",
    weight: "25 lbs",
    image: "/images/dams/georgia.webp",
    genetics: "",
    copy: "Georgia is a micro Goldendoodle momma from Flora and Enzo. She will produce F1b and multigen Goldendoodles.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair"],
    previousLitters: []
  },
  {
    name: "Evie Nicks",
    href: "/evie-nicks",
    group: "Goldendoodle Dams",
    type: "Multigen Mini Goldendoodle",
    weight: "24 lbs",
    image: "/images/dams/evie-nicks.webp",
    genetics: "44% Golden Retriever, 56% Poodle",
    copy: "Evie Nicks is a multigenerational Goldendoodle with a gentle, affectionate nature and a calm, friendly temperament.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair"],
    previousLitters: []
  },
  {
    name: "Ginny",
    href: "/ginny",
    group: "Goldendoodle Dams",
    type: "Multigen Mini Goldendoodle",
    weight: "28 lbs",
    image: "/images/dams/ginny.webp",
    genetics: "52% Golden Retriever, 48% Poodle",
    copy: "Ginny is a petite multigenerational Goldendoodle with a gentle nature, sweet personality, and calm companion temperament.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair"],
    previousLitters: []
  },
  {
    name: "Whitley",
    href: "/whitley",
    group: "Goldendoodle Dams",
    type: "F1 Goldendoodle",
    weight: "Planning profile",
    image: "/images/dams/whitley.webp",
    genetics: "52% Golden Retriever, 47% Poodle",
    copy: "Whitley is a joyful Goldendoodle with a classic, soulful look, a silky wavy coat, and an affectionate temperament.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair"],
    previousLitters: []
  },
  {
    name: "Kylie",
    href: "/kylie",
    group: "Bernedoodle Dams",
    type: "Ultra Bernedoodle",
    weight: "est. 30-35 lbs",
    image: "/images/dams/kylie.webp",
    genetics: "",
    copy: "Kylie is an ultra Bernedoodle momma planned for micro ultra Bernedoodles and chocolate-toned puppies.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips good"],
    previousLitters: []
  },
  {
    name: "Tilly",
    href: "/tilly",
    group: "Bernedoodle Dams",
    type: "Ultra Bernedoodle",
    weight: "40 lbs",
    image: "/images/dams/tilly.webp",
    genetics: "Ee kyky atat BB SS FF -/- Curl, 7:3 Red Intensity, 61% Bernese Mountain Dog, 39% Poodle",
    copy: "Tilly is an ultra Bernedoodle from Aggy and Garth Brooks. Her higher Bernese Mountain Dog percentage supports mini ultra Bernedoodle pairings.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips good"],
    previousLitters: ["Tilly Litter 1"]
  },
  {
    name: "Sylvee",
    href: "/sylvee",
    group: "Bernedoodle Dams",
    type: "Multigen Micro Bernedoodle",
    weight: "22 lbs",
    image: "/images/dams/sylvee.webp",
    genetics: "Ee kyky atat bb Ssp FF +/- Curl, 8:2 Red Intensity, 25% Bernese Mountain Dog, 75% Poodle",
    copy: "Sylvee is a micro Bernedoodle momma with brown points who is planned for straight and wavy coats.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair"],
    previousLitters: []
  },
  {
    name: "Trudy",
    href: "/trudy",
    group: "Poodle Dams",
    type: "AKC Toy Poodle",
    weight: "6 lbs",
    image: "/images/dams/trudy.webp",
    genetics: "",
    copy: "Trudy is an AKC toy poodle momma with an old soul and a love for kids.",
    testing: ["Embark Testing", "UC Davis Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips good", "OFA patellas normal"],
    previousLitters: ["Trudy Litter 1", "Trudy Litter 2"]
  },
  {
    name: "Faye",
    href: "/faye",
    group: "Poodle Dams",
    type: "AKC Standard Poodle",
    weight: "50 lbs",
    image: "/images/dams/faye.webp",
    genetics: "",
    copy: "Faye is an AKC standard poodle mama with standout intelligence, a sweet steady temperament, and a strong history of healthy, happy puppies.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips good"],
    previousLitters: ["Faye Litter 1", "Faye Litter 2", "Faye + Bodhe Litter 1"]
  },
  {
    name: "Penny",
    href: "/penny-2",
    group: "Cavapoo Dams",
    type: "F1 Cavapoo",
    weight: "25 lbs",
    image: "/images/dams/penny-2.webp",
    genetics: "Ee kyky atat BB SS FF -/- Curl, 7:3 Red Intensity, 50% Cavalier King Charles Spaniel, 50% Poodle",
    copy: "Penny is an F1 Cavapoo from Ruby and Bodhe. She will produce F1b and multigen Cavapoos.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair", "OFA patellas normal"],
    previousLitters: []
  },
  {
    name: "Winnie",
    href: "/winnie",
    group: "Cavapoo Dams",
    type: "F1 Cavapoo",
    weight: "34 lbs",
    image: "/images/dams/winnie.webp",
    genetics: "Ee kyky atat BB SS FF -/- Curl, 7:3 Red Intensity, 50% Cavalier King Charles Spaniel, 50% Poodle",
    copy: "Winnie is an F1b Cavapoo momma from Ruby and Bodhe. She is planned for F1b and multigen Cavapoos.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair"],
    previousLitters: []
  },
  {
    name: "Reece",
    href: "/reece",
    group: "Cavapoo Dams",
    type: "F1 Cavapoo",
    weight: "15 lbs",
    image: "/images/dams/reece.webp",
    genetics: "ee Kbky atat BB SS FI +/- Curl, 7:3 Red Intensity, 50% Cavalier King Charles Spaniel, 50% Poodle",
    copy: "Reece is an F1b Cavapoo momma from Ember and Bodhe. She is planned for F1b and multigen Cavapoos.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair"],
    previousLitters: []
  },
  {
    name: "Flora",
    href: "/flora",
    group: "Golden Retriever Dams",
    type: "AKC Golden Retriever",
    weight: "55 lbs",
    image: "/images/dams/flora.webp",
    genetics: "",
    copy: "Flora is an AKC Golden Retriever momma with a sweet, adventurous personality.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips good"],
    previousLitters: ["Flora Litter 1", "Flora Litter 2", "Flora Litter 3"]
  },
  {
    name: "Lady",
    href: "/lady",
    group: "Golden Retriever Dams",
    type: "AKC English Retriever",
    weight: "60 lbs",
    image: "/images/dams/lady.webp",
    genetics: "",
    copy: "Lady is an AKC English Retriever momma described as smart, sweet, and loyal.",
    testing: ["Embark Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "OFA hips fair"],
    previousLitters: ["Lady Litter 1", "Lady Litter 2", "Lady Litter 3"]
  }
];

export const damDetails = Object.fromEntries(damProfiles.map((profile) => [profile.href, profile]));

export const damGroups = {
  "/goldendoodle-dams": {
    name: "Goldendoodle Dams",
    image: images.damsGoldendoodle,
    copy: "Goldendoodle mommas and future mommas, including F1, F1b, and multigenerational lines.",
    profiles: ["/birdie", "/honey", "/phoebe", "/daisy", "/beatrix", "/june-2", "/georgia", "/evie-nicks", "/ginny", "/whitley"]
  },
  "/bernedoodle-dams": {
    name: "Bernedoodle Dams",
    image: images.damsBernedoodle,
    copy: "Bernedoodle mommas and future mommas used for micro, mini, and ultra Bernedoodle pairings.",
    profiles: ["/kylie", "/tilly", "/sylvee"]
  },
  "/poodle-dams": {
    name: "Poodle Dams",
    image: images.damsPoodle,
    copy: "AKC poodle mommas supporting Goldendoodle, Cavapoo, and poodle pairings.",
    profiles: ["/trudy", "/faye"]
  },
  "/cavapoo-dams": {
    name: "Cavapoo Dams",
    image: images.damsCavapoo,
    copy: "Cavapoo mommas and future mommas used for F1b and multigenerational Cavapoo lines.",
    profiles: ["/penny-2", "/winnie", "/reece"]
  },
  "/golden-retriever-dams": {
    name: "Golden Retriever Dams",
    image: images.flora,
    copy: "AKC Golden Retriever and English Retriever mommas behind F1 Goldendoodle lines.",
    profiles: ["/flora", "/lady"]
  }
};

export const studCatalog = [
  {
    breed: "Bernedoodles",
    dogs: [
      ["Garth Brooks", "Multigen Mini Bernedoodle", "30 lbs", "Ee kyky atat Bb SS -/- FF, 7:3 Red Intensity, 32% Bernese Mountain Dog", "/garth-brooks"],
      ["Hank Williams", "F1 Mini Bernedoodle", "42 lbs", "EE kyky atat Bb SS +/-, 6:4 Red Intensity", "/hank-williams"],
      ["Beau", "F1 Mini Bernedoodle", "43 lbs", "Ee kyky atat Bb Ssp +/-, 6:4 Red Intensity", "/beau"]
    ]
  },
  {
    breed: "Goldendoodles",
    dogs: [
      ["Waylon Jennings", "Multigen Mini Goldendoodle", "19 lbs", "ee KBky atat Bb SS -/- FF, 10:0 Red Intensity, 32% Retriever", "/waylon-jennings"],
      ["Sundance", "Micro Goldendoodle", "11 lbs", "ee KBky atat bb spsp FF -/- Curl TT Shedding, 22.4% Golden Retriever", "/sundance"],
      ["Enzo", "Micro Goldendoodle", "13 lbs", "ee KBky aya BB Ssp +/- FF, 10:0 Red Intensity, 96% Poodle", "/enzo"],
      ["Butch Cassidy", "Micro Goldendoodle", "16 lbs", "ee KBky ata Bb Ssp FF -/- Curl TT Shedding, 16% Retriever", "/butch-cassidy"],
      ["Knox", "F1b Mini Goldendoodle", "10 lbs", "ee KBKB ata BB SS +/- FF, 9:1 Red Intensity, 33% Retriever", "/knox"]
    ]
  },
  {
    breed: "Poodles",
    dogs: [
      ["Robert Redford", "AKC Registered Moyen Poodle", "20 lbs", "ee kyky atat Bb Ssp +/+ FF, 9:1 Red Intensity", "/robert-redford"],
      ["Johnny Cash", "AKC Registered Toy Poodle", "6 lbs", "Ee kyky ayat Bb Ssp +/+ FF, 5:5 Red Intensity", "/johnn-cash"],
      ["Wyatt Earp", "AKC Toy Poodle", "4 lbs", "ee KBky atat BB SSp FF, 7:3 Red Intensity", "/wyatt"]
    ]
  },
  {
    breed: "Cavalier King Charles Spaniel",
    dogs: [["Bodhe", "AKC Cavalier King Charles Spaniel", "19 lbs", "ee kyky atat BB Ssp, 8:2 Red Intensity", "/bodhe"]]
  }
];

export const studDetails = {
  // Legacy path-keyed record retained for historical stud data; public traffic redirects to /parents/garth-brooks.
  "/garth-brooks": {
    name: "Garth Brooks",
    group: "Bernedoodles",
    type: "Multigen Mini Bernedoodle",
    weight: "30 lbs",
    genetics: "Ee kyky atat Bb SS -/- FF, 7:3 Red Intensity, 32% Bernese Mountain Dog",
    image: "/images/studs/garth-brooks-red-ranch-dogs.webp",
    fee: "$2000",
    testing: ["Embark Testing", "UC Davis Results"],
    semenEvals: ["Total Count: 1 billion 785 million, 94% motility", "Total Count: 900 million, 93% motility", "Total Count: 1 billion 150 million, 95% motility"],
    notes: ["Public page includes Garth photos and litter history sections."]
  },
  "/hank-williams": {
    name: "Hank Williams",
    group: "Bernedoodles",
    type: "F1 Mini Bernedoodle",
    weight: "42 lbs",
    genetics: "EE kyky atat Bb SS +/-, 6:4 Red Intensity",
    image: "/images/studs/hank-williams-red-ranch-dogs.webp",
    fee: "$1500",
    testing: ["Embark Testing", "UC Davis Results"],
    semenEvals: ["Total count: 2 billion 100 million, 97% motility", "Total count: 2 billion 178 million, 97% motility"],
    notes: ["Public page states Hank has sired over 242 puppies and over 32 litters."]
  },
  "/beau": {
    name: "Beau",
    group: "Bernedoodles",
    type: "F1 Mini Bernedoodle",
    weight: "43 lbs",
    genetics: "Ee kyky atat Bb Ssp +/-, 6:4 Red Intensity",
    image: "/images/studs/beau-red-ranch-dogs.webp",
    fee: "$1500",
    testing: ["Embark Testing", "UC Davis Results"],
    semenEvals: [],
    notes: ["Public page includes Beau's litter history section."]
  },
  "/waylon-jennings": {
    name: "Waylon Jennings",
    group: "Goldendoodles",
    type: "Multigen Mini Goldendoodle",
    weight: "19 lbs",
    genetics: "ee KBky atat Bb SS -/- FF, 10:0 Red Intensity, 32% Retriever",
    image: "/images/studs/waylon-jennings-red-ranch-dogs.webp",
    fee: "$1500",
    testing: ["Embark Testing", "UC Davis Results"],
    semenEvals: [],
    notes: []
  },
  "/sundance": {
    name: "Sundance",
    group: "Goldendoodles",
    type: "Micro Goldendoodle",
    weight: "11 lbs",
    genetics: "ee KBky atat bb spsp FF -/- Curl TT Shedding, 22.4% Golden Retriever",
    image: "/images/studs/sundance-red-ranch-dogs.webp",
    fee: "$1500",
    testing: ["Embark Testing", "UC Davis Results"],
    semenEvals: [],
    notes: []
  },
  "/enzo": {
    name: "Enzo",
    group: "Goldendoodles",
    type: "Micro Goldendoodle",
    weight: "13 lbs",
    genetics: "ee KBky aya BB Ssp +/- FF, 10:0 Red Intensity, 96% Poodle",
    image: "/images/studs/enzo-red-ranch-dogs.webp",
    fee: "$1500",
    testing: ["Embark Testing", "UC Davis Results"],
    semenEvals: ["Total count: 1 billion 75 million, 97% motility", "Total count: 920 million, 97% motility"],
    notes: ["Public page states Enzo has sired over 157 puppies and over 27 litters."]
  },
  "/butch-cassidy": {
    name: "Butch Cassidy",
    group: "Goldendoodles",
    type: "Micro Goldendoodle",
    weight: "16 lbs",
    genetics: "ee KBky ata Bb Ssp FF -/- Curl TT Shedding, 16% Retriever",
    image: "/images/studs/butch-cassidy-red-ranch-dogs.webp",
    fee: "$1500",
    testing: ["Embark Testing", "UC Davis Results"],
    semenEvals: [],
    notes: []
  },
  "/knox": {
    name: "Knox",
    group: "Goldendoodles",
    type: "F1b Mini Goldendoodle",
    weight: "10 lbs",
    genetics: "ee KBKB ata BB SS +/- FF, 9:1 Red Intensity, 33% Retriever",
    image: "/images/studs/knox-red-ranch-dogs.webp",
    fee: "$1500",
    testing: ["Embark Testing", "UC Davis Results"],
    semenEvals: ["Total Count: 882 million, 93% motility"],
    notes: []
  },
  "/robert-redford": {
    name: "Robert Redford",
    group: "Poodles",
    type: "AKC Registered Moyen Poodle",
    weight: "20 lbs",
    genetics: "ee kyky atat Bb Ssp +/+ FF, 9:1 Red Intensity",
    image: "/images/studs/robert-redford-red-ranch-dogs.webp",
    fee: "$1500",
    testing: ["Embark Testing", "UC Davis Results"],
    semenEvals: [],
    notes: []
  },
  // Legacy path-keyed record retained for historical stud data; public traffic redirects to /parents/studs.
  "/wayne": {
    name: "John Wayne",
    group: "Poodles",
    type: "AKC Registered Toy Poodle",
    weight: "4 lbs",
    genetics: "ee KBky atat BB SS +/+ FF, 9:1 Red Intensity",
    image: "/images/studs/wayne.webp",
    fee: "$1500",
    testing: ["Embark Testing", "UC Davis Results"],
    semenEvals: ["Total Count: 488 million, 85% motility", "Total Count: 284 million, 97% motility"],
    notes: ["AKC Poodle breedings are decided case by case."]
  },
  "/johnn-cash": {
    name: "Johnny Cash",
    group: "Poodles",
    type: "AKC Registered Toy Poodle",
    weight: "6 lbs",
    genetics: "Ee kyky ayat Bb Ssp +/+ FF, 5:5 Red Intensity",
    image: "/images/studs/johnny-cash-red-ranch-dogs.webp",
    fee: "$1500",
    testing: ["Embark Testing", "UC Davis Testing", "OFA cardiac normal/clear", "OFA elbows negative for dysplasia", "PennHIP right 0.38, left 0.49"],
    semenEvals: [],
    notes: []
  },
  "/wyatt": {
    name: "Wyatt Earp",
    group: "Poodles",
    type: "AKC Toy Poodle",
    weight: "4 lbs",
    genetics: "ee KBky atat BB SSp FF, 7:3 Red Intensity",
    image: "/images/studs/wyatt-earp-red-ranch-dogs.webp",
    fee: "$1500",
    testing: ["Embark Testing", "Health Testing"],
    semenEvals: [],
    notes: []
  },
  "/bodhe": {
    name: "Bodhe",
    group: "Cavalier King Charles Spaniel",
    type: "AKC Cavalier King Charles Spaniel",
    weight: "19 lbs",
    genetics: "ee kyky atat BB Ssp, 8:2 Red Intensity",
    image: "/images/studs/bodhe-red-ranch-dogs.jpg",
    fee: "$1500",
    testing: ["Embark Testing", "UC Davis Results"],
    semenEvals: [],
    notes: []
  }
};

export const priceGroups = [
  ["Goldendoodle Prices", ["Micro (15 lbs and under): $4,500", "Petite Mini (15-25 lbs): $3,200-$3,800", "Mini (25-40 lbs): $2,800"]],
  ["Bernedoodle Prices", ["Micro (15-25 lbs): $4,500", "Mini (25-50 lbs): $3,500-$4,500"]],
  ["Cavapoo Prices", ["Micro (15 lbs and under): $4,500", "Petite Mini (15-20 lbs): $3,800", "Mini (20-40 lbs): $2,800"]],
  ["Poodle Prices", ["Toy Poodle (~5 lbs): $4,500"]]
];

export const faqs = [
  ["Where are you located?", "We are located in Salado, Texas, conveniently between Austin and Waco."],
  ["What are your prices?", "Our puppies are priced between $2,800 and $4,500, depending on breed, size, and individual traits."],
  ["What comes with my puppy?", "A 2-year genetic health guarantee, microchip, health records, current food sample, training treats, Puppy Pal toy, and transition support."],
  ["Which payment options do you accept?", "Zelle is the preferred payment method. No puppy is reserved without payment, and all puppy payments are considered non-refundable retainers."],
  ["How do I reserve a puppy?", "Start with the puppy application. Once submitted, we contact you to confirm placement and guide next steps."],
  ["What is your waitlist process?", "A $500 non-refundable deposit secures your spot on the breed-specific waitlist you choose and applies toward the final puppy total."],
  ["Do you perform genetic health testing?", "Yes. Parent dogs are genetically health-tested, with additional testing when needed for accuracy and peace of mind."],
  ["Do you offer a health guarantee?", "Yes. Every puppy comes with a 2-year health guarantee covering life-threatening congenital or hereditary defects, with a licensed vet visit required within 3 business days of going home."],
  ["Do you remove dew claws or dock tails?", "No. Puppies keep their dew claws and tails intact."],
  ["Can I choose my own puppy?", "Yes. Puppy selection is based on waitlist order and happens through photos, videos, personality notes, and video calls rather than early in-person visits."],
  ["Do you allow visitors to meet puppies?", "No early puppy visits are allowed for health and safety before vaccinations. We provide frequent photo/video updates and can schedule video calls."],
  ["Which generations of Doodles do you breed?", "We breed F1, F1b, and Multigen Doodles."],
  ["Are Doodles hypoallergenic?", "No dog is entirely hypoallergenic, but many Doodles are low-shedding. For moderate to severe allergies, F1b or Multigen Doodles are often recommended."]
];

export const reviews = [
  {
    quote: "Red Ranch Dogs provided the best experience I could have ever hoped for. Willow came home with a tremendous head start in life.",
    name: "Michelle"
  },
  {
    quote: "Adam and Callie blessed us with an adorable Bernedoodle puppy and continued to be helpful as our pup grows.",
    name: "Shan"
  },
  {
    quote: "As first-time dog owners, they provided clear guidance and made the whole experience smooth and enjoyable.",
    name: "Emile"
  },
  {
    quote: "Our puppy is healthy, well-socialized, and has the sweetest temperament. You can tell he was raised in a loving environment.",
    name: "Mel"
  },
  {
    quote: "They matched us with our sweet Nori and made us feel confident and comfortable throughout the adoption process.",
    name: "Kimberly"
  },
  {
    quote: "The transition into our home has been so easy. Red Ranch Dogs raised the most perfect puppy for our family.",
    name: "Eric"
  }
];

export const puppyIncludedSections = [
  ["Health & Wellness", ["Comprehensive vet check", "Age-appropriate first vaccinations", "Routine deworming and parasite prevention", "Microchip included", "2-year genetic health guarantee"]],
  ["Training & Early Socialization", ["Early Neurological Stimulation (ENS)", "Early Scent Introduction (ESI)", "Sound and surface exposure", "Potty training foundations", "Crate exposure", "Litterbox training foundations"]],
  ["Puppy Take-Home Kit", ["Puppy Pal comfort toy scented by mom and littermates", "Premium puppy food sample", "Toys and chews", "Health and vaccine records", "Puppy care guide"]],
  ["Lifetime Support", ["Ongoing puppy family support", "Advice for feeding, grooming, training, and transition questions", "Optional flight nanny service", "Limited ground transportation in select regions"]]
];

export const teamMembers = [
  { name: "Callie", image: images.family },
  { name: "Nicole", image: images.cta },
  { name: "Adam", image: images.hero }
];

export const familyStory = [
  "Our journey began in two very different parts of the world: Dubai and New York. Callie was working as an international flight attendant for Emirates Airlines, and Adam was performing on Broadway. Despite the distance, we met, fell in love, and eventually moved back to Texas to start our family.",
  "Now, we are proud parents to three wonderful boys, along with our beloved Goldendoodle, Bree.",
  "Callie's passion for dog breeding started long before Red Ranch Dogs was born. She grew up in a family that bred dogs, so raising and caring for puppies has always been a big part of her life.",
  "At Red Ranch Dogs in Salado, Texas, we prioritize the health, wellbeing, and temperament of every puppy. Our puppies are raised in a retrofitted barn designed for their care, comfort, and daily enrichment.",
  "We are excited to continue improving our breeding practices and sharing the joy of Red Ranch Dogs with families across Texas."
];

export const guardianProgram = {
  fitHighlights: [
    ["Your family dog", "She lives with you as a loved indoor pet and future Red Ranch mama."],
    ["Breeding rights", "Red Ranch Dogs retains breeding rights during her breeding career."],
    ["Whelping happens at Red Ranch", "She stays with you during pregnancy, then returns to Red Ranch before delivery to whelp her puppies."],
    ["Ownership after retirement", "Full ownership transfers to your family after her breeding career."]
  ],
  benefits: [
    ["No puppy purchase cost", "There is no puppy purchase cost for an approved guardian placement; your family provides her everyday home, care, and love."],
    ["Breeding-related care", "Red Ranch Dogs covers breeding-related care and appointments during her program career."],
    ["Full ownership after retirement", "When her breeding career is complete, ownership transfers fully to the guardian family."]
  ],
  process: [
    ["Apply and talk it through", "We discuss your home, location, schedule, and the full guardian agreement before deciding whether the fit is right."],
    ["Welcome her as your family dog", "Once matched, she lives in your home as a loved indoor pet and future Red Ranch breeding mama."],
    ["Coordinate each breeding season", "When she comes into heat, you notify us right away. Together we coordinate testing, breeding appointments, and her scheduled drop-off and return."],
    ["Whelping at Red Ranch", "She stays with you during pregnancy, then returns to Red Ranch before delivery to whelp her puppies. She returns home to you after that season is complete."]
  ],
  expectations: [
    ["Local availability", "Female guardians should be close enough for breeding-related visits without it becoming a burden. Stud guardians need to be in Salado or very close."],
    ["Secure fenced yard", "A physical fenced yard is required so the dog can be safely managed at home."],
    ["Routine care", "Guardian families handle routine care, approved food, grooming, exercise, training, and normal veterinary needs."],
    ["Clear communication", "Quick communication matters around heat cycles, appointments, travel, moves, and health concerns."]
  ],
  faqs: [
    ["How close do guardian families need to live?", "Female guardians are usually best within about 30 to 60 minutes of Salado. Stud guardians need to live in Salado or very close by because timing can be more immediate."],
    ["What kind of family makes a good guardian home?", "The best fit is a stable local family that wants the dog to be a loved indoor pet, communicates quickly, keeps a secure home setup, and understands that timing matters during breeding seasons."],
    ["Can guardian families have children or other pets?", "Yes. Children are welcome, and other pets can be fine as long as they are safely managed and spayed or neutered."],
    ["Do guardian families pay to purchase the dog?", "No upfront puppy purchase is required for an approved guardian placement. Red Ranch Dogs retains breeding rights during the breeding career, and the guardian family provides the everyday home, care, and love."],
    ["Is the guardian dog our family dog?", "Yes. She lives with you as your family pet. The guardian agreement clearly gives Red Ranch Dogs breeding rights and explains the communication, drop-off, and return expectations during breeding-related seasons."],
    ["What happens when a female goes into heat?", "Guardians notify us right away so we can coordinate timing, testing, and breeding-related appointments."],
    ["How often would a female guardian have puppies?", "It depends on the dog, her health, timing, and what is best for her. We do not place a litter ahead of the mama's wellbeing, and we talk through timing with the guardian family as each season approaches."],
    ["Where does a mama go for whelping?", "Mama stays with her guardian family during pregnancy, then returns to Red Ranch Dogs before delivery to whelp her puppies. She returns home after that season is complete."],
    ["How long is a dog in the guardian program?", "The length depends on the dog and her breeding career. Once the breeding career is complete, ownership transfers fully to the guardian family."],
    ["Who covers veterinary costs?", "Guardian families handle routine and non-breeding veterinary care, just like they would for their own family dog. Red Ranch Dogs covers breeding-related expenses and appointments, and guardian families are compensated for eligible litters according to the guardian agreement."],
    ["What routine care is expected?", "Guardians handle everyday care such as approved food, grooming, exercise, basic training, normal vet care, and keeping the dog safe as an indoor family pet."],
    ["Do guardian families need a fenced yard?", "Yes. A secure physical fenced yard is required so the dog can be safely managed at home."],
    ["Can guardian families travel?", "Yes, but travel needs to be communicated early, especially around heat cycles, breeding timing, pregnancy, or any planned appointments."],
    ["What happens if we move?", "Tell us as early as possible. Local availability is a core part of the program, so a move may affect whether the guardian arrangement can continue as planned."],
    ["What if the program is not the right fit anymore?", "We want the arrangement to work well for the dog, the guardian family, and Red Ranch Dogs. If something changes, we talk through the situation directly and follow the guardian agreement."],
    ["Do you always have guardian openings?", "No. Guardian openings are shared when we are looking for the right local home for a specific future mama or stud."],
    ["Is the relationship personal or businesslike?", "It can be both. Some guardian families become close friends, while others prefer a more structured relationship. Either is great as long as care and communication are excellent."]
  ]
};

export const stopMarkingGuide = [
  {
    title: "The Mission",
    copy: "Marking is usually a habit and territory issue, not a potty-training issue. The reset is simple: prevent any successful indoor marks while building a strong outside routine.",
    items: ["Goal: zero successful indoor marks", "Timeline: 2 to 4 week reset", "Expect big improvement within the first week when the plan is consistent"]
  },
  {
    title: "Phase 1: Boot Camp",
    copy: "For the first 10 to 14 days, remove free roaming and keep the dog either supervised, tethered, crated, or outside for structured potty breaks.",
    items: ["Potty breaks every 1 to 2 hours at first", "Reward outdoor pees immediately", "Interrupt any pre-mark behavior and go straight outside"]
  },
  {
    title: "Clean the Scent Properly",
    copy: "Old scent can invite repeat marking. Use an enzymatic cleaner anywhere marking happened and avoid cleaners that only cover the smell.",
    items: ["Clean every known spot", "Use enzymatic cleaner", "Block access to favorite marking areas during reset"]
  },
  {
    title: "Phase 2: Earned Freedom",
    copy: "After 3 to 5 clean days, expand access slowly. If marking returns, shrink the space again for a few days and restart.",
    items: ["Expand to one new room at a time", "Keep rewarding outdoor potty trips", "Go back a step after any indoor mark"]
  }
];

export const reproductiveSections = [
  ["Quick Clarity", ["Start progesterone testing early enough to trend.", "Identify LH surge and ovulation range.", "Breed in the fertilizable window.", "Use observation to support the data."]],
  ["Progesterone Machines", ["IDEXX Catalyst and Wondfo Pro DX / PETlife can use different calibration and reference guidance.", "Trending over time matters more than one isolated number.", "Avoid switching analyzers mid-cycle when possible."]],
  ["Progesterone Stalls", ["A stall can look like repeated similar values or a very slow climb.", "Shorten testing intervals to every 24 hours until movement is clear.", "Do not schedule breedings by calendar days alone in a stall cycle."]],
  ["What Else To Watch", ["Bleeding amount and color shift.", "Flagging and standing behavior.", "Interest in males.", "Vulvar swelling changes.", "Vaginal cytology or vet exam when uncertain."]],
  ["Breeding Timing Tips", ["Trend beats one number.", "Test more often as the window approaches.", "One or two breedings can cover the window.", "Semen quality changes timing decisions."]]
];

export const migrationChecklist = [
  ["Homepage", "Homepage sections are native, mobile-first, and using local brand imagery where available."],
  ["Pricing", "Pricing, deposit language, Zelle details, and payment timing are represented in the process flow."],
  ["FAQ", "FAQ content is organized into reusable accordion sections by buyer topic."],
  ["Available Puppies", "Available Puppies now shows only puppies that are truly available and a clear empty state when none are open."],
  ["Current Litters", "Current litter routes use the shared litter template and are ordered by go-home timing."],
  ["Upcoming Litters", "Planned pairings are represented with reusable litter cards and waitlist-focused CTAs."],
  ["Reviews", "Review pages and homepage testimonials use branded reusable review cards with Google review links."],
  ["Parents", "Mamas and studs use shared parent card/profile templates and structured parent data."],
  ["Coat Traits", "Coat trait guidance is migrated into a native reusable content page."],
  ["Forms", "Application, contact, stud, guardian, newsletter, and waitlist forms route through the shared lead handler."],
  ["Images", "Local image references validate in launch checks; remaining upgrades are ongoing media quality passes."]
];

export const updateChecklist = [
  "Add new puppy photos to public/images/puppies or replace seeded CDN URLs after Squarespace export.",
  "Update src/data/siteData.js for puppy and litter facts.",
  "Run npm run build before publishing.",
  "Deploy through Vercel after content review."
];
