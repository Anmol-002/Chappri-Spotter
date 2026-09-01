// Static content for Chappri Spotter. Scores are satire; territories are real places.

export const STATS = ['chaos', 'aura', 'baddie', 'reels', 'fashion', 'gym', 'traffic', 'npc', 'makeout', 'hookup', 'thirst', 'tea', 'oyo'];

export const CHARACTERS = {
  chapri: { file: 'chars/chapri-goblin.png', name: 'CHAPRI UNIT', shout: 'OYE! ONE MORE ROUND!' },
  traffic: { file: 'chars/traffic-goblin.png', name: 'HORN SPECIALIST', shout: 'SIDE DE BHAI!' },
  reel: { file: 'chars/reel-goblin.png', name: 'REEL OPERATIVE', shout: 'BHAI EK BAAR AUR!' },
  baddie: { file: 'chars/baddie-goblin.png', name: 'DRIP ANALYST', shout: 'SERVED. NEXT.' },
  aura: { file: 'chars/aura-goblin.png', name: 'AURA CARRIER', shout: 'AURA OVERLOAD.' },
  gym: { file: 'chars/gym-goblin.png', name: 'PROTEIN OFFICER', shout: 'AAJ CHEST DAY HAI.' },
  npc: { file: 'chars/npc-goblin.png', name: 'NPC RESIDENT', shout: '...loading dialogue...' },
  uncle: { file: 'chars/uncle-goblin.png', name: 'SANSKAAR WARDEN', shout: 'PARENTS KO BATAUNGA.' },
};

// Mascot mapping per stat.
export const CHARACTER_FOR_STAT = {
  chaos: 'chapri',
  traffic: 'traffic',
  reels: 'reel',
  baddie: 'baddie',
  fashion: 'baddie',
  aura: 'aura',
  gym: 'gym',
  npc: 'npc',
  makeout: 'baddie',
  hookup: 'baddie',
  thirst: 'aura',
  tea: 'uncle',
  oyo: 'chapri',
};

export const SFW_LAYERS = [
  { key: 'chaos', label: 'GENERAL CHAOS', emoji: '🤡', unit: 'Chappri Index' },
  { key: 'aura', label: 'AURA', emoji: '🕶️', unit: 'Aura Density' },
  { key: 'baddie', label: 'BADDIE INDEX', emoji: '💅', unit: 'Baddie Density' },
  { key: 'reels', label: 'REELS', emoji: '🎥', unit: 'Reel Density' },
  { key: 'fashion', label: 'FASHION', emoji: '👗', unit: 'Drip Index' },
  { key: 'gym', label: 'GYM BROS', emoji: '💪', unit: 'Protein Activity' },
  { key: 'traffic', label: 'TRAFFIC CHAOS', emoji: '🚗', unit: 'Horn Frequency' },
  { key: 'npc', label: 'NPC DENSITY', emoji: '🧍', unit: 'NPC Saturation' },
];

export const NSFW_LAYERS = [
  { key: 'makeout', label: '💋 MAKEOUT SPOTS', emoji: '💋', unit: 'Fogged-Window Density' },
  { key: 'hookup', label: '🫦 LOOKING FOR CASUAL', emoji: '🫦', unit: 'People Looking Tonight' },
  { key: 'thirst', label: '🍑 THIRST TRAPS', emoji: '🍑', unit: 'Neck-Break Index' },
  { key: 'tea', label: '🚩 DIRTY TEA / RED FLAGS', emoji: '🚩', unit: 'Gossip Radiation' },
  { key: 'oyo', label: '🏩 2-HOUR SPECIALS', emoji: '🏩', unit: 'Express Stay Index' },
];

export const LAYERS = SFW_LAYERS;

export const BANDS = [
  { min: 0, label: 'PEACEFUL CIVILIZATION', icon: '🟢', color: '#7ef29d', note: 'Normal human activity detected. Suspicious.' },
  { min: 21, label: 'MILD ACTIVITY', icon: '🟡', color: '#d3ff36', note: 'Nothing concerning yet. Keep watching.' },
  { min: 41, label: 'SUSPICIOUS ZONE', icon: '🟠', color: '#ffbf3f', note: 'Something spicy is happening here.' },
  { min: 61, label: 'CHAOS ZONE', icon: '🔴', color: '#ff8a3d', note: 'Multiple scandalous incidents detected.' },
  { min: 81, label: 'CHAPPRI HOTSPOT', icon: '💀', color: '#ff4d40', note: 'Enter at your own risk. Rizz or ruin.' },
  { min: 96, label: 'FINAL BOSS TERRITORY', icon: '☢️', color: '#ff2fb0', note: 'Authorities notified. They also arrived to watch the drama.' },
];

/* ---------- SFW Incident Categories ---------- */
export const SFW_CATEGORIES = [
  { id: 'reel', group: 'CONTENT', label: 'Reel Shooting', emoji: '🎥', stat: 'reels', line: 'Take 41 in progress. Tripod blocking the footpath.' },
  { id: 'bhai-ek-baar-aur', group: 'CONTENT', label: 'Bhai Ek Baar Aur', emoji: '🔁', stat: 'reels', line: 'Same shot. Fourteenth attempt. Nobody is stopping him.' },
  { id: 'public-dance', group: 'CONTENT', label: 'Public Dance', emoji: '💃', stat: 'reels', line: 'Choreography deployed in a public walkway.' },
  { id: 'chapri', group: 'BEHAVIOUR', label: 'Chappri Activity', emoji: '💀', stat: 'chaos', line: 'Unnecessary confidence detected at industrial scale.' },
  { id: 'loud-music', group: 'BEHAVIOUR', label: 'Loud Music', emoji: '🔊', stat: 'chaos', line: 'Bluetooth speaker doing more work than the sound system it replaced.' },
  { id: 'npc', group: 'BEHAVIOUR', label: 'NPC Behaviour', emoji: '🧍', stat: 'npc', line: 'Subject standing still, awaiting dialogue prompt.' },
  { id: 'traffic', group: 'BEHAVIOUR', label: 'Traffic Menace', emoji: '🚗', stat: 'traffic', line: 'Horn used as a form of emotional expression.' },
  { id: 'wrong-side', group: 'BEHAVIOUR', label: 'Wrong-Side Driving', emoji: '↩️', stat: 'traffic', line: 'Direction of travel described as "a suggestion".' },
  { id: 'fashion', group: 'FASHION', label: 'High Fashion', emoji: '👗', stat: 'fashion', line: 'Outfit far too coordinated for this weather.' },
  { id: 'sneaker', group: 'FASHION', label: 'Sneaker Flex', emoji: '👟', stat: 'fashion', line: 'Footwear worth more than the vehicle it arrived in.' },
  { id: 'sunglasses', group: 'FASHION', label: 'Sunglasses After Sunset', emoji: '🕶️', stat: 'aura', line: 'Sun set two hours ago. Eyewear disagrees.' },
  { id: 'unbuttoning', group: 'FASHION', label: 'Maximum Unbuttoning', emoji: '🪭', stat: 'chaos', line: 'Shirt buttons operating at 20% capacity.' },
  { id: 'gym', group: 'FITNESS', label: 'Gym Bro', emoji: '💪', stat: 'gym', line: 'Lat spread deployed inside a grocery aisle.' },
  { id: 'protein', group: 'FITNESS', label: 'Protein Activity', emoji: '🥤', stat: 'gym', line: 'Shaker bottle audible from 40 metres.' },
  { id: 'mirror-selfie', group: 'FITNESS', label: 'Mirror Selfie', emoji: '🪞', stat: 'gym', line: 'Mirror occupied. Indefinitely.' },
  { id: 'baddie', group: 'VIBE', label: 'Baddie Sighting', emoji: '💅', stat: 'baddie', line: 'Entrance made. Room adjusted accordingly.' },
  { id: 'aura', group: 'VIBE', label: 'Aura Detected', emoji: '🔥', stat: 'aura', line: 'Walked in slow motion without any music playing.' },
  { id: 'main-character', group: 'VIBE', label: 'Main Character', emoji: '👑', stat: 'aura', line: 'Subject appears to believe a camera crew is present.' },
  { id: 'couple', group: 'VIBE', label: 'Couple Zone', emoji: '💞', stat: 'baddie', line: 'Public affection levels exceeding local uncle tolerance.' },
];

