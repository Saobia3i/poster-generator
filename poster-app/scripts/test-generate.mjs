import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const API_URL = process.env.API_URL || 'http://localhost:3000/api/generate-poster';

const TEST_POSTERS = [
  {
    name: 'landscape.png',
    payload: {
      sizePreset: 'poster_landscape',
      title: 'Hands on Weekends',
      subtitle: 'CYBERSECURITY & RECONNAISSANCE WORKSHOP',
      bulletList: [
        'ACTIVE & PASSIVE RECONNAISSANCE',
        'PORT SCANNING & SERVICE DETECTING',
        'OSINT & SOCIAL ENGINEERING TECHNIQUES'
      ],
      hasTable: true,
      tableHeaders: ['Session', 'Time', 'Instructor'],
      tableRows: [
        ['Recon Basics', '10:00 AM', 'Abrar Bhai'],
        ['Port Scanning', '11:30 AM', 'Red Team Lead'],
        ['OSINT Lab', '02:00 PM', 'Special Guest']
      ],
      hasIconBadges: true,
      iconBadges: [
        { icon: 'shield-check', label: 'Certified' },
        { icon: 'terminal', label: 'Hands-on' },
        { icon: 'users', label: 'Interactive' }
      ],
      hasQrCode: false,
      qrUrl: '',
      hasWatermark: true,
      watermarkLeft: 'SECURE',
      watermarkRight: 'LEAD',
      hasExtraBadge: true,
      extraBadgeText: 'REGISTRATION OPEN'
    }
  },
  {
    name: 'portrait.png',
    payload: {
      sizePreset: 'poster_portrait_a4',
      title: 'Cybersecurity Seminar',
      subtitle: 'Building a secure digital future',
      bulletList: [
        'Explore industry best practices',
        'Interactive Q&A session',
        'Free certification badge'
      ],
      hasTable: false,
      tableHeaders: [],
      tableRows: [],
      hasIconBadges: false,
      iconBadges: [],
      hasQrCode: true,
      qrUrl: 'https://austcaic.org/seminar-register',
      hasWatermark: false,
      watermarkLeft: '',
      watermarkRight: '',
      hasExtraBadge: true,
      extraBadgeText: 'FREE ENTRY'
    }
  },
  {
    name: 'banner.png',
    payload: {
      sizePreset: 'banner_small',
      title: 'AUSTCAIC Cybersecurity',
      subtitle: 'Securing the Campus, Leading the Tech Community',
      bulletList: [],
      hasTable: false,
      tableHeaders: [],
      tableRows: [],
      hasIconBadges: false,
      iconBadges: [],
      hasQrCode: false,
      qrUrl: '',
      hasWatermark: false,
      watermarkLeft: '',
      watermarkRight: ''
    }
  }
];

async function runTests() {
  const proofsDir = join(process.cwd(), 'public', 'proofs');
  mkdirSync(proofsDir, { recursive: true });

  console.log('Sending render requests to configured API URL...');
  for (const test of TEST_POSTERS) {
    console.log(`Generating ${test.name}...`);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.payload)
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`Failed to generate ${test.name}:`, text);
        continue;
      }

      const arrayBuffer = await res.arrayBuffer();
      const outputPath = join(proofsDir, test.name);
      writeFileSync(outputPath, Buffer.from(arrayBuffer));
      console.log(`Saved ${outputPath}`);
    } catch (err) {
      console.error(`Error while generating ${test.name}:`, err);
    }
  }
}

runTests();
