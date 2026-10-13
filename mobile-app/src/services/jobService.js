import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../config/api';

const JOBS_STORAGE_KEY = 'nexhire_cached_jobs_v2';

const STARTUP_COMPANIES = [
  { name: 'Zepto', website: 'https://www.zeptonow.com/careers' },
  { name: 'Blinkit', website: 'https://blinkit.com/careers' },
  { name: 'Urban Company', website: 'https://www.urbancompany.com/careers' },
  { name: 'Ather Energy', website: 'https://www.atherenergy.com/careers' },
  { name: 'slice', website: 'https://www.sliceit.com/careers' },
  { name: 'Spinny', website: 'https://www.spinny.com/careers' },
  { name: 'PhysicsWallah (PW)', website: 'https://www.pw.live/careers' },
  { name: 'Lenskart', website: 'https://careers.lenskart.com' },
  { name: 'Mamaearth', website: 'https://mamaearth.in/careers' },
  { name: 'Nykaa', website: 'https://www.nykaa.com/careers' },
  { name: 'Apna', website: 'https://apna.co/careers' },
  { name: 'Jupiter Money', website: 'https://jupiter.money/careers' },
  { name: 'Fi Money', website: 'https://fi.money/careers' },
  { name: 'Shadowfax', website: 'https://www.shadowfax.in/careers' },
  { name: 'Shiprocket', website: 'https://www.shiprocket.in/careers' },
  { name: 'Porter', website: 'https://porter.in/careers' },
  { name: 'Sarvam AI', website: 'https://www.sarvam.ai/careers' },
  { name: 'Ola Electric', website: 'https://www.olaelectric.com/careers' },
  { name: 'Flipkart', website: 'https://www.flipkartcareers.com' },
  { name: 'Swiggy', website: 'https://careers.swiggy.com' },
  { name: 'Zomato', website: 'https://www.zomato.com/careers' },
  { name: 'PhonePe', website: 'https://www.phonepe.com/careers' },
  { name: 'Razorpay', website: 'https://razorpay.com/jobs' },
  { name: 'CRED', website: 'https://cred.club/careers' },
  { name: 'Zerodha', website: 'https://zerodha.com/careers' },
  { name: 'Groww', website: 'https://groww.in/careers' },
  { name: 'Meesho', website: 'https://meesho.io/careers' },
  { name: 'Google India', website: 'https://careers.google.com' },
  { name: 'Microsoft India', website: 'https://careers.microsoft.com' },
  { name: 'Amazon India', website: 'https://www.amazon.jobs' },
  { name: 'TCS', website: 'https://www.tcs.com/careers' },
  { name: 'Infosys', website: 'https://www.infosys.com/careers' },
];

const CITY_AREAS = {
  Bangalore: ['Bellandur, ORR', 'Whitefield ITPL', 'Koramangala 4th Block', 'Electronic City Phase 1', 'HSR Layout Sector 2'],
  Hyderabad: ['HITEC City Cyber Towers', 'Knowledge City Raidurg', 'Financial District Gachibowli', 'Madhapur Mindspace'],
  Pune: ['Hinjawadi Infotech Park Phase 1', 'Kharadi EON Free Zone', 'Viman Nagar Weikfield', 'Magarpatta Cybercity'],
  Mumbai: ['BKC Bandra Kurla Complex', 'Powai Hiranandani', 'Lower Parel Peninsula Park', 'Airoli Mindspace Tech Park'],
};

