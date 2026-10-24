// Initial community data for ReLoop resources
// Matches the Supabase schema for seamless database hydration and fallback

export const INITIAL_RESOURCES = [
  // --- ITEMS ---
  {
    id: 'item-1',
    resource_type: 'items',
    title: 'Solid Wood Study Table',
    description: 'Sturdy wooden study desk with 2 side drawers. In great condition, perfect for students or home office setup.',
    category: 'Furniture',
    condition: 'Gently Used',
    status: 'Free',
    price: 0,
    location: 'Perumbavoor',
    distance: '1.2 km away',
    image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    provider: {
      id: 'usr-1',
      full_name: 'Aiswarya S.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Active Giver'
    }
  },
  {
    id: 'item-2',
    resource_type: 'items',
    title: 'HP 15s Core i3 Laptop',
    description: 'Working HP laptop with charger. Battery backup is around 2 hours. Suitable for online classes, browsing, and light tasks.',
    category: 'Electronics',
    condition: 'Functional',
    status: 'For Sale',
    price: 4500,
    location: 'Aluva',
    distance: '4.5 km away',
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    provider: {
      id: 'usr-2',
      full_name: 'Rahul Mohan',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      badge: 'Verified Member'
    }
  },
  {
    id: 'item-3',
    resource_type: 'items',
    title: 'Computer Science & Engineering Books',
    description: 'Set of 6 B.Tech reference textbooks (Data Structures, Algorithms, OS, DBMS). Clean with no markings.',
    category: 'Books',
    condition: 'Like New',
    status: 'Free',
    price: 0,
    location: 'Kalamassery',
    distance: '3.0 km away',
    image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    provider: {
      id: 'usr-3',
      full_name: 'Fathima Noor',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      badge: 'Community Contributor'
    }
  },
  {
    id: 'item-4',
    resource_type: 'items',
    title: 'Ergonomic Mesh Office Chair',
    description: 'Comfortable mesh high-back chair with lumbar support and swivel base. Minor fabric wear on armrest.',
    category: 'Furniture',
    condition: 'Good',
    status: 'Exchange',
    price: 0,
    location: 'Perumbavoor',
    distance: '2.1 km away',
    image_url: 'https://images.unsplash.com/photo-1580481077195-c3a821a5060f?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    provider: {
      id: 'usr-4',
      full_name: 'Kiran Dev',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      badge: 'Neighbourhood Hero'
    }
  },
  {
    id: 'item-5',
    resource_type: 'items',
    title: 'Philips 750W 3-Jar Mixer Grinder',
    description: 'Fully working mixer grinder with stainless steel jars and pulse speed control. Upgraded to food processor.',
    category: 'Home & Kitchen',
    condition: 'Good',
    status: 'Free',
    price: 0,
    location: 'Angamaly',
    distance: '5.8 km away',
    image_url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    provider: {
      id: 'usr-5',
      full_name: 'Meera Thomas',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      badge: 'Active Giver'
    }
  },
  {
    id: 'item-6',
    resource_type: 'items',
    title: 'Skybags Waterproof School Backpack',
    description: 'Durable school backpack with rain cover and laptop compartment. Freshly washed and ready for a student.',
    category: 'School Supplies',
    condition: 'Gently Used',
    status: 'Free',
    price: 0,
    location: 'Perumbavoor',
    distance: '1.8 km away',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    provider: {
      id: 'usr-1',
      full_name: 'Aiswarya S.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Active Giver'
    }
  },
  {
    id: 'item-7',
    resource_type: 'items',
    title: 'Winter Fleece Jacket (Size M)',
    description: 'Warm navy blue fleece jacket, worn only during a one-week trip up north. Clean and soft.',
    category: 'Clothes',
    condition: 'Like New',
    status: 'Free',
    price: 0,
    location: 'Kochi',
    distance: '8.0 km away',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    provider: {
      id: 'usr-6',
      full_name: 'Nikhil Paul',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
      badge: 'Eco Member'
    }
  },
  {
    id: 'item-8',
    resource_type: 'items',
    title: 'Digital Alarm Clock with FM Radio',
    description: 'LED bedside clock with dual alarm settings and backup battery slot. Works flawlessly.',
    category: 'Electronics',
    condition: 'Gently Used',
    status: 'Free',
    price: 0,
    location: 'Perumbavoor',
    distance: '0.8 km away',
    image_url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 40).toISOString(),
    provider: {
      id: 'usr-3',
      full_name: 'Fathima Noor',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      badge: 'Community Contributor'
    }
  },

  // --- SERVICES ---
  {
    id: 'srv-1',
    resource_type: 'services',
    title: 'Laptop & PC Repair Service',
    description: 'Hardware diagnostics, OS installation, thermal paste repaste, SSD upgrades, and screen replacements.',
    category: 'Repair',
    condition: 'Professional',
    status: 'For Hire',
    price: 300,
    location: 'Perumbavoor',
    distance: '1.5 km away',
    image_url: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    provider: {
      id: 'usr-7',
      full_name: 'Anand Tech Lab',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      badge: 'Certified Tech'
    }
  },
  {
    id: 'srv-2',
    resource_type: 'services',
    title: 'Maths & Physics Tuition (Classes 8-12)',
    description: 'Personalized interactive tutoring sessions for CBSE/State syllabus. Weekend batches and doubt clearance.',
    category: 'Tutoring',
    condition: 'Educational',
    status: 'Free Service',
    price: 0,
    location: 'Perumbavoor',
    distance: '2.4 km away',
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
    provider: {
      id: 'usr-8',
      full_name: 'Prof. Mathew Joseph',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      badge: 'Volunteer Educator'
    }
  },
  {
    id: 'srv-3',
    resource_type: 'services',
    title: 'Eco-Friendly Home Cleaning Assistance',
    description: 'Deep cleaning with biodegradable cleansers. Kitchen, bathroom, and moving-in sanitization support.',
    category: 'Cleaning',
    condition: 'Reliable',
    status: 'For Hire',
    price: 500,
    location: 'Perumbavoor',
    distance: '3.1 km away',
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    provider: {
      id: 'usr-9',
      full_name: 'Lakshmi Cleaners',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      badge: 'Local Enterprise'
    }
  },
  {
    id: 'srv-4',
    resource_type: 'services',
    title: 'Bicycle Repair & Free Tune-Up Camp',
    description: 'Brake adjustments, chain lubrication, tube patching, and gear tuning to promote cycling in our town.',
    category: 'Repair',
    condition: 'Community',
    status: 'Free Service',
    price: 0,
    location: 'Aluva',
    distance: '5.2 km away',
    image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    provider: {
      id: 'usr-10',
      full_name: 'ReCycle Club',
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
      badge: 'Eco Group'
    }
  },
  {
    id: 'srv-5',
    resource_type: 'services',
    title: 'Local Pickup & Furniture Transport',
    description: 'Mini truck pickup support for moving large community items, recycled goods, and heavy appliances safely.',
    category: 'Transport',
    condition: 'Affordable',
    status: 'For Hire',
    price: 350,
    location: 'Perumbavoor',
    distance: '1.1 km away',
    image_url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 32).toISOString(),
    provider: {
      id: 'usr-11',
      full_name: 'Shaji Quick Haul',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      badge: 'Verified Driver'
    }
  },
  {
    id: 'srv-6',
    resource_type: 'services',
    title: 'Organic Garden Consultation & Setup',
    description: 'Free guidance on terrace gardening, pest control using neem oil, and composting kitchen scraps.',
    category: 'Gardening',
    condition: 'Volunteer',
    status: 'Free Service',
    price: 0,
    location: 'Kalady',
    distance: '6.4 km away',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 45).toISOString(),
    provider: {
      id: 'usr-12',
      full_name: 'Haritha Green Team',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      badge: 'Eco Mentor'
    }
  },

  // --- DISPOSAL & RECYCLING ---
  {
    id: 'disp-1',
    resource_type: 'disposal',
    title: 'Temple & Event Floral Waste Collection',
    description: 'We collect discarded flowers from functions and temples to convert them into natural incense sticks and organic compost.',
    category: 'Floral Waste',
    condition: 'Recycling Initiative',
    status: 'Free Drop-Off',
    price: 0,
    location: 'Perumbavoor Town Center',
    distance: '0.6 km away',
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    provider: {
      id: 'usr-13',
      full_name: 'Punarjani Bio Cycle',
      avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=150&q=80',
      badge: 'Certified NGO'
    }
  },
  {
    id: 'disp-2',
    resource_type: 'disposal',
    title: 'Community E-Waste Safe Recycling Drive',
    description: 'Authorised drop-off point for old circuit boards, broken chargers, lithium batteries, dead phones, and laptops.',
    category: 'E-Waste',
    condition: 'Authorized Hub',
    status: 'Free Drop-Off',
    price: 0,
    location: 'Angamaly South',
    distance: '4.2 km away',
    image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    provider: {
      id: 'usr-14',
      full_name: 'CleanTech Kerala',
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      badge: 'Pollution Control Partner'
    }
  },
  {
    id: 'disp-3',
    resource_type: 'disposal',
    title: 'Clean Plastic Bottles & Containers Recovery',
    description: 'Collection center for rinsed HDPE milk jugs, PET mineral bottles, and buckets. Processed for textile grade yarn.',
    category: 'Plastic',
    condition: 'Upcycling Center',
    status: 'Collection Unit',
    price: 0,
    location: 'Perumbavoor',
    distance: '2.0 km away',
    image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
    provider: {
      id: 'usr-15',
      full_name: 'GreenLoop Collective',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      badge: 'Verified Station'
    }
  },
  {
    id: 'disp-4',
    resource_type: 'disposal',
    title: 'Worn-Out Clothes & Fabric Scrap Drop Box',
    description: 'Unwearable torn cotton clothes, curtains, and tailoring fabric scraps sent for shredding into acoustic insulation & mattress stuffing.',
    category: 'Clothes',
    condition: 'Textile Upcycling',
    status: 'Drop Box',
    price: 0,
    location: 'Kalamassery',
    distance: '7.5 km away',
    image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 35).toISOString(),
    provider: {
      id: 'usr-16',
      full_name: 'FabReLoop Hub',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Zero Waste Warrior'
    }
  },
  {
    id: 'disp-5',
    resource_type: 'disposal',
    title: 'Paper, Cardboard & Old Newspaper Drive',
    description: 'Drop off surplus delivery shipping boxes, old magazines, and school notebooks for local paper mill re-pulping.',
    category: 'Paper',
    condition: 'Recycling Facility',
    status: 'Free Drop-Off',
    price: 0,
    location: 'Perumbavoor East',
    distance: '1.9 km away',
    image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 42).toISOString(),
    provider: {
      id: 'usr-17',
      full_name: 'PaperBale Recyclers',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      badge: 'Recycling Partner'
    }
  },

  // --- PLANTS ---
  {
    id: 'pln-1',
    resource_type: 'plants',
    title: 'Healthy Golden Pothos (Money Plant)',
    description: 'Lush rooted money plant vine in a recycled ceramic mug. Thrives in low indoor light, perfect for desks.',
    category: 'Indoor Plants',
    condition: 'Healthy & Rooted',
    status: 'Free',
    price: 0,
    location: 'Perumbavoor',
    distance: '1.0 km away',
    image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    provider: {
      id: 'usr-18',
      full_name: 'Pooja Varghese',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      badge: 'Plant Parent'
    }
  },
  {
    id: 'pln-2',
    resource_type: 'plants',
    title: 'Fresh Aloe Vera Cuttings (5 Pcs)',
    description: 'Thick organic aloe vera pups from my garden. Great for skin, hair, or planting in sunny balconies.',
    category: 'Plant Cuttings',
    condition: 'Freshly Harvested',
    status: 'Free',
    price: 0,
    location: 'Aluva',
    distance: '3.6 km away',
    image_url: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 9).toISOString(),
    provider: {
      id: 'usr-19',
      full_name: 'Dr. Suresh Kumar',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      badge: 'Nature Lover'
    }
  },
  {
    id: 'pln-3',
    resource_type: 'plants',
    title: 'Heirloom Bird\'s Eye Chilli (Kanthari) Seeds',
    description: 'Sun-dried traditional Kerala kanthari chilli seeds with 90%+ germination rate. Free packet to passionate gardeners.',
    category: 'Seeds',
    condition: 'Organic Dried',
    status: 'Free',
    price: 0,
    location: 'Kalady',
    distance: '5.1 km away',
    image_url: 'https://images.unsplash.com/photo-1588879462719-74d75f284b3e?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 19).toISOString(),
    provider: {
      id: 'usr-20',
      full_name: 'Gita Krishnan',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      badge: 'Master Gardener'
    }
  },
  {
    id: 'pln-4',
    resource_type: 'plants',
    title: 'Terracotta Plant Pots (Set of 4)',
    description: '8-inch breathable clay pots. Rinsed and cleaned with bottom drainage holes intact.',
    category: 'Plant Pots',
    condition: 'Good',
    status: 'Free',
    price: 0,
    location: 'Perumbavoor',
    distance: '1.4 km away',
    image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 25).toISOString(),
    provider: {
      id: 'usr-18',
      full_name: 'Pooja Varghese',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      badge: 'Plant Parent'
    }
  },

  // --- OTHERS ---
  {
    id: 'oth-1',
    resource_type: 'others',
    title: 'Clean Glass Mason & Jam Jars (12 Pack)',
    description: 'Assorted cleaned glass jars with tight lids. Ideal for homemade pickle storage, spices, or candle making.',
    category: 'Upcycling & Storage',
    condition: 'Sparkling Clean',
    status: 'Free',
    price: 0,
    location: 'Perumbavoor',
    distance: '0.9 km away',
    image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 11).toISOString(),
    provider: {
      id: 'usr-1',
      full_name: 'Aiswarya S.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Active Giver'
    }
  },
  {
    id: 'oth-2',
    resource_type: 'others',
    title: 'Cardboard Moving Cartons & Bubble Wrap',
    description: 'Around 10 sturdy 3-ply carton boxes plus 15 meters of bubble wrap from our recent apartment shifting.',
    category: 'Packing Supplies',
    condition: 'Reusable',
    status: 'Free',
    price: 0,
    location: 'Kalamassery',
    distance: '6.2 km away',
    image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 27).toISOString(),
    provider: {
      id: 'usr-6',
      full_name: 'Nikhil Paul',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
      badge: 'Eco Member'
    }
  },
  {
    id: 'oth-3',
    resource_type: 'others',
    title: 'Wooden Art Studio Easel & Palette',
    description: 'Foldable Beechwood tripod easel. Adjustable height for acrylic or oil painting on canvas.',
    category: 'Craft & Art',
    condition: 'Gently Used',
    status: 'For Sale',
    price: 650,
    location: 'Perumbavoor',
    distance: '2.5 km away',
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 38).toISOString(),
    provider: {
      id: 'usr-2',
      full_name: 'Rahul Mohan',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      badge: 'Verified Member'
    }
  },

  // --- COMMUNITY REQUESTS (Text-only, no images accepted) ---
  {
    id: 'req-1',
    resource_type: 'request',
    title: 'Looking for Class 10 NCERT Science & Maths Textbooks',
    description: 'Looking for Class 10 CBSE/NCERT Science and Mathematics textbooks for my younger sibling. Any recent edition is welcome. Happy to pick up anywhere in Perumbavoor.',
    category: 'Books',
    condition: 'Any readable condition',
    status: 'Seeking',
    is_free: true,
    price: 0,
    quantity: 2,
    location: 'Perumbavoor',
    distance: '1.5 km away',
    image_url: null,
    image_urls: [],
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    provider: {
      id: 'usr-3',
      full_name: 'Fathima Noor',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      badge: 'Student Member'
    }
  },
  {
    id: 'req-2',
    resource_type: 'request',
    title: 'Need Foldable Wheelchair for Elderly Neighbor',
    description: 'Urgent requirement for a standard adult folding wheelchair for temporary rehabilitation use over the next 2 months. We can arrange pickup immediately.',
    category: 'Health & Mobility',
    condition: 'Functional',
    status: 'Seeking',
    is_free: true,
    price: 0,
    quantity: 1,
    is_time_sensitive: true,
    location: 'Aluva',
    distance: '3.8 km away',
    image_url: null,
    image_urls: [],
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    provider: {
      id: 'usr-1',
      full_name: 'Aiswarya S.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      badge: 'Active Giver'
    }
  },
  {
    id: 'req-3',
    resource_type: 'request',
    title: 'Seeking Basic Study Desk / Small Table',
    description: 'Setting up a study space for an aspiring college student. Looking for a compact desk or study table with or without drawers. Can arrange self-transport.',
    category: 'Furniture',
    condition: 'Good',
    status: 'Seeking',
    is_free: true,
    price: 0,
    quantity: 1,
    location: 'Kalamassery',
    distance: '4.2 km away',
    image_url: null,
    image_urls: [],
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    provider: {
      id: 'usr-4',
      full_name: 'Deepak Varghese',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      badge: 'Community Contributor'
    }
  }
];

