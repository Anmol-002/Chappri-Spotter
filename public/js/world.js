// Shared city world: the map, posts and fights everyone should see.
// Personal XP / votes stay in the browser (see state.js).
import { CATEGORIES, NATIONAL_STARTER_ROWS, STATS, TERRITORIES } from './data.js';

export const MAX_SIGHTINGS = 400;
export const MAX_BATTLES = 25;

export const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

const SEED_ROWS = [
  ['sector29', 'bhai-ek-baar-aur', 5, 'Take 37. The tripod now has permanent residency.', 41, false],
  ['sector29', 'unbuttoning', 4, 'Shirt buttons operating at 20% capacity in 41°C.', 18, false],
  ['cyberhub', 'baddie', 4, 'Lobby turned into a runway without informing management.', 34, false],
  ['cyberhub', 'aura', 5, 'Someone walked in slow motion. There was no music.', 27, false],
  ['mgroad', 'traffic', 5, 'Three lanes discovered inside a two-lane road.', 22, false],
  ['golfcourse', 'gym', 5, 'Lat spread deployed while waiting for a cold coffee.', 30, false],
  ['hudacity', 'npc', 4, 'Six commuters standing perfectly still, awaiting dialogue.', 15, false],
  ['sohna', 'wrong-side', 5, 'Direction of travel described locally as “a suggestion”.', 19, false],
  ['dwarka', 'protein', 4, 'Shaker bottle audible from the next sector.', 12, false],
  ['rajouri', 'loud-music', 4, 'Bass arrived six minutes before the car did.', 44, false],
  ['karolbagh', 'traffic', 5, 'Horn being used as a form of emotional expression.', 38, false],
  ['cp', 'chapri', 5, 'Unnecessary confidence detected at industrial scale.', 51, false],
  ['cp', 'main-character', 4, 'Subject convinced a camera crew is following him.', 24, false],
  ['khanmarket', 'fashion', 4, 'Outfit has a higher market cap than the café.', 29, false],
  ['hauzkhas', 'sunglasses', 4, 'Sunset was three hours ago. Eyewear disagrees.', 36, false],
  ['hauzkhas', 'couple', 3, 'Public affection exceeding local uncle tolerance.', 17, false],
  ['saket', 'sneaker', 4, 'Footwear worth more than the vehicle it arrived in.', 21, false],
  ['gk2', 'baddie', 5, 'Entrance made. Entire market adjusted accordingly.', 33, false],
  ['lajpat', 'chapri', 4, 'Bargaining escalated into a full TED talk.', 26, false],
  ['northcampus', 'public-dance', 4, 'Flash mob with one participant and twelve cameramen.', 39, false],
  ['laxminagar', 'mirror-selfie', 4, 'Mirror occupied. Indefinitely.', 20, false],
  ['noida18', 'reel', 5, 'Mall atrium converted into a film set without permission.', 42, false],
  ['noida62', 'npc', 5, 'Four office workers spawned at the metro gate at once.', 47, false],
  ['indirapuram', 'loud-music', 3, 'Speaker strapped to a scooter. Both were struggling.', 14, false],
  ['parichowk', 'aura', 3, 'Empty six-lane road being treated as a personal runway.', 11, false],
  ['faridabad', 'gym', 4, 'Pre-workout consumed in a queue. Queue noticed.', 16, false],
  ['hauzkhas', 'makeout', 5, 'Corner booth at HKV getting steamy under neon. Hands have clocked out.', 68, true],
  ['hauzkhas', 'terrace-hands', 4, 'Rooftop after 1AM. Two jackets, one chair, zero personal space.', 41, true],
  ['cyberhub', 'casual-hookup', 5, 'Eye contact held across the bar. Situationship formed in 4 minutes.', 74, true],
  ['cyberhub', 'looking-now', 4, 'Not looking for anything serious bio. Looking extremely serious tonight.', 39, true],
  ['cp', 'fogged-car', 4, 'Central Park service lane. Honda City. Hazards on. Windows not.', 52, true],
  ['gk2', 'spicy-siren', 5, 'High-heels and a backless dress ending three situationships in M Block.', 81, true],
  ['sector29', 'makeout', 4, 'Parking rear seat makeout while waiting for the valet. Valet waiting too.', 59, true],
  ['sector29', 'situationship', 5, 'Texts where r u after 11. Replies busy until the next brewery booking.', 47, true],
  ['noida18', 'oyo-commando', 5, 'Hoodie, cap, sunglasses, 118 minutes. Checkout was emotional.', 63, true],
  ['noida18', 'looking-now', 4, 'Mall of India food court. Two people pretending they came for the momos.', 28, true],
  ['dwarka', 'uncle-spying', 4, 'Balcony uncle on 100x zoom reviewing park couples life choices.', 45, true],
  ['rajouri', 'spicy-siren', 5, 'Two baddies pulled extensions in the valet line over a missed text.', 92, true],
  ['rajouri', 'thirst-comment', 4, 'Hi dear send pic said out loud. The Fortuner agreed.', 33, true],
  ['sohna', 'fogged-car', 4, 'Service-lane parking. Fogged windows. Suspension filed a complaint.', 48, true],
  ['northcampus', 'thirst-trap', 5, 'Hostel terrace reel testing physics, gravity and the 9PM curfew.', 77, true],
  ['saket', 'midnight-confession', 4, 'He said he was single. His lock screen is a roka photo.', 55, true],
  ['khanmarket', 'midnight-confession', 3, 'Wine tasting where the tasting notes were about whose divorce paid for it.', 22, true],
  ['golfcourse', 'looking-now', 3, 'Cold-coffee queue. Lat spread. Also looking. Denies both.', 19, true],
  ['saket', 'pool-party', 4, 'Terrace afterparty. Swimwear vs local morals. Swimwear is winning.', 31, true],
  ['blr-indiranagar', 'reel', 5, 'Brunch queue formed a startup, raised funding, pivoted to waiting.', 44, false],
  ['blr-indiranagar', 'baddie', 5, '100ft Road entrance. Three cafés adjusted their playlist.', 38, false],
  ['blr-koramangala', 'chapri', 4, 'Stealth founder. Stealth is a Notion doc titled “disruption.”', 36, false],
  ['blr-koramangala', 'traffic', 5, '80ft Road discovered a fourth lane inside a parked Innova.', 29, false],
  ['blr-whitefield', 'npc', 5, 'ORR commute. ETA: next financial year.', 51, false],
  ['blr-whitefield', 'protein', 4, 'Shaker bottle survived a 90-minute standstill. Occupant did not.', 17, false],
  ['blr-mgroad', 'fashion', 4, 'Brigade Road fit check. Weather was not consulted.', 33, false],
  ['blr-mgroad', 'traffic', 5, 'Signal turned green. Nobody believed it.', 27, false],
  ['blr-hsr', 'gym', 4, '27th Main treated as a personal treadmill. Dogs filed a complaint.', 22, false],
  ['blr-hsr', 'aura', 3, 'Filter coffee aura exceeded the recommended daily dosage.', 19, false],
  ['blr-church', 'loud-music', 5, 'Live band plus 14 phones filming the same chorus. Parking deceased.', 41, false],
  ['blr-church', 'main-character', 4, 'Subject walking like Church Street is a credit sequence.', 31, false],
  ['blr-ecity', 'npc', 5, 'Phase 1 gate. Four badges spawned. Zero dialogue options.', 48, false],
  ['blr-ecity', 'traffic', 5, 'Silk Board is not a junction. It is a lifestyle.', 39, false],
  ['blr-marathahalli', 'wrong-side', 5, 'Bridge logic: if it exists, it is a U-turn.', 34, false],
  ['blr-jayanagar', 'fashion', 3, '4th Block uncle reviewed the sneakers. Sneakers did not survive.', 16, false],
  ['blr-indiranagar', 'situationship', 5, '“One drink on 100ft.” Calendar now says tomorrow morning.', 62, true],
  ['blr-koramangala', 'looking-now', 4, 'Terrace pitch deck. Slide 3 was the hotel location.', 47, true],
  ['blr-church', 'makeout', 4, 'Pub washroom queue. Two people disappeared. The queue understood.', 55, true],
  ['blr-hsr', 'fogged-car', 4, 'Society visitor parking. Hazards on. Windows writing essays.', 43, true],
  ['blr-whitefield', 'oyo-commando', 5, 'Cab cancelled. Date did not. Phoenix-adjacent 118 minutes.', 36, true],
  ['hyd-jubilee', 'fashion', 5, 'Valet ticket out-earned the hatchback it was clipped to.', 46, false],
  ['hyd-jubilee', 'aura', 5, 'Road 36 walk-in. No music. Still a slow-motion shot.', 37, false],
  ['hyd-banjara', 'baddie', 5, 'Road 12 entrance. Three menus updated their prices in real time.', 35, false],
  ['hyd-banjara', 'reel', 4, 'Ring light vs heritage tree. Ring light is winning.', 28, false],
  ['hyd-hitec', 'npc', 5, 'Lanyards as far as lidar can see. All on mute.', 42, false],
  ['hyd-hitec', 'traffic', 4, 'Cyber Towers to Inorbit: 2 km, 47 minutes, 1 existential crisis.', 24, false],
  ['hyd-gachibowli', 'gym', 4, 'Financial District calves. Spreadsheet still open on the watch.', 21, false],
  ['hyd-gachibowli', 'protein', 3, 'Whey shake at the bus stop. The bus was not coming.', 14, false],
  ['hyd-madhapur', 'chapri', 4, 'ORR flyover used as a runway. Traffic used as extras.', 26, false],
  ['hyd-charminar', 'traffic', 5, 'Pearl market. Traffic in beta since 1591.', 49, false],
  ['hyd-charminar', 'loud-music', 4, 'Dhol rehearsal escaped the wedding and took Laad Bazar.', 32, false],
  ['hyd-kondapur', 'sunglasses', 3, 'Sunset denied. Eyewear proceeded anyway.', 18, false],
  ['hyd-secunderabad', 'unbuttoning', 4, 'Paradise queue. Shirt buttons filed for early retirement.', 23, false],
  ['hyd-jubilee', 'spicy-siren', 5, 'Road 36 table. Biryani spicy. Gossip on extra dum.', 71, true],
  ['hyd-banjara', 'midnight-confession', 4, 'He said he was single. His lock screen is a reception hall.', 44, true],
  ['hyd-hitec', 'oyo-commando', 5, '“Client dinner.” Invoice is a hotel with hourly rates.', 58, true],
  ['hyd-madhapur', 'looking-now', 4, 'Mindspace after 10. Two badges, one excuse, zero standup.', 33, true],
  ['hyd-charminar', 'uncle-spying', 4, 'Sherwani shop uncle reviewing every couple like a film censor.', 29, true],
  ['pune-kp', 'aura', 5, 'Lane 5 walk. Osho leftover calm lost to a Bluetooth speaker.', 40, false],
  ['pune-kp', 'baddie', 5, 'KP brunch. Three dogs have better agents than the humans.', 37, false],
  ['pune-fc', 'public-dance', 5, 'Fergusson steps. Degree used as a tripod. Crowd used as extras.', 45, false],
  ['pune-fc', 'chapri', 4, 'Scooter density exceeded the recommended student-to-horn ratio.', 31, false],
  ['pune-baner', 'reel', 4, 'High Street café. The latte art took more takes than the movie.', 27, false],
  ['pune-baner', 'gym', 4, 'Balewadi morning. Protein counted. Patience did not.', 20, false],
  ['pune-hinjewadi', 'npc', 5, 'Phase 1 Gate 3. Cab completed onboarding. You did not arrive.', 52, false],
  ['pune-hinjewadi', 'traffic', 5, 'IT park so large the signal learned waterfall methodology.', 38, false],
  ['pune-viman', 'sneaker', 4, 'Airport Road flex. Flight delayed. Outfit was on time.', 22, false],
  ['pune-kothrud', 'npc', 3, 'Paud Road evening. Entire signal waiting for the next dialogue.', 15, false],
  ['pune-camp', 'loud-music', 4, 'MG Road Camp. Bass doing more work than the speed limit.', 28, false],
  ['pune-kalyani', 'fashion', 4, 'Kalyani Nagar dinner. The bill asked for equity.', 25, false],
  ['pune-kp', 'makeout', 5, 'Lane 7 after 1AM. German Bakery closed. Morals also closed.', 64, true],
  ['pune-fc', 'situationship', 4, 'Hostel curfew vs juice-centre alibi. Juice centre has seen things.', 49, true],
  ['pune-hinjewadi', 'oyo-commando', 5, 'WFH ended. “WFH nearby” began. 118 minutes. Badge still on.', 41, true],
  ['pune-baner', 'thirst-trap', 4, 'High Street story. Outfit 8% fabric, 92% notifications.', 36, true],
  ['pune-kalyani', 'fogged-car', 4, 'Mundhwa service lane. Hazards on. Windows writing a thesis.', 30, true],
  ...NATIONAL_STARTER_ROWS.map(([territoryId, , , , , note], index) => [
    territoryId,
    ['chapri', 'aura', 'reel', 'fashion'][index % 4],
    3 + (index % 3),
    note,
    8 + (index * 7) % 29,
    false,
  ]),
];