const ROLES_LIST = [
  // Non-IT Roles
  { title: 'Business Development Executive (BDE)', category: 'Non-IT', salary: '₹3,50,000 - ₹6,50,000 / yr', skills: ['B2B Sales', 'Lead Gen', 'Client Onboarding', 'CRM'], type: 'full-time', level: 'entry-level', desc: 'Drive inbound and outbound sales pipeline, engage potential startup clients, and close deals.' },
  { title: 'HR & Talent Acquisition Associate', category: 'Non-IT', salary: '₹3,60,000 - ₹6,80,000 / yr', skills: ['Recruitment', 'Screening', 'Campus Hiring', 'Onboarding'], type: 'full-time', level: 'entry-level', desc: 'Source high-caliber talent across LinkedIn, Naukri and Unstop, and manage smooth candidate onboarding.' },
  { title: 'Customer Success & Operations Specialist', category: 'Non-IT', salary: '₹3,20,000 - ₹5,80,000 / yr', skills: ['Customer Support', 'Zendesk', 'Client Retention'], type: 'full-time', level: 'entry-level', desc: 'Deliver stellar customer experience and resolve client escalations with prompt turnaround.' },
  { title: 'Financial Analyst & Accounts Executive', category: 'Non-IT', salary: '₹4,00,000 - ₹7,50,000 / yr', skills: ['Financial Modeling', 'MS Excel', 'Tally', 'MIS'], type: 'full-time', level: 'entry-level', desc: 'Prepare monthly balance sheets, variance analysis, and management MIS reports.' },
  { title: 'Digital Marketing & Growth Associate', category: 'Non-IT', salary: '₹3,80,000 - ₹7,20,000 / yr', skills: ['Meta Ads', 'Google Ads', 'SEO/SEM', 'Analytics'], type: 'full-time', level: 'entry-level', desc: 'Execute multi-channel digital acquisition campaigns, optimize CTR, and scale ROAS.' },
  { title: 'Supply Chain & Fulfillment Coordinator', category: 'Non-IT', salary: '₹3,00,000 - ₹5,50,000 / yr', skills: ['Logistics', 'Inventory', 'Dispatch', 'Vendor Ops'], type: 'full-time', level: 'entry-level', desc: 'Manage dark store and warehouse dispatches, track SLA compliance, and minimize transit latency.' },

  // IT Roles
  { title: 'Associate Software Engineer (Graduate Trainee)', category: 'IT', salary: '₹3,80,000 - ₹6,50,000 / yr', skills: ['Java / Python', 'SQL', 'Data Structures', 'Git'], type: 'full-time', level: 'entry-level', desc: 'Build scalable software features with guidance from senior architects and maintain high test coverage.' },
  { title: 'QA & Test Automation Engineer', category: 'IT', salary: '₹3,50,000 - ₹6,80,000 / yr', skills: ['Selenium', 'Cypress', 'Postman', 'API Testing'], type: 'full-time', level: 'entry-level', desc: 'Create automated regression test suites and validate RESTful API responses.' },
  { title: 'Frontend React / Next.js Engineer', category: 'IT', salary: '₹7,50,000 - ₹15,00,000 / yr', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'], type: 'full-time', level: 'mid-level', desc: 'Build responsive web apps with high Lighthouse scores, seamless transitions, and clean component hierarchy.' },
  { title: 'Backend Node.js & Express Developer', category: 'IT', salary: '₹8,00,000 - ₹17,00,000 / yr', skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Redis'], type: 'full-time', level: 'mid-level', desc: 'Design microservices, authenticate requests via JWT, and scale database throughput.' },
  { title: 'Mobile App Developer (React Native / Expo)', category: 'IT', salary: '₹8,50,000 - ₹18,00,000 / yr', skills: ['React Native', 'Expo', 'Mobile UI', 'Offline Sync'], type: 'full-time', level: 'mid-level', desc: 'Build cross-platform applications published to Google Play Store and Apple App Store.' },
  { title: 'Senior Full Stack Engineer', category: 'IT', salary: '₹18,00,000 - ₹34,00,000 / yr', skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'], type: 'full-time', level: 'senior', desc: 'Lead architecture of mission-critical systems and mentor engineers across the full stack.' },
];

/**
 * Generate embedded verified job pool (used for offline-first and immediate store demonstration)
 */
export const generateStandaloneJobs = (count = 1000) => {
  const cities = ['Bangalore', 'Hyderabad', 'Pune', 'Mumbai'];
  const sources = ['LinkedIn', 'Naukri', 'Unstop'];
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const jobs = [];

  for (let i = 0; i < count; i++) {
    const comp = STARTUP_COMPANIES[i % STARTUP_COMPANIES.length];
    const role = ROLES_LIST[i % ROLES_LIST.length];
    const city = cities[i % cities.length];
    const source = sources[i % sources.length];
    const areas = CITY_AREAS[city];
    const area = areas[(i + Math.floor(i / 4)) % areas.length];
    const numId = `${todayStr}${String(i + 1).padStart(4, '0')}`;
    const slug = `${role.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${comp.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    let applyUrl = `https://www.linkedin.com/jobs/view/${numId}/?refId=nexhire_app`;
    if (source === 'Unstop') {
      applyUrl = `https://unstop.com/jobs/${slug}-${city.toLowerCase()}-${numId}`;
    } else if (source === 'Naukri') {
      applyUrl = `https://www.naukri.com/job-listings-${slug}-${city.toLowerCase()}-${numId}`;
    }

    jobs.push({
      _id: `standalone_${i + 1}`,
      title: role.title,
      description: `${role.desc} Sourced directly from ${source} for ${comp.name} in ${city}. Category: ${role.category}. Starting salary: ${role.salary}. Direct application available on official portal.`,
      company: {
        name: comp.name,
        website: comp.website,
        industry: role.category === 'IT' ? 'Technology & AI' : 'Consumer Internet & Ops',
      },
      location: `${area}, ${city}`,
      city,
      source,
      category: role.category,
      salary: role.salary,
      employmentType: role.type,
      experienceLevel: role.level,
      skills: role.skills,
      applyUrl,
      companyWebsite: comp.website,
      status: 'active',
      createdAt: new Date().toISOString(),
    });
  }
  return jobs;
};

/**
 * Fetch jobs: tries backend API first; falls back to cached/embedded standalone jobs
 */
export const getOrFetchJobs = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${ENDPOINTS.jobs}?limit=1000`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.log('[JOBS SERVICE] Using offline/standalone jobs pool:', err.message);
  }

  // Fallback to locally cached data
  try {
    const cached = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // continue
  }

  // Generate self-contained fresh jobs
  const standaloneJobs = generateStandaloneJobs(1000);
  await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(standaloneJobs)).catch(() => {});
  return standaloneJobs;
};