/* ---------- 18+ Naughty & Teasing NSFW Categories ---------- */
export const NSFW_CATEGORIES = [
  { id: 'makeout', group: '🔞 18+ MAKEOUT SPOTS', label: 'Steamy Makeout Spot', emoji: '💋', stat: 'makeout', nsfw: true, line: 'Fogged car windows and heavy breathing detected in the parking lot.' },
  { id: 'fogged-car', group: '🔞 18+ MAKEOUT SPOTS', label: 'Fogged Car + Hazards On', emoji: '🚗', stat: 'makeout', nsfw: true, line: 'Hazard lights blinking. Windows opaque. Suspension doing overtime.' },
  { id: 'terrace-hands', group: '🔞 18+ MAKEOUT SPOTS', label: 'Terrace Hands After 1AM', emoji: '🌃', stat: 'makeout', nsfw: true, line: 'Rooftop corner booked. Hands have left the group chat.' },
  { id: 'casual-hookup', group: '🔞 18+ LOOKING FOR CASUAL', label: 'Looking for Casual Makeout', emoji: '🫦', stat: 'hookup', nsfw: true, line: 'Eye contact held for 4.2 seconds. Moving straight to the valet queue.' },
  { id: 'looking-now', group: '🔞 18+ LOOKING FOR CASUAL', label: 'Down Bad Tonight', emoji: '👀', stat: 'hookup', nsfw: true, line: '“Not looking for anything serious” typed with both thumbs at 1:14 AM.' },
  { id: 'situationship', group: '🔞 18+ LOOKING FOR CASUAL', label: 'Situationship Dealer', emoji: '💔', stat: 'hookup', nsfw: true, line: 'Texts “where r u” after 11. Replies “busy” until Friday.' },
  { id: 'thirst-trap', group: '🔞 18+ THIRST TRAPS', label: 'Thirst Trap in the Wild', emoji: '🍑', stat: 'thirst', nsfw: true, line: 'Outfit is 5% cotton, 95% delusion. Eight necks rotated without consent.' },
  { id: 'spicy-siren', group: '🔞 18+ THIRST TRAPS', label: 'Toxic Baddie Tease', emoji: '🌶️', stat: 'thirst', nsfw: true, line: 'Backless dress ending three situationships and one group chat.' },
  { id: 'oyo-commando', group: '🔞 18+ 2-HOUR SPECIALS', label: 'OYO 2-Hour Special', emoji: '🏩', stat: 'oyo', nsfw: true, line: 'Hoodie, cap, sunglasses, 118 minutes. Checkout was emotional.' },
  { id: 'pool-party', group: '🔞 18+ 2-HOUR SPECIALS', label: 'Wild Terrace Afterparty', emoji: '👙', stat: 'oyo', nsfw: true, line: 'Strictly 18+. Swimwear testing the structural integrity of local morals.' },
  { id: 'uncle-spying', group: '🔞 18+ DIRTY TEA', label: 'Uncle 4K Spycam', emoji: '😏', stat: 'tea', nsfw: true, line: 'Balcony uncle on 100x zoom, reviewing everyone’s life choices.' },
  { id: 'thirst-comment', group: '🔞 18+ DIRTY TEA', label: 'Spoken Thirst DM', emoji: '🍆', stat: 'tea', nsfw: true, line: '“Hi dear send pic” energy being said out loud at the bar table.' },
  { id: 'midnight-confession', group: '🔞 18+ DIRTY TEA', label: 'Dirty Gossip / Red Flag', emoji: '🚩', stat: 'tea', nsfw: true, line: '“He said he was single. His lock screen is a roka photo.”' },
];

export const CATEGORIES = [...SFW_CATEGORIES, ...NSFW_CATEGORIES];

export const INTENSITY = [
  { level: 1, label: 'MILD', note: 'Could happen anywhere.' },
  { level: 2, label: 'NOTICEABLE', note: 'Hmm. Interesting.' },
  { level: 3, label: 'SIGNIFICANT', note: 'We should investigate.' },
  { level: 4, label: 'SEVERE', note: 'This is getting serious.' },
  { level: 5, label: 'LEGENDARY', note: 'Future generations will talk about this.' },
];

export const LEVELS = [
  { min: 0, name: 'CIVILIAN', note: 'You have seen nothing yet.' },
  { min: 60, name: 'AMATEUR SPOTTER', note: 'Your eyes are opening.' },
  { min: 180, name: 'FIELD AGENT', note: 'Cleared for footpath surveillance.' },
  { min: 380, name: 'SENIOR ANALYST', note: 'You now speak in indices.' },
  { min: 650, name: 'INTELLIGENCE DIRECTOR', note: 'Aunties report to you.' },
  { min: 1000, name: 'DELHI UNCLE', note: 'Balcony access granted. Permanently.' },
  { min: 1500, name: '🚨 CLASSIFIED', note: 'This level does not officially exist.' },
];