export function seedSightings() {
  return SEED_ROWS.map(([territoryId, categoryId, intensity, note, up, nsfw], index) => {
    const territory = TERRITORIES.find((t) => t.id === territoryId);
    const drift = ((index % 5) - 2) * 0.0025;
    return {
      id: `seed${index + 1}`,
      territoryId,
      categoryId,
      intensity,
      note,
      up,
      down: 0,
      nsfw: Boolean(nsfw),
      at: Date.now() - ((((index + 1) * 7) % 36) + 1) * 9 * 60 * 1000,
      coords: territory ? [territory.coords[0] + drift, territory.coords[1] - drift] : [22.5, 79],
      scan: null,
    };
  }).sort((a, b) => b.at - a.at);
}

export function seedWorld() {
  const sightings = seedSightings();
  return {
    territories: TERRITORIES.map((t) => ({
      ...t,
      stats: { ...t.stats },
      reports: sightings.filter((s) => s.territoryId === t.id).length,
    })),
    sightings,
    battles: [],
    voters: {},
  };
}

/** Upgrade an older saved world with any starter places added in a newer release. */
export function mergeStarterWorld(existing) {
  const fresh = seedWorld();
  if (!existing?.territories?.length) return fresh;
  const territoryIds = new Set(existing.territories.map((t) => t.id));
  const sightingIds = new Set((existing.sightings || []).map((s) => s.id));
  const territories = [
    ...existing.territories,
    ...fresh.territories.filter((t) => !territoryIds.has(t.id)),
  ];
  const sightings = [
    ...(existing.sightings || []),
    ...fresh.sightings.filter((s) => !sightingIds.has(s.id)),
  ];
  territories.forEach((t) => {
    if (!territoryIds.has(t.id)) t.reports = sightings.filter((s) => s.territoryId === t.id).length;
  });
  return { ...existing, territories, sightings, battles: existing.battles || [], voters: existing.voters || {} };
}