// Baseline Provider Rating & Trust Metrics
export const PROVIDER_RATINGS_MAP = {
  'usr-1': { avg_rating: 4.9, total_reviews: 14, is_verified: true, member_since: '2023' },
  'usr-2': { avg_rating: 4.8, total_reviews: 9, is_verified: true, member_since: '2023' },
  'usr-3': { avg_rating: 4.9, total_reviews: 12, is_verified: true, member_since: '2024' },
  'usr-4': { avg_rating: 4.7, total_reviews: 7, is_verified: true, member_since: '2023' },
  'usr-5': { avg_rating: 5.0, total_reviews: 6, is_verified: true, member_since: '2024' },
  'usr-6': { avg_rating: 4.6, total_reviews: 5, is_verified: true, member_since: '2023' },
  'usr-7': { avg_rating: 4.8, total_reviews: 11, is_verified: true, member_since: '2023' },
  'usr-8': { avg_rating: 4.7, total_reviews: 8, is_verified: true, member_since: '2024' },
  'usr-9': { avg_rating: 4.9, total_reviews: 15, is_verified: true, member_since: '2023' },
  'usr-10': { avg_rating: 4.8, total_reviews: 10, is_verified: true, member_since: '2024' },
  'usr-11': { avg_rating: 4.7, total_reviews: 6, is_verified: true, member_since: '2023' },
  'usr-12': { avg_rating: 4.9, total_reviews: 13, is_verified: true, member_since: '2023' },
};