export const ACHIEVEMENTS = [
  { id: 'first-blood', icon: '🏅', name: 'FIRST BLOOD', note: 'Submit your first sighting.' },
  { id: 'reel-hunter', icon: '🎥', name: 'REEL HUNTER', note: 'Report 5 reel incidents.' },
  { id: 'protein-analyst', icon: '💪', name: 'PROTEIN ANALYST', note: 'Report 5 gym sightings.' },
  { id: 'aura-detector', icon: '🕶️', name: 'AURA DETECTOR', note: 'Report 5 aura sightings.' },
  { id: 'territory-scout', icon: '🗺️', name: 'TERRITORY SCOUT', note: 'Discover an uncharted sector.' },
  { id: 'final-boss', icon: '💀', name: 'FINAL BOSS HUNTER', note: 'Report inside a 90+ territory.' },
  { id: 'fight-promoter', icon: '🥊', name: 'FIGHT PROMOTER', note: 'Start 3 sector battles.' },
  { id: 'combo-king', icon: '🔥', name: 'COMBO MERCHANT', note: 'Reach a x4 report combo.' },
  { id: 'peer-review', icon: '🤝', name: 'PEER REVIEW', note: 'Confirm 5 other agents\' sightings.' },
  { id: 'vision', icon: '🧠', name: 'CHAPPRIVISION USER', note: 'Run one photo through the fake AI.' },
  { id: 'nsfw-explorer', icon: '🔞', name: 'AFTER DARK OPERATIVE', note: 'Unlocked 18+ NSFW surveillance mode.' },
  { id: 'rizz-master', icon: '🫦', name: 'UNREAL RIZZLER', note: 'Spun the Makeout Roulette in 3 sectors.' },
];

export const SCAN_LINES = [
  'Detecting vibes...',
  'Measuring aura...',
  'Cross-referencing local aunties...',
  'Consulting 14 unemployed engineers...',
  'Running advanced chappri algorithms...',
  'Calculating unnecessary confidence...',
  'Asking the uncle on the balcony...',
  'Comparing against Sector 29 baseline...',
];

export const VERDICTS = [
  'Bhai ye toh content hai.',
  'Certified chappri behaviour. Framed and archived.',
  'The aura is real. The plan is not.',
  'This location has questionable vibes.',
  'Authorities notified. They asked for the location.',
  'Statistically, someone is filming this right now.',
];

export const TAUNTS = [
  'Better luck next weekend.',
  'Skill issue, geographically speaking.',
  'Your uncles will hear about this.',
  'Filed under: mid.',
  'The aura was borrowed, not owned.',
  'Try again after the metro extension.',
];

// Real-ish NCR coordinates. Stats are opening positions; user reports move them.
const NCR_TERRITORY_ROWS = [
  ['sector29', 'Sector 29', 'GURGAON', 28.4682, 77.0693, { chaos: 92, aura: 78, baddie: 71, reels: 88, fashion: 66, gym: 61, traffic: 84, npc: 22 }],
  ['cyberhub', 'Cyber Hub', 'GURGAON', 28.4951, 77.089, { chaos: 64, aura: 93, baddie: 90, reels: 81, fashion: 92, gym: 74, traffic: 70, npc: 34 }],
  ['mgroad', 'MG Road', 'GURGAON', 28.4796, 77.0812, { chaos: 78, aura: 62, baddie: 58, reels: 66, fashion: 54, gym: 66, traffic: 91, npc: 48 }],
  ['golfcourse', 'Golf Course Road', 'GURGAON', 28.4432, 77.1005, { chaos: 38, aura: 71, baddie: 64, reels: 49, fashion: 79, gym: 88, traffic: 57, npc: 41 }],
  ['hudacity', 'Huda City Centre', 'GURGAON', 28.4593, 77.0724, { chaos: 71, aura: 47, baddie: 42, reels: 58, fashion: 40, gym: 52, traffic: 86, npc: 74 }],
  ['sohna', 'Sohna Road', 'GURGAON', 28.4082, 77.0402, { chaos: 55, aura: 44, baddie: 38, reels: 41, fashion: 36, gym: 69, traffic: 78, npc: 66 }],
  ['dwarka', 'Dwarka Sec 12', 'DELHI', 28.5921, 77.04, { chaos: 49, aura: 52, baddie: 46, reels: 61, fashion: 44, gym: 72, traffic: 58, npc: 63 }],
  ['rajouri', 'Rajouri Garden', 'DELHI', 28.6492, 77.1207, { chaos: 88, aura: 74, baddie: 69, reels: 84, fashion: 71, gym: 79, traffic: 82, npc: 30 }],
  ['karolbagh', 'Karol Bagh', 'DELHI', 28.6519, 77.1909, { chaos: 90, aura: 55, baddie: 44, reels: 62, fashion: 58, gym: 47, traffic: 95, npc: 44 }],
  ['cp', 'Connaught Place', 'DELHI', 28.6315, 77.2167, { chaos: 84, aura: 76, baddie: 63, reels: 79, fashion: 74, gym: 43, traffic: 93, npc: 39 }],
  ['khanmarket', 'Khan Market', 'DELHI', 28.5989, 77.227, { chaos: 31, aura: 82, baddie: 74, reels: 57, fashion: 94, gym: 51, traffic: 62, npc: 46 }],
  ['hauzkhas', 'Hauz Khas Village', 'DELHI', 28.5535, 77.1943, { chaos: 66, aura: 89, baddie: 91, reels: 83, fashion: 96, gym: 45, traffic: 59, npc: 24 }],
  ['saket', 'Saket', 'DELHI', 28.5285, 77.2195, { chaos: 52, aura: 68, baddie: 72, reels: 64, fashion: 77, gym: 63, traffic: 66, npc: 51 }],
  ['gk2', 'GK-II M Block', 'DELHI', 28.5348, 77.2405, { chaos: 44, aura: 85, baddie: 88, reels: 71, fashion: 89, gym: 58, traffic: 54, npc: 37 }],
  ['lajpat', 'Lajpat Nagar', 'DELHI', 28.5677, 77.2433, { chaos: 82, aura: 51, baddie: 55, reels: 59, fashion: 67, gym: 41, traffic: 89, npc: 57 }],
  ['northcampus', 'North Campus', 'DELHI', 28.6957, 77.2064, { chaos: 76, aura: 87, baddie: 79, reels: 91, fashion: 62, gym: 55, traffic: 68, npc: 26 }],
  ['laxminagar', 'Laxmi Nagar', 'DELHI', 28.6304, 77.2769, { chaos: 87, aura: 46, baddie: 41, reels: 74, fashion: 39, gym: 84, traffic: 92, npc: 52 }],
  ['noida18', 'Noida Sector 18', 'NOIDA', 28.5708, 77.326, { chaos: 69, aura: 79, baddie: 83, reels: 86, fashion: 81, gym: 71, traffic: 74, npc: 33 }],
  ['noida62', 'Noida Sector 62', 'NOIDA', 28.627, 77.365, { chaos: 42, aura: 38, baddie: 34, reels: 47, fashion: 32, gym: 61, traffic: 63, npc: 94 }],
  ['indirapuram', 'Indirapuram', 'GHAZIABAD', 28.6435, 77.3705, { chaos: 73, aura: 44, baddie: 39, reels: 56, fashion: 37, gym: 77, traffic: 81, npc: 68 }],
  ['parichowk', 'Pari Chowk', 'GR. NOIDA', 28.4595, 77.503, { chaos: 61, aura: 57, baddie: 48, reels: 68, fashion: 43, gym: 66, traffic: 47, npc: 71 }],
  ['faridabad', 'Faridabad Sec 15', 'FARIDABAD', 28.39, 77.31, { chaos: 79, aura: 49, baddie: 42, reels: 63, fashion: 41, gym: 81, traffic: 76, npc: 58 }],
];