export function sanitizeSighting(s) {
  if (!s || typeof s !== 'object') return null;
  const coords = Array.isArray(s.coords) ? [Number(s.coords[0]), Number(s.coords[1])] : null;
  if (!s.id || !s.territoryId || !coords || Number.isNaN(coords[0]) || Number.isNaN(coords[1])) return null;
  return {
    id: String(s.id).slice(0, 48),
    coords,
    territoryId: String(s.territoryId).slice(0, 40),
    categoryId: String(s.categoryId || '').slice(0, 40),
    intensity: Math.min(5, Math.max(1, Number(s.intensity) || 1)),
    note: String(s.note || '').slice(0, 140),
    at: Number(s.at) || Date.now(),
    up: Math.max(0, Number(s.up) || 0),
    down: Math.max(0, Number(s.down) || 0),
    nsfw: Boolean(s.nsfw),
    scan: s.scan?.verdict ? { verdict: String(s.scan.verdict).slice(0, 200) } : null,
  };
}

export function sanitizeTerritory(t) {
  if (!t?.id || !Array.isArray(t.coords)) return null;
  const stats = {};
  STATS.forEach((k) => {
    stats[k] = clamp(Number(t.stats?.[k]) || 0);
  });
  return {
    id: String(t.id).slice(0, 40),
    name: String(t.name || 'Uncharted Spot').slice(0, 28),
    zone: String(t.zone || 'FIELD-DISCOVERED').slice(0, 40),
    coords: [Number(t.coords[0]), Number(t.coords[1])],
    stats,
    reports: Math.max(0, Number(t.reports) || 0),
  };
}

