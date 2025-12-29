import dotenv from 'dotenv';
dotenv.config({ path: './apps/web/.env.local' });

import { createClient } from '@supabase/supabase-js';


async function createServerSupabaseAdmin() {
  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is missing');
  }

  if (!process.env.SUPABASE_SB_SECRET) {
    throw new Error('SUPABASE_SB_SECRET environment variable is missing');
  }

  // Use createClient for admin operations with secret key - no cookies needed
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SB_SECRET, // Admin secret key for elevated operations
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
const supabase = await createServerSupabaseAdmin();

// Random name lists
const FIRST_NAMES = [
  'Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia',
  'Harper', 'Evelyn', 'Abigail', 'Emily', 'Luna', 'Ella', 'Madison', 'Scarlett',
  'Liam', 'Noah', 'Oliver', 'Elijah', 'William', 'James', 'Benjamin', 'Lucas',
  'Henry', 'Alexander', 'Mason', 'Michael', 'Ethan', 'Daniel', 'Jacob', 'Logan'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
  'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Hall'
];

const NICHES = [
  'Lifestyle', 'Fashion', 'Beauty', 'Fitness', 'Travel', 'Food', 'Gaming',
  'Technology', 'Music', 'Comedy', 'Dance', 'Art', 'Photography', 'Wellness'
];

const BIO_TEMPLATES = [
  'Content creator passionate about {niche}. Sharing my journey with you! ✨',
  '{niche} enthusiast | Creating content that inspires 🌟',
  'Living my best {niche} life | Join me on this adventure! 🚀',
  '{niche} lover | Bringing you daily inspiration 💫',
  'Professional {niche} creator | Let\'s grow together! 🌱',
  'Your daily dose of {niche} content 🎯',
  '{niche} content | Authenticity over everything 💯',
];

// Helper functions
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[random(0, array.length - 1)];
}

function generatePresence() {
  // 0-10 scale, with most influencers in the 3-7 range
  const roll = Math.random();
  if (roll < 0.1) return random(8, 10); // 10% mega influencers
  if (roll < 0.3) return random(6, 7);  // 20% high presence
  if (roll < 0.8) return random(3, 5);  // 50% medium presence
  return random(1, 2);                   // 20% low presence
}

function generateFollowerCount(presence) {
  // Map presence (0-10) to follower counts
  const baseFollowers = {
    1: random(1000, 5000),
    2: random(5000, 15000),
    3: random(15000, 35000),
    4: random(35000, 75000),
    5: random(75000, 150000),
    6: random(150000, 300000),
    7: random(300000, 600000),
    8: random(600000, 1200000),
    9: random(1200000, 3000000),
    10: random(3000000, 10000000),
  };

  return baseFollowers[presence] || random(1000, 5000);
}

function generateUsername(firstName, lastName) {
  const styles = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${random(10, 99)}`,
    `the${firstName.toLowerCase()}`,
    `${firstName.toLowerCase()}.official`,
  ];
  return randomChoice(styles);
}

function generatePlatformUrl(platform, username) {
  const urls = {
    tiktok: `https://tiktok.com/@${username}`,
    instagram: `https://instagram.com/${username}`,
    youtube: `https://youtube.com/@${username}`,
    twitter: `https://twitter.com/${username}`,
  };
  return urls[platform];
}

async function createRandomInfluencer() {
  try {
    // Generate random data
    const firstName = randomChoice(FIRST_NAMES);
    const lastName = randomChoice(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const niche = randomChoice(NICHES);
    const bio = randomChoice(BIO_TEMPLATES).replace('{niche}', niche.toLowerCase());
    const presence = generatePresence();
    const verified = presence >= 7; // Only high-presence influencers are verified

    // Random profile image from Lorem Picsum
    const imageId = random(1, 1000);
    const profileImageUrl = `https://picsum.photos/seed/${imageId}/400/400`;

    console.log('\n🎲 Generating random influencer...');
    console.log(`   Name: ${name}`);
    console.log(`   Niche: ${niche}`);
    console.log(`   Presence Level: ${presence}/10`);
    console.log(`   Verified: ${verified ? 'Yes' : 'No'}`);

    // Insert influencer
    const { data: influencer, error: influencerError } = await supabase
      .from('influencers')
      .insert({
        name,
        bio,
        primary_niche: niche,
        verified,
        profile_image_url: profileImageUrl,
      })
      .select()
      .single();

    if (influencerError) {
      throw new Error(`Failed to create influencer: ${influencerError.message}`);
    }

    console.log('✅ Influencer created with ID:', influencer.id);

    // Generate social media handles (80% TikTok, 90% Instagram, 30% others)
    const handles = [];
    const platforms = [];

    // TikTok (80% chance)
    if (Math.random() < 0.8) {
      platforms.push('tiktok');
    }

    // Instagram (90% chance)
    if (Math.random() < 0.9) {
      platforms.push('instagram');
    }

    // YouTube (30% chance)
    if (Math.random() < 0.3) {
      platforms.push('youtube');
    }

    // Twitter (30% chance)
    if (Math.random() < 0.3) {
      platforms.push('twitter');
    }

    // Ensure at least one platform
    if (platforms.length === 0) {
      platforms.push(Math.random() < 0.5 ? 'tiktok' : 'instagram');
    }

    for (const platform of platforms) {
      const username = generateUsername(firstName, lastName);
      const baseFollowers = generateFollowerCount(presence);
      // Add some variance (+/- 20%)
      const variance = 0.8 + Math.random() * 0.4;
      const followerCount = Math.floor(baseFollowers * variance);

      handles.push({
        influencer_id: influencer.id,
        platform,
        username,
        url: generatePlatformUrl(platform, username),
        follower_count: followerCount,
      });
    }

    const { data: createdHandles, error: handlesError } = await supabase
      .from('influencer_handles')
      .insert(handles)
      .select();

    if (handlesError) {
      throw new Error(`Failed to create handles: ${handlesError.message}`);
    }

    console.log(`✅ Created ${createdHandles.length} social media handles:`);
    createdHandles.forEach(handle => {
      console.log(`   - ${handle.platform}: @${handle.username} (${handle.follower_count.toLocaleString()} followers)`);
    });

    console.log('\n✅ Random influencer created successfully!\n');
    return influencer;
  } catch (error) {
    console.error('❌ Error creating influencer:', error.message);
    throw error;
  }
}

// Parse command-line arguments
const args = process.argv.slice(2);
let count = 1;

// Check for --count or -c flag
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--count' || args[i] === '-c') && args[i + 1]) {
    count = parseInt(args[i + 1], 10);
    if (isNaN(count) || count < 1) {
      console.error('❌ Invalid count value. Must be a positive integer.');
      process.exit(1);
    }
  }
}

// Run the script
async function main() {
  console.log(`\n🚀 Creating ${count} influencer${count > 1 ? 's' : ''}...\n`);
  
  for (let i = 0; i < count; i++) {
    if (count > 1) {
      console.log(`\n[${ i + 1 }/${count}]`);
    }
    await createRandomInfluencer();
    
    // Small delay between creations to avoid rate limiting
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`\n🎉 Successfully created ${count} influencer${count > 1 ? 's' : ''}!\n`);
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