// Dense starter maps for the three cities most people will actually open the app in.
const METRO_TERRITORY_ROWS = [
  ['blr-indiranagar', 'Indiranagar 100ft', 'BENGALURU', 12.9784, 77.6408, { chaos: 86, aura: 88, baddie: 84, reels: 91, fashion: 82, gym: 64, traffic: 79, npc: 28 }],
  ['blr-koramangala', 'Koramangala 80ft', 'BENGALURU', 12.9352, 77.6245, { chaos: 81, aura: 79, baddie: 77, reels: 88, fashion: 74, gym: 61, traffic: 83, npc: 33 }],
  ['blr-whitefield', 'Whitefield ITPL', 'BENGALURU', 12.9698, 77.7499, { chaos: 54, aura: 41, baddie: 39, reels: 58, fashion: 36, gym: 72, traffic: 94, npc: 88 }],
  ['blr-mgroad', 'Bengaluru MG Road', 'BENGALURU', 12.9758, 77.6096, { chaos: 74, aura: 71, baddie: 68, reels: 76, fashion: 73, gym: 48, traffic: 88, npc: 46 }],
  ['blr-hsr', 'HSR Layout', 'BENGALURU', 12.9121, 77.6446, { chaos: 63, aura: 72, baddie: 70, reels: 69, fashion: 71, gym: 78, traffic: 71, npc: 41 }],
  ['blr-church', 'Church Street', 'BENGALURU', 12.9756, 77.605, { chaos: 78, aura: 83, baddie: 80, reels: 85, fashion: 79, gym: 44, traffic: 62, npc: 29 }],
  ['blr-ecity', 'Electronic City', 'BENGALURU', 12.8399, 77.677, { chaos: 48, aura: 34, baddie: 31, reels: 44, fashion: 29, gym: 67, traffic: 91, npc: 93 }],
  ['blr-marathahalli', 'Marathahalli', 'BENGALURU', 12.9592, 77.6974, { chaos: 72, aura: 46, baddie: 43, reels: 61, fashion: 40, gym: 69, traffic: 96, npc: 64 }],
  ['blr-jayanagar', 'Jayanagar 4th Block', 'BENGALURU', 12.925, 77.5937, { chaos: 51, aura: 58, baddie: 54, reels: 57, fashion: 61, gym: 56, traffic: 68, npc: 52 }],
  ['hyd-jubilee', 'Jubilee Hills Rd 36', 'HYDERABAD', 17.4319, 78.4071, { chaos: 71, aura: 92, baddie: 88, reels: 84, fashion: 91, gym: 63, traffic: 74, npc: 27 }],
  ['hyd-banjara', 'Banjara Hills', 'HYDERABAD', 17.4148, 78.4398, { chaos: 64, aura: 87, baddie: 86, reels: 79, fashion: 90, gym: 58, traffic: 69, npc: 31 }],
  ['hyd-hitec', 'HITEC City', 'HYDERABAD', 17.4474, 78.3762, { chaos: 58, aura: 62, baddie: 57, reels: 71, fashion: 54, gym: 76, traffic: 86, npc: 71 }],
  ['hyd-gachibowli', 'Gachibowli', 'HYDERABAD', 17.4401, 78.3489, { chaos: 52, aura: 55, baddie: 51, reels: 63, fashion: 49, gym: 81, traffic: 82, npc: 77 }],
  ['hyd-madhapur', 'Madhapur', 'HYDERABAD', 17.4483, 78.3915, { chaos: 67, aura: 73, baddie: 69, reels: 80, fashion: 66, gym: 70, traffic: 84, npc: 48 }],
  ['hyd-charminar', 'Charminar', 'HYDERABAD', 17.3616, 78.4747, { chaos: 89, aura: 61, baddie: 48, reels: 72, fashion: 58, gym: 36, traffic: 93, npc: 59 }],
  ['hyd-kondapur', 'Kondapur', 'HYDERABAD', 17.4943, 78.3996, { chaos: 61, aura: 58, baddie: 56, reels: 64, fashion: 53, gym: 74, traffic: 80, npc: 62 }],
  ['hyd-secunderabad', 'Secunderabad', 'HYDERABAD', 17.4399, 78.4983, { chaos: 76, aura: 49, baddie: 44, reels: 58, fashion: 47, gym: 52, traffic: 88, npc: 66 }],
  ['pune-kp', 'Koregaon Park', 'PUNE', 18.5362, 73.8939, { chaos: 74, aura: 86, baddie: 83, reels: 81, fashion: 84, gym: 67, traffic: 71, npc: 30 }],
  ['pune-fc', 'FC Road', 'PUNE', 18.5284, 73.8417, { chaos: 83, aura: 72, baddie: 75, reels: 86, fashion: 69, gym: 54, traffic: 78, npc: 34 }],
  ['pune-baner', 'Baner', 'PUNE', 18.559, 73.7868, { chaos: 62, aura: 68, baddie: 66, reels: 70, fashion: 64, gym: 79, traffic: 76, npc: 45 }],
  ['pune-hinjewadi', 'Hinjewadi Phase 1', 'PUNE', 18.5913, 73.738, { chaos: 49, aura: 37, baddie: 34, reels: 51, fashion: 32, gym: 73, traffic: 95, npc: 91 }],
  ['pune-viman', 'Viman Nagar', 'PUNE', 18.5679, 73.9143, { chaos: 68, aura: 64, baddie: 61, reels: 73, fashion: 59, gym: 62, traffic: 81, npc: 47 }],
  ['pune-kothrud', 'Kothrud', 'PUNE', 18.5074, 73.8077, { chaos: 57, aura: 53, baddie: 49, reels: 55, fashion: 51, gym: 66, traffic: 73, npc: 58 }],
  ['pune-camp', 'Pune Camp', 'PUNE', 18.5126, 73.8782, { chaos: 79, aura: 58, baddie: 54, reels: 66, fashion: 57, gym: 47, traffic: 85, npc: 51 }],
  ['pune-kalyani', 'Kalyani Nagar', 'PUNE', 18.5463, 73.9018, { chaos: 66, aura: 77, baddie: 74, reels: 72, fashion: 76, gym: 63, traffic: 69, npc: 38 }],
];