export function eventFingerprint(event) {
  if (!event || typeof event !== 'object') return '';
  if (event.type === 'report') return `report:${event.sighting?.id || ''}`;
  if (event.type === 'vote') return `vote:${event.sightingId}:${event.voterId}`;
  if (event.type === 'battle') return `battle:${event.battle?.id || ''}`;
  if (event.type === 'fight') return `fight:${event.fight?.id || ''}`;
  return '';
}

/** Mutates `world`. Returns false if the event is a duplicate / invalid. */
export function applySharedEvent(world, event) {
  if (!world.voters) world.voters = {};
  if (!Array.isArray(world.territories)) world.territories = [];
  if (!Array.isArray(world.sightings)) world.sightings = [];
  if (!Array.isArray(world.battles)) world.battles = [];

  if (event?.type === 'report') {
    const sighting = sanitizeSighting(event.sighting);
    if (!sighting || world.sightings.some((s) => s.id === sighting.id)) return false;

    if (event.newTerritory && !world.territories.some((t) => t.id === event.newTerritory.id)) {
      const created = sanitizeTerritory(event.newTerritory);
      if (created) world.territories.push(created);
    }

    const existing = world.territories.find((t) => t.id === sighting.territoryId);
    if (existing && event.stat && !event.newTerritory) {
      existing.stats[event.stat] = clamp((existing.stats[event.stat] || 0) + Number(event.statDelta || 0));
      if (event.stat !== 'npc' && event.npcDelta) {
        existing.stats.npc = clamp((existing.stats.npc || 0) + Number(event.npcDelta));
      }
      existing.reports = (existing.reports || 0) + 1;
    }

    world.sightings.unshift(sighting);
    world.sightings = world.sightings.slice(0, MAX_SIGHTINGS);
    return true;
  }

  if (event?.type === 'vote') {
    const voterId = String(event.voterId || '').slice(0, 48);
    const sightingId = String(event.sightingId || '').slice(0, 48);
    const dir = event.dir === 'down' ? 'down' : event.dir === 'up' ? 'up' : null;
    if (!voterId || !sightingId || !dir) return false;
    const key = `${sightingId}:${voterId}`;
    if (world.voters[key]) return false;
    const sighting = world.sightings.find((s) => s.id === sightingId);
    if (!sighting) return false;
    world.voters[key] = dir;
    sighting[dir] = (sighting[dir] || 0) + 1;
    const territory = world.territories.find((t) => t.id === sighting.territoryId);
    const category = CATEGORIES.find((c) => c.id === sighting.categoryId);
    if (territory && category) {
      territory.stats[category.stat] = clamp((territory.stats[category.stat] || 0) + (dir === 'up' ? 2 : -3));
    }
    return true;
  }

  if (event?.type === 'battle') {
    const battle = event.battle;
    if (!battle?.id || world.battles.some((b) => b.id === battle.id)) return false;
    world.battles.unshift({
      id: String(battle.id).slice(0, 48),
      at: Number(battle.at) || Date.now(),
      a: String(battle.a || ''),
      b: String(battle.b || ''),
      aName: String(battle.aName || '').slice(0, 40),
      bName: String(battle.bName || '').slice(0, 40),
      winner: String(battle.winner || ''),
      winnerName: String(battle.winnerName || '').slice(0, 40),
      rounds: Array.isArray(battle.rounds) ? battle.rounds : [],
      vote: battle.vote ?? null,
    });
    world.battles = world.battles.slice(0, MAX_BATTLES);
    const champ = world.territories.find((t) => t.id === battle.winner);
    if (champ && Array.isArray(battle.rounds)) {
      battle.rounds
        .filter((r) => r?.winner === battle.winner && r.stat)
        .forEach((r) => {
          champ.stats[r.stat] = clamp((champ.stats[r.stat] || 0) + 1);
        });
    }
    return true;
  }

  if (event?.type === 'fight') return Boolean(event.fight?.id);
  return false;
}

export function publicWorld(world) {
  return {
    territories: world.territories,
    sightings: world.sightings,
    battles: world.battles,
    liveFight: world.liveFight && world.liveFight.expiresAt > Date.now() ? world.liveFight : null,
  };
}
