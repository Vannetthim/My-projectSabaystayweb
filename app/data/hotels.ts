export type Hotel = {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  badge?: string;
  amenities: string[];
  description: string;
  heroImage: string;
  gallery: string[];
  address: string;
  tagline: string;
};

export const hotels: Hotel[] = [
  {
    id: "angkor-heritage-resort",
    name: "Angkor Heritage Resort",
    location: "Siem Reap, Cambodia",
    price: 185,
    rating: 4.9,
    badge: "Premium",
    amenities: ["Infinity Pool", "Temple View"],
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=85",
    description:
      "Experience unparalleled luxury at this heritage-rich resort, where traditional Khmer architecture meets modern comfort. Nestled near the iconic Angkor Wat temples, our sanctuary offers a seamless blend of cultural immersion and refined relaxation.",
    heroImage:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    ],
    address: "48 Terrace Road, Siem Reap, Cambodia",
    tagline: "Luxury Resort · Cambodia",
  },
  {
    id: "royal-mekong-hotel",
    name: "Royal Mekong Hotel",
    location: "Phnom Penh, Cambodia",
    price: 145,
    rating: 4.8,
    amenities: ["River View", "Rooftop Pool"],
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85",
    description:
      "Experience the grandeur of Cambodia's capital at this riverside sanctuary, where colonial elegance meets contemporary style. Our rooftop pool offers panoramic views of the Mekong River and the bustling city beyond.",
    heroImage:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    ],
    address: "123 Sisowath Quay, Phnom Penh, Cambodia",
    tagline: "Riverside Luxury · Cambodia",
  },
  {
    id: "kep-ocean-house",
    name: "Kep Ocean House",
    location: "Kep, Cambodia",
    price: 160,
    rating: 4.7,
    amenities: ["Private Beach", "Sea View"],
    image:
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1000&q=85",
    description:
      "Perched on the pristine southern coast, our ocean-facing houses offer unobstructed views of the Gulf of Thailand. Each accommodation is designed to harmonize with the natural coastal landscape, providing a tranquil escape by the sea.",
    heroImage:
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    ],
    address: "Kep Beach Road, Kep, Cambodia",
    tagline: "Coastal Escape · Cambodia",
  },
  {
    id: "kampot-river-retreat",
    name: "Kampot River Retreat",
    location: "Kampot, Cambodia",
    price: 120,
    rating: 4.8,
    amenities: ["River View", "Fine Dining"],
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=85",
    description:
      "Nestled along the scenic Kampot River, our boutique retreat blends rustic charm with luxurious comfort. Surrounded by lush tropical gardens and pepper plantations, it's the perfect haven for those seeking peace and authenticity in southern Cambodia.",
    heroImage:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    ],
    address: "River Road, Kampot, Cambodia",
    tagline: "Boutique Riverside · Cambodia",
  },
  {
    id: "koh-rong-island-resort",
    name: "Koh Rong Island Resort",
    location: "Koh Rong, Cambodia",
    price: 210,
    rating: 4.9,
    badge: "Premium",
    amenities: ["Private Beach", "Water Sports"],
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85",
    description:
      "On the emerald shores of Koh Rong, this resort is a tropical paradise where powdery white sands meet crystal-clear turquoise waters. Enjoy world-class diving, snorkeling, and sunset cruises in an idyllic island setting that feels like a private slice of heaven.",
    heroImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    ],
    address: "Beach Road, Koh Rong, Cambodia",
    tagline: "Island Paradise · Cambodia",
  },
  {
    id: "battambang-garden-hotel",
    name: "Battambang Garden Hotel",
    location: "Battambang, Cambodia",
    price: 95,
    rating: 4.6,
    amenities: ["Garden View", "Swimming Pool"],
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=85",
    description:
      "Escape to the historic town of Battambang, where our garden hotel offers a peaceful retreat amid lush tropical foliage. Our colonial-style boutique property blends seamlessly with the riverside landscape, perfect for unwinding after exploring the ancient streets.",
    heroImage:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    ],
    address: "Street 2, Battambang, Cambodia",
    tagline: "Garden Retreat · Cambodia",
  },
  {
    id: "bokor-mountain-lodge",
    name: "Bokor Mountain Lodge",
    location: "Bokor National Park, Cambodia",
    price: 175,
    rating: 4.7,
    amenities: ["Mountain View", "Spa & Wellness"],
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=85",
    description:
      "Perched high in the Bokor Mountains, our eco-lodge offers breathtaking views of the surrounding national park. Wake up to mist rolling over the hills and enjoy guided nature walks, birdwatching, and rejuvenating spa treatments in the cool mountain air.",
    heroImage:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    ],
    address: "Bokor Hill Station, Kampot Province, Cambodia",
    tagline: "Mountain Retreat · Cambodia",
  },
  {
    id: "mondulkiri-forest-sanctuary",
    name: "Mondulkiri Forest Sanctuary",
    location: "Sen Monorom, Mondulkiri, Cambodia",
    price: 140,
    rating: 4.8,
    amenities: ["Jungle View", "Eco Tours"],
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=85",
    description:
      "Immerse yourself in the heart of Cambodia's wilderness at this eco-conscious sanctuary. Our treehouse-style accommodations blend seamlessly into the jungle canopy, offering unparalleled wildlife encounters and authentic connections with nature in the remote northeast.",
    heroImage:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    ],
    address: "Sen Monorom, Mondulkiri, Cambodia",
    tagline: "Jungle Sanctuary · Cambodia",
  },
  {
    id: "sihanoukville-bay-resort",
    name: "Sihanoukville Bay Resort",
    location: "Sihanoukville, Cambodia",
    price: 130,
    rating: 4.6,
    amenities: ["Beach Access", "Infinity Pool"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85",
    description:
      "Located along Cambodia's most popular coastline, this bay-front resort offers pristine beaches and vibrant marine life right outside your doorstep. With multiple dining options, water sports, and a world-class spa, it's an ideal destination for couples and families alike.",
    heroImage:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    ],
    address: "Sokha Beach Road, Sihanoukville, Cambodia",
    tagline: "Bay Front Resort · Cambodia",
  },
  {
    id: "kampong-cham-riverside-villa",
    name: "Kampong Cham Riverside Villa",
    location: "Kampong Cham, Cambodia",
    price: 110,
    rating: 4.7,
    amenities: ["River View", "Private Balcony"],
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=85",
    description:
      "Our exclusive riverside villas offer private access to the Mekong River, featuring modern design, lush gardens, and serene views. Each villa is independently designed with floor-to-ceiling windows and private outdoor spaces for ultimate privacy and comfort.",
    heroImage:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
    ],
    address: "Riverside Road, Kampong Cham, Cambodia",
    tagline: "Riverside Luxury · Cambodia",
  },
];

export function getHotelById(id: string): Hotel | undefined {
  return hotels.find((hotel) => hotel.id === id);
}