// One starter pin in every state: enough to make a first visit useful, not enough to
// pretend we have an auntie stationed on every street corner.
export const NATIONAL_STARTER_ROWS = [
  ['andhra-pradesh', 'Vijayawada Centre', 'ANDHRA PRADESH', 16.5062, 80.648, 'Tea stall debate reached IPL-commentary volume.'],
  ['arunachal-pradesh', 'Itanagar Market', 'ARUNACHAL PRADESH', 27.0844, 93.6053, 'The mountain view had aura. The parking had other plans.'],
  ['assam', 'Guwahati Riverfront', 'ASSAM', 26.1445, 91.7362, 'Scooter soundtrack arrived before the scooter.'],
  ['bihar', 'Patna Boring Road', 'BIHAR', 25.6093, 85.1376, 'One chai, four opinions and a traffic solo.'],
  ['chhattisgarh', 'Raipur Marine Drive', 'CHHATTISGARH', 21.2514, 81.6296, 'Evening stroll converted into a low-budget music video.'],
  ['goa', 'Panjim Waterfront', 'GOA', 15.4909, 73.8278, 'Sunglasses were working overtime after sunset.'],
  ['gujarat', 'Ahmedabad Riverfront', 'GUJARAT', 23.0225, 72.5714, 'The fit check had a louder entrance than the auto.'],
  ['haryana', 'Chandigarh Sector 17', 'HARYANA', 30.7415, 76.7821, 'Perfectly planned city. Completely unplanned parking.'],
  ['himachal-pradesh', 'Shimla Mall Road', 'HIMACHAL PRADESH', 31.1048, 77.1734, 'A reel shoot tried to outdo the actual hills.'],
  ['jharkhand', 'Ranchi Main Road', 'JHARKHAND', 23.3441, 85.3096, 'Horn diplomacy is thriving.'],
  ['karnataka', 'Bengaluru Indiranagar', 'KARNATAKA', 12.9784, 77.6408, 'Brunch queue formed a startup, raised funding, pivoted.'],
  ['kerala', 'Kochi Fort Area', 'KERALA', 9.9312, 76.2673, 'Waterfront walk, impeccable fits, suspiciously cinematic lighting.'],
  ['madhya-pradesh', 'Bhopal New Market', 'MADHYA PRADESH', 23.2599, 77.4126, 'Two-wheeler choreography needs its own national award.'],
  ['maharashtra', 'Mumbai Bandra', 'MAHARASHTRA', 19.0596, 72.8295, 'A café queue is auditioning for a fashion week.'],
  ['manipur', 'Imphal City Centre', 'MANIPUR', 24.817, 93.9368, 'Main-character energy detected near the evening crowd.'],
  ['meghalaya', 'Shillong Police Bazar', 'MEGHALAYA', 25.5788, 91.8933, 'Rain, jackets and enough aura to power a district.'],
  ['mizoram', 'Aizawl Centre', 'MIZORAM', 23.7271, 92.7176, 'The hill traffic is calm. The playlist is not.'],
  ['nagaland', 'Kohima Town', 'NAGALAND', 25.6751, 94.1086, 'Street style levels require a calibration update.'],
  ['odisha', 'Bhubaneswar Master Canteen', 'ODISHA', 20.2961, 85.8245, 'One friend said “quick stop.” Everyone knew better.'],
  ['punjab', 'Ludhiana Clock Tower', 'PUNJAB', 30.901, 75.8573, 'Bass setting: civic emergency.'],
  ['rajasthan', 'Jaipur MI Road', 'RAJASTHAN', 26.9124, 75.7873, 'Pink city, loud fits, absolutely zero indoor voices.'],
  ['sikkim', 'Gangtok MG Marg', 'SIKKIM', 27.3389, 88.6065, 'The promenade is peaceful. The poses are not.'],
  ['tamil-nadu', 'Chennai T Nagar', 'TAMIL NADU', 13.0827, 80.2707, 'Shopping bags gained sentience and took over the footpath.'],
  ['telangana', 'Hyderabad Jubilee Hills', 'TELANGANA', 17.4319, 78.4071, 'Valet queue developing its own cinematic universe.'],
  ['tripura', 'Agartala Ujjayanta', 'TRIPURA', 23.8315, 91.2868, 'Soft launch of a group hang became a full production.'],
  ['uttar-pradesh', 'Lucknow Hazratganj', 'UTTAR PRADESH', 26.8467, 80.9462, 'The stroll is polite. The scooter exhaust is not.'],
  ['uttarakhand', 'Dehradun Rajpur Road', 'UTTARAKHAND', 30.3256, 78.0437, 'Café hopping has exceeded the recommended dosage.'],
  ['west-bengal', 'Kolkata Park Street', 'WEST BENGAL', 22.5535, 88.352, 'The fit is serving. The taxi horn is reviewing it.'],
  ['andaman-nicobar', 'Port Blair Aberdeen Bazaar', 'ANDAMAN & NICOBAR ISLANDS', 11.6234, 92.7265, 'Island time is relaxed. The mirror checks are punctual.'],
  ['chandigarh-ut', 'Chandigarh Sector 17', 'CHANDIGARH', 30.7415, 76.7821, 'The promenade is polished. The parking logic remains fictional.'],
  ['dadra-nagar-haveli', 'Silvassa Town Square', 'DADRA & NAGAR HAVELI AND DAMAN & DIU', 20.273, 73.0083, 'A casual evening became a full outfit inspection.'],
  ['delhi-ut', 'Delhi India Gate', 'NCT OF DELHI', 28.6129, 77.2295, 'A photoshoot formed before the snacks arrived.'],
  ['jammu-kashmir', 'Srinagar Lal Chowk', 'JAMMU & KASHMIR', 34.0837, 74.7973, 'Winter jackets, excellent tea, maximum main-character energy.'],
  ['ladakh', 'Leh Main Bazaar', 'LADAKH', 34.1526, 77.5771, 'The altitude is high. So is the confidence.'],
  ['lakshadweep', 'Kavaratti Jetty', 'LAKSHADWEEP', 10.5669, 72.642, 'Sea breeze, immaculate fits, zero need for a ring light.'],
  ['puducherry', 'Puducherry Promenade', 'PUDUCHERRY', 11.9416, 79.8083, 'The French quarter is serene. The scooter soundtrack says otherwise.'],
];

