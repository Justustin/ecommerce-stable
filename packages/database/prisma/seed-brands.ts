// LAKOO Brand Seed Data
// Run with: npx prisma db seed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LAKOO_BRANDS = [
  {
    brand_code: 'LAKOO-ELITE',
    brand_name: 'LAKOO Elite',
    slug: 'lakoo-elite',
    tagline: 'Premium Fashion for Modern Professionals',
    target_audience: 'Professionals 25-45',
    style_category: 'Premium Casual',
    default_margin_percent: 60.00,
    primary_color: '#1a1a2e',
    secondary_color: '#f5f5f5',
    display_order: 1,
  },
  {
    brand_code: 'LAKOO-STREET',
    brand_name: 'LAKOO Street',
    slug: 'lakoo-street',
    tagline: 'Urban Style, Bold Statements',
    target_audience: 'Youth 18-30',
    style_category: 'Streetwear',
    default_margin_percent: 50.00,
    primary_color: '#000000',
    secondary_color: '#ff6b6b',
    display_order: 2,
  },
  {
    brand_code: 'LAKOO-CLASSIC',
    brand_name: 'LAKOO Classic',
    slug: 'lakoo-classic',
    tagline: 'Timeless Elegance',
    target_audience: 'Adults 30-50',
    style_category: 'Classic Formal',
    default_margin_percent: 55.00,
    primary_color: '#2c3e50',
    secondary_color: '#ecf0f1',
    display_order: 3,
  },
  {
    brand_code: 'LAKOO-ACTIVE',
    brand_name: 'LAKOO Active',
    slug: 'lakoo-active',
    tagline: 'Move Without Limits',
    target_audience: 'Fitness Enthusiasts',
    style_category: 'Athleisure',
    default_margin_percent: 45.00,
    primary_color: '#00b894',
    secondary_color: '#ffffff',
    display_order: 4,
  },
  {
    brand_code: 'LAKOO-KIDS',
    brand_name: 'LAKOO Kids',
    slug: 'lakoo-kids',
    tagline: 'Fun Fashion for Little Ones',
    target_audience: 'Children 3-12',
    style_category: 'Kids Fashion',
    default_margin_percent: 45.00,
    primary_color: '#fdcb6e',
    secondary_color: '#6c5ce7',
    display_order: 5,
  },
  {
    brand_code: 'LAKOO-HOMME',
    brand_name: 'LAKOO Homme',
    slug: 'lakoo-homme',
    tagline: 'Refined Menswear',
    target_audience: 'Men 25-45',
    style_category: 'Men Premium',
    default_margin_percent: 55.00,
    primary_color: '#2d3436',
    secondary_color: '#dfe6e9',
    display_order: 6,
  },
  {
    brand_code: 'LAKOO-FEMME',
    brand_name: 'LAKOO Femme',
    slug: 'lakoo-femme',
    tagline: 'Elegant Women Fashion',
    target_audience: 'Women 25-45',
    style_category: 'Women Premium',
    default_margin_percent: 55.00,
    primary_color: '#e84393',
    secondary_color: '#ffeaa7',
    display_order: 7,
  },
  {
    brand_code: 'LAKOO-BASICS',
    brand_name: 'LAKOO Basics',
    slug: 'lakoo-basics',
    tagline: 'Everyday Essentials',
    target_audience: 'All Ages',
    style_category: 'Basic Essentials',
    default_margin_percent: 40.00,
    primary_color: '#636e72',
    secondary_color: '#ffffff',
    display_order: 8,
  },
  {
    brand_code: 'LAKOO-DENIM',
    brand_name: 'LAKOO Denim',
    slug: 'lakoo-denim',
    tagline: 'Denim Done Right',
    target_audience: 'Youth & Adults',
    style_category: 'Denim Specialist',
    default_margin_percent: 50.00,
    primary_color: '#0984e3',
    secondary_color: '#74b9ff',
    display_order: 9,
  },
  {
    brand_code: 'LAKOO-SWIM',
    brand_name: 'LAKOO Swim',
    slug: 'lakoo-swim',
    tagline: 'Beach Ready Style',
    target_audience: 'Beach Lovers',
    style_category: 'Swimwear',
    default_margin_percent: 50.00,
    primary_color: '#00cec9',
    secondary_color: '#81ecec',
    display_order: 10,
  },
  {
    brand_code: 'LAKOO-LOUNGE',
    brand_name: 'LAKOO Lounge',
    slug: 'lakoo-lounge',
    tagline: 'Comfort Meets Style',
    target_audience: 'Home Comfort Seekers',
    style_category: 'Loungewear',
    default_margin_percent: 42.00,
    primary_color: '#a29bfe',
    secondary_color: '#dfe6e9',
    display_order: 11,
  },
  {
    brand_code: 'LAKOO-ECO',
    brand_name: 'LAKOO Eco',
    slug: 'lakoo-eco',
    tagline: 'Sustainable Fashion Forward',
    target_audience: 'Eco-Conscious',
    style_category: 'Sustainable',
    default_margin_percent: 52.00,
    primary_color: '#00b894',
    secondary_color: '#55efc4',
    display_order: 12,
  },
  {
    brand_code: 'LAKOO-CURVE',
    brand_name: 'LAKOO Curve',
    slug: 'lakoo-curve',
    tagline: 'Fashion for Every Body',
    target_audience: 'Plus Size',
    style_category: 'Plus Size Fashion',
    default_margin_percent: 48.00,
    primary_color: '#e17055',
    secondary_color: '#fab1a0',
    display_order: 13,
  },
  {
    brand_code: 'LAKOO-MODEST',
    brand_name: 'LAKOO Modest',
    slug: 'lakoo-modest',
    tagline: 'Elegant Modest Fashion',
    target_audience: 'Modest Fashion',
    style_category: 'Modest Wear',
    default_margin_percent: 50.00,
    primary_color: '#6c5ce7',
    secondary_color: '#a29bfe',
    display_order: 14,
  },
  {
    brand_code: 'LAKOO-SPORT',
    brand_name: 'LAKOO Sport',
    slug: 'lakoo-sport',
    tagline: 'Performance Athletic Wear',
    target_audience: 'Athletes',
    style_category: 'Sports Performance',
    default_margin_percent: 48.00,
    primary_color: '#d63031',
    secondary_color: '#ff7675',
    display_order: 15,
  },
];

async function main() {
  console.log('Seeding 15 LAKOO brands...');

  for (const brand of LAKOO_BRANDS) {
    await prisma.brands.upsert({
      where: { brand_code: brand.brand_code },
      update: brand,
      create: brand,
    });
    console.log(`  ✓ ${brand.brand_name}`);
  }

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