// Seed Community Reviews for demonstration and initial presentation
export const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    provider_id: 'usr-1',
    reviewer_id: 'usr-2',
    resource_id: 'item-1',
    resource_title: 'Solid Wood Study Table',
    rating: 5,
    comment: 'Super polite and helpful! The study table was spotless and handover was quick at Perumbavoor. Highly recommend this provider.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    reviewer: {
      id: 'usr-2',
      full_name: 'Rahul Mohan',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    }
  },
  {
    id: 'rev-2',
    provider_id: 'usr-1',
    reviewer_id: 'usr-3',
    resource_id: 'item-6',
    resource_title: 'Skybags Waterproof School Backpack',
    rating: 5,
    comment: 'Aiswarya is a true community hero. The school bag was freshly washed and perfectly intact. Circular living in action!',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    reviewer: {
      id: 'usr-3',
      full_name: 'Fathima Noor',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    }
  },
  {
    id: 'rev-3',
    provider_id: 'usr-1',
    reviewer_id: 'usr-5',
    resource_id: 'plant-1',
    resource_title: 'Aloe Vera & Snake Plants',
    rating: 4,
    comment: 'Healthy saplings with potting soil included. Great tips on plant care as well.',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    reviewer: {
      id: 'usr-5',
      full_name: 'Meera Thomas',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    }
  },
  {
    id: 'rev-4',
    provider_id: 'usr-2',
    reviewer_id: 'usr-4',
    resource_id: 'item-2',
    resource_title: 'HP 15s Core i3 Laptop',
    rating: 5,
    comment: 'Laptop was clean with original adapter. Battery timing was exact as described. Great exchange!',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    reviewer: {
      id: 'usr-4',
      full_name: 'Kiran Dev',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    }
  },
  {
    id: 'rev-5',
    provider_id: 'usr-3',
    reviewer_id: 'usr-1',
    resource_id: 'item-3',
    resource_title: 'Computer Science & Engineering Books',
    rating: 5,
    comment: 'Books were like brand new. Wonderful contributor to student education!',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    reviewer: {
      id: 'usr-1',
      full_name: 'Aiswarya S.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    }
  },
  {
    id: 'rev-6',
    provider_id: 'usr-4',
    reviewer_id: 'usr-6',
    resource_id: 'item-4',
    resource_title: 'Ergonomic Mesh Office Chair',
    rating: 5,
    comment: 'Very comfortable chair, exactly what I needed for my study desk. Thanks Kiran!',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    reviewer: {
      id: 'usr-6',
      full_name: 'Nikhil Paul',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    }
  },
  {
    id: 'rev-7',
    provider_id: 'usr-5',
    reviewer_id: 'usr-2',
    resource_id: 'item-5',
    resource_title: 'Philips 750W Mixer Grinder',
    rating: 5,
    comment: 'Works smoothly! Very appreciative of Meera for sharing high quality appliances.',
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    reviewer: {
      id: 'usr-2',
      full_name: 'Rahul Mohan',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    }
  }
];

// Enrich INITIAL_RESOURCES with default provider stats if not already attached
INITIAL_RESOURCES.forEach(item => {
  if (item.provider) {
    const stats = PROVIDER_RATINGS_MAP[item.provider.id] || {
      avg_rating: 4.8,
      total_reviews: 8,
      is_verified: true,
      member_since: '2023'
    };
    item.provider.avg_rating = item.provider.avg_rating ?? stats.avg_rating;
    item.provider.total_reviews = item.provider.total_reviews ?? stats.total_reviews;
    item.provider.is_verified = item.provider.is_verified ?? stats.is_verified;
    item.provider.member_since = item.provider.member_since ?? stats.member_since;
  }
});