const starterStats = (index) => ({
  chaos: 46 + (index * 7) % 42,
  aura: 48 + (index * 11) % 43,
  baddie: 38 + (index * 13) % 50,
  reels: 42 + (index * 9) % 48,
  fashion: 40 + (index * 5) % 51,
  gym: 35 + (index * 8) % 48,
  traffic: 44 + (index * 12) % 47,
  npc: 28 + (index * 6) % 49,
});

export const TERRITORIES = [...NCR_TERRITORY_ROWS, ...METRO_TERRITORY_ROWS, ...NATIONAL_STARTER_ROWS.map(([id, name, zone, lat, lng], index) => [id, name, zone, lat, lng, starterStats(index)])].map(([id, name, zone, lat, lng, stats]) => ({
  id,
  name,
  zone,
  coords: [lat, lng],
  stats: {
    ...stats,
    makeout: Math.round((stats.baddie + stats.aura) / 2),
    hookup: Math.round(stats.baddie * 0.88),
    thirst: Math.round((stats.reels + stats.fashion) / 2),
    tea: Math.round((stats.chaos + stats.fashion) / 2),
    oyo: Math.round(stats.chaos * 0.72),
  },
  seeded: true,
}));

// Extra logical links
export const EXTRA_LINKS = [
  ['dwarka', 'rajouri'],
  ['dwarka', 'cyberhub'],
  ['parichowk', 'noida18'],
  ['parichowk', 'faridabad'],
  ['faridabad', 'saket'],
  ['faridabad', 'sohna'],
  ['sohna', 'golfcourse'],
  ['indirapuram', 'laxminagar'],
  ['blr-indiranagar', 'blr-koramangala'],
  ['blr-koramangala', 'blr-hsr'],
  ['blr-mgroad', 'blr-church'],
  ['blr-whitefield', 'blr-marathahalli'],
  ['hyd-jubilee', 'hyd-banjara'],
  ['hyd-hitec', 'hyd-madhapur'],
  ['hyd-gachibowli', 'hyd-kondapur'],
  ['pune-kp', 'pune-kalyani'],
  ['pune-fc', 'pune-camp'],
  ['pune-baner', 'pune-hinjewadi'],
];

/* ---------- Rich NCR Landmarks Database for Instant Search ---------- */
export const LANDMARKS = [
  { name: 'Cyber Hub', territoryId: 'cyberhub', zone: 'Gurgaon', query: 'cyber hub cyberhub dlf phase 2 phase 3 rapid metro' },
  { name: 'Sector 29 Market', territoryId: 'sector29', zone: 'Gurgaon', query: 'sector 29 sec 29 microbreweries huda' },
  { name: 'Golf Course Road', territoryId: 'golfcourse', zone: 'Gurgaon', query: 'golf course road one horizon magnolias aralias' },
  { name: 'MG Road Malls', territoryId: 'mgroad', zone: 'Gurgaon', query: 'mg road mall mile sahara city centre' },
  { name: 'Huda City Centre', territoryId: 'hudacity', zone: 'Gurgaon', query: 'huda city centre millennium city metro' },
  { name: 'Sohna Road', territoryId: 'sohna', zone: 'Gurgaon', query: 'sohna road vatika badshahpur subhash chowk' },
  { name: 'Connaught Place (CP)', territoryId: 'cp', zone: 'Delhi', query: 'connaught place cp inner circle outer circle rajiv chowk janpath' },
  { name: 'Hauz Khas Village (HKV)', territoryId: 'hauzkhas', zone: 'Delhi', query: 'hauz khas village hkv lake deer park social' },
  { name: 'Khan Market', territoryId: 'khanmarket', zone: 'Delhi', query: 'khan market prithviraj road posh south delhi lutyens' },
  { name: 'GK-II M Block', territoryId: 'gk2', zone: 'Delhi', query: 'gk 2 greater kailash m block market savitri' },
  { name: 'Select Citywalk / Saket', territoryId: 'saket', zone: 'Delhi', query: 'saket select citywalk dlf avenue pvr anupam' },
  { name: 'Rajouri Garden', territoryId: 'rajouri', zone: 'Delhi', query: 'rajouri garden west delhi main market bk dutt gate' },
  { name: 'Karol Bagh & Gaffar', territoryId: 'karolbagh', zone: 'Delhi', query: 'karol bagh gaffar market ajmal khan road tank road' },
  { name: 'Lajpat Nagar Central Market', territoryId: 'lajpat', zone: 'Delhi', query: 'lajpat nagar central market 3c amar colony' },
  { name: 'North Campus (DU)', territoryId: 'northcampus', zone: 'Delhi', query: 'north campus delhi university du vishwavidyalaya hudson lane kamla nagar' },
  { name: 'Dwarka Sector 12', territoryId: 'dwarka', zone: 'Delhi', query: 'dwarka sec 12 sec 10 vegas mall sector 21' },
  { name: 'Laxmi Nagar & Shakarpur', territoryId: 'laxminagar', zone: 'Delhi', query: 'laxmi nagar v3s ca coaching shakarpur nirman vihar' },
  { name: 'Noida Sector 18 & Mall of India', territoryId: 'noida18', zone: 'Noida', query: 'noida sector 18 sec 18 dlf mall of india gip atta market wave' },
  { name: 'Noida Sector 62 IT Hub', territoryId: 'noida62', zone: 'Noida', query: 'noida sector 62 sec 62 electronic city fortis' },
  { name: 'Indirapuram & Shipra', territoryId: 'indirapuram', zone: 'Ghaziabad', query: 'indirapuram shipra mall habitat centre vaishali kaushambi' },
  { name: 'Pari Chowk & Expo Mart', territoryId: 'parichowk', zone: 'Greater Noida', query: 'pari chowk expo mart greater noida expressway alpha 1' },
  { name: 'Faridabad Sector 15', territoryId: 'faridabad', zone: 'Faridabad', query: 'faridabad sec 15 sector 16 crown interiorz bata chowk' },
  { name: 'Majnu Ka Tilla (MKT)', territoryId: 'northcampus', zone: 'Delhi', query: 'majnu ka tilla mkt tibetan market laphing' },
  { name: 'Netaji Subhash Place (NSP)', territoryId: 'rajouri', zone: 'Delhi', query: 'nsp netaji subhash place pitampura max hospital' },
  { name: 'Pacific Mall Subhash Nagar', territoryId: 'rajouri', zone: 'Delhi', query: 'pacific mall subhash nagar tagore garden west delhi' },
  { name: 'Ambience Mall Gurgaon', territoryId: 'cyberhub', zone: 'Gurgaon', query: 'ambience mall gurgaon leela toll gate' },
  { name: 'Rohini Sector 7/8', territoryId: 'dwarka', zone: 'Delhi', query: 'rohini sec 7 sec 8 unity one rithala' },
  { name: 'Indiranagar 100ft', territoryId: 'blr-indiranagar', zone: 'Bengaluru', query: 'indiranagar 100 feet 12th main blr bengaluru bangalore' },
  { name: 'Koramangala 80ft', territoryId: 'blr-koramangala', zone: 'Bengaluru', query: 'koramangala 80 feet 5th block 6th block forum' },
  { name: 'Whitefield / ITPL', territoryId: 'blr-whitefield', zone: 'Bengaluru', query: 'whitefield itpl phoenix marketcity hope farm' },
  { name: 'MG Road Bengaluru', territoryId: 'blr-mgroad', zone: 'Bengaluru', query: 'mg road brigade road trinity metro cubbon' },
  { name: 'HSR Layout', territoryId: 'blr-hsr', zone: 'Bengaluru', query: 'hsr layout sector 1 2 27th main agara' },
  { name: 'Church Street', territoryId: 'blr-church', zone: 'Bengaluru', query: 'church street brigade plaza st marks' },
  { name: 'Electronic City', territoryId: 'blr-ecity', zone: 'Bengaluru', query: 'electronic city e-city phase 1 silk board' },
  { name: 'Marathahalli', territoryId: 'blr-marathahalli', zone: 'Bengaluru', query: 'marathahalli bridge outer ring road kalamandir' },
  { name: 'Jayanagar 4th Block', territoryId: 'blr-jayanagar', zone: 'Bengaluru', query: 'jayanagar 4th block south end circle' },
  { name: 'Jubilee Hills Road 36', territoryId: 'hyd-jubilee', zone: 'Hyderabad', query: 'jubilee hills road 36 film nagar peddamma' },
  { name: 'Banjara Hills', territoryId: 'hyd-banjara', zone: 'Hyderabad', query: 'banjara hills road 1 12 gvk one' },
  { name: 'HITEC City', territoryId: 'hyd-hitec', zone: 'Hyderabad', query: 'hitec city hitech cyber towers mindspace' },
  { name: 'Gachibowli', territoryId: 'hyd-gachibowli', zone: 'Hyderabad', query: 'gachibowli financial district isb botanical garden' },
  { name: 'Madhapur', territoryId: 'hyd-madhapur', zone: 'Hyderabad', query: 'madhapur inorbit ramky one' },
  { name: 'Charminar', territoryId: 'hyd-charminar', zone: 'Hyderabad', query: 'charminar old city lad bazar pearla' },
  { name: 'Kondapur', territoryId: 'hyd-kondapur', zone: 'Hyderabad', query: 'kondapur botanical garden kothaguda' },
  { name: 'Secunderabad', territoryId: 'hyd-secunderabad', zone: 'Hyderabad', query: 'secunderabad clock tower paradise parade ground' },
  { name: 'Koregaon Park', territoryId: 'pune-kp', zone: 'Pune', query: 'koregaon park kp lane 5 german bakery osho' },
  { name: 'FC Road', territoryId: 'pune-fc', zone: 'Pune', query: 'fc road fergusson college jm road' },
  { name: 'Baner', territoryId: 'pune-baner', zone: 'Pune', query: 'baner balewadi high street aundh' },
  { name: 'Hinjewadi Phase 1', territoryId: 'pune-hinjewadi', zone: 'Pune', query: 'hinjewadi phase 1 2 rajiv gandhi it park' },
  { name: 'Viman Nagar', territoryId: 'pune-viman', zone: 'Pune', query: 'viman nagar phoenix marketcity airport road' },
  { name: 'Kothrud', territoryId: 'pune-kothrud', zone: 'Pune', query: 'kothrud paud road karve statue' },
  { name: 'Pune Camp', territoryId: 'pune-camp', zone: 'Pune', query: 'pune camp mg road east street' },
  { name: 'Kalyani Nagar', territoryId: 'pune-kalyani', zone: 'Pune', query: 'kalyani nagar mundhwa kalyani nagar' },
];

/* ---------- Gen-Z Matchmaker Roulette Profiles ---------- */
export const MATCHMAKER_PROFILES = [
  { name: 'Kabir', age: 23, vibe: 'Drives father’s Fortuner, 94% Red Flag, speaks in ' + '“bro”', redFlags: 5, avatar: 'chars/chapri-goblin.png', tag: '🚩 WALKING RED FLAG' },
  { name: 'Shanaya', age: 21, vibe: 'Orders iced oat latte, pulls extensions in valet queues, 100% Drama', redFlags: 4, avatar: 'chars/baddie-goblin.png', tag: '💅 TOXIC BADDIE' },
  { name: 'Armaan', age: 24, vibe: 'Pretends to work in VC, lives in DLF Phase 5, texts at 2 AM', redFlags: 3, avatar: 'chars/aura-goblin.png', tag: '🫦 SITUATIONSHIP DEALER' },
  { name: 'Simran', age: 22, vibe: 'Films 45 reels per café visit, will make you hold the tripod', redFlags: 3, avatar: 'chars/reel-goblin.png', tag: '🎥 CONTENT ADDICT' },
  { name: 'Gurpreet', age: 25, vibe: 'Chest day 7 times a week, brings shaker to first dates', redFlags: 2, avatar: 'chars/gym-goblin.png', tag: '💪 PROTEIN FIEND' },
  { name: 'Rohan', age: 22, vibe: 'Says “I’m not looking for anything serious” before hello', redFlags: 5, avatar: 'chars/npc-goblin.png', tag: '🏩 CASUAL HOOKUP FIEND' },
];

/* ---------- Localized Sector Roasts ---------- */
export const ROASTS = {
  sector29: {
    sfw: 'Sector 29: 47 microbreweries, 0 parking spots, and 500 boys named Kabir arguing over who booked the table.',
    nsfw: 'Sector 29 After Dark: Where beer goggles make everyone look like a 9/10 until the valet brings your dented Swift.',
  },
  cyberhub: {
    sfw: 'Cyber Hub: 90% corporate existential depression, 10% people taking LinkedIn portraits near the amphitheatre.',
    nsfw: 'Cyber Hub After Dark: Corporate execs pretending to network while desperately scouting for OYO dates on Bumble.',
  },
  cp: {
    sfw: 'Connaught Place: You walk into Inner Circle to buy a book and walk out with 4 fake Ray-Bans and a shoe cleaner scam.',
    nsfw: 'Connaught Place After Dark: Central Park bushes have witnessed more scandalous affairs than the Supreme Court.',
  },
  hauzkhas: {
    sfw: 'Hauz Khas Village: Medieval 13th-century ruins surrounded by 21st-century kids doing 14 takes of the same reel.',
    nsfw: 'Hauz Khas After Dark: That terrace bar where the cocktails cost 800 bucks and everyone is flirting like tomorrow is lockdown.',
  },
  gk2: {
    sfw: 'GK-II: Where dogs have higher credit scores than the people shopping for athleisure at M Block.',
    nsfw: 'GK-II After Dark: High-heels so lethal they could pierce a defense budget, fueled by iced matcha and toxic gossip.',
  },
  rajouri: {
    sfw: 'Rajouri Garden: The world capital of heavily modified Fortuners with bass so loud it changes your heartbeat.',
    nsfw: 'Rajouri After Dark: Fake Gucci, real attitude, and a catfight in the valet queue every single Saturday night.',
  },
  karolbagh: {
    sfw: 'Karol Bagh: Where you can get an iPhone screen replaced and your wedding sherwani stitched in the same 4-foot alley.',
    nsfw: 'Karol Bagh After Dark: Shop uncles with 3 gold chains staring at every passing couple like it’s a moral crime.',
  },
  noida18: {
    sfw: 'Noida Sector 18: Mall of India is so huge people have entered as students and graduated before finding the exit.',
    nsfw: 'Noida 18 After Dark: Fogged car windows behind the mall with emergency hazard lights blinking for privacy.',
  },
  dwarka: {
    sfw: 'Dwarka: 400 identical red-brick society gates designed specifically so food delivery riders never reach your house.',
    nsfw: 'Dwarka After Dark: Balcony aunties with binoculars tracking society couples like raw military surveillance.',
  },
  northcampus: {
    sfw: 'North Campus: 50,000 students running on momos and dreams of clearing UPSC while shooting dance reels at Vishwavidyalaya.',
    nsfw: 'North Campus After Dark: Flirtations behind Miranda House gate that could melt Delhi winter fog.',
  },
  mgroad: {
    sfw: 'MG Road: Three lanes miraculously operating as six lanes with everyone honking at the same red light.',
    nsfw: 'MG Road After Dark: Midnight clubs where the drama is louder than the subwoofers.',
  },
  khanmarket: {
    sfw: 'Khan Market: A cup of coffee costs one organ, but at least you saw three retired diplomats and an indie filmmaker.',
    nsfw: 'Khan Market After Dark: Posh wine tastings where everyone is quietly checking whose divorce settlement was bigger.',
  },
  'blr-indiranagar': {
    sfw: 'Indiranagar: Brunch queue incorporated as a startup, raised a seed round, then pivoted to waiting.',
    nsfw: 'Indiranagar After Dark: 100ft Road pubs where “one drink” is a legally binding overnight contract.',
  },
  'blr-koramangala': {
    sfw: 'Koramangala: Every third person is “building something in stealth.” The stealth is a Notion doc.',
    nsfw: 'Koramangala After Dark: Terrace parties where the founder pitch and the situationship use the same slide deck.',
  },
  'blr-whitefield': {
    sfw: 'Whitefield: You left home at 6. You will arrive in time for next quarter’s standup.',
    nsfw: 'Whitefield After Dark: Cab cancelled itself. So did the date. Phoenix parking is still judging you.',
  },
  'blr-mgroad': {
    sfw: 'MG Road: Brigade Road is a fashion week that forgot to invite the weather.',
    nsfw: 'MG Road After Dark: Metro last-train energy mixed with “my PG warden thinks I am at the library.”',
  },
  'blr-church': {
    sfw: 'Church Street: Live music, dead parking, and 14 people filming the same guitarist.',
    nsfw: 'Church Street After Dark: Two pints in and everyone is suddenly a poet with a hotel booking.',
  },
  'blr-hsr': {
    sfw: 'HSR: Filter coffee, dog parks, and a 27th Main that believes it is a highway.',
    nsfw: 'HSR After Dark: Society parks after 11 where the walking trail is not for walking.',
  },
  'hyd-jubilee': {
    sfw: 'Jubilee Hills: Valet tickets have a higher net worth than the hatchback they belong to.',
    nsfw: 'Jubilee Hills After Dark: Road 36 tables where the biryani is spicy and the gossip is extra dum.',
  },
  'hyd-hitec': {
    sfw: 'HITEC City: Badge lanyards as far as the eye can see. The eye is also on a standup call.',
    nsfw: 'HITEC After Dark: “Client dinner” that mysteriously ends at a hotel with hourly rates.',
  },
  'hyd-charminar': {
    sfw: 'Charminar: Pearls, irani chai, and traffic that has been in beta since 1591.',
    nsfw: 'Charminar After Dark: Old City lanes where the sherwani shop uncle has seen every plot twist.',
  },
  'pune-kp': {
    sfw: 'Koregaon Park: Osho leftover calm colliding with 2026 main-character volume.',
    nsfw: 'KP After Dark: Lane 7 where the German Bakery is closed and the morals are optional.',
  },
  'pune-fc': {
    sfw: 'FC Road: Students, scooters, and a Fergusson degree being used as a tripod stand.',
    nsfw: 'FC Road After Dark: Hostel curfew vs juice-centre alibi. The juice centre has seen things.',
  },
  'pune-hinjewadi': {
    sfw: 'Hinjewadi: An IT park so large your cab completed onboarding before it found Gate 3.',
    nsfw: 'Hinjewadi After Dark: Phase 1 parking where WFH ended and “wfh nearby” began.',
  },
};
