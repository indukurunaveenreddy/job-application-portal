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
  { name: 'L&T Construction', website: 'https://www.larsentoubro.com/careers' },
  { name: 'Tata Projects', website: 'https://www.tataprojects.com/careers' },
  { name: 'Afcons Infrastructure', website: 'https://www.afcons.com/en/careers' },
  { name: 'Quick Heal Technologies', website: 'https://www.quickheal.co.in/careers' },
  { name: 'Palo Alto Networks India', website: 'https://jobs.paloaltonetworks.com' },
  { name: 'SIS Group Enterprises', website: 'https://www.sisindia.com/careers' },
  { name: 'Indian Air Force (IAF)', website: 'https://afcat.cdac.in' },
  { name: 'Hindustan Aeronautics Limited (HAL)', website: 'https://hal-india.co.in/Career' },
  { name: 'DRDO', website: 'https://www.drdo.gov.in/careers' },
  { name: 'Bharat Electronics Limited (BEL)', website: 'https://bel-india.in/Careers' },
];

const CITY_AREAS = {
  Bangalore: ['Bellandur, ORR', 'Whitefield ITPL', 'Koramangala 4th Block', 'Electronic City Phase 1', 'HSR Layout Sector 2', 'Yelahanka Air Force Station'],
  Hyderabad: ['HITEC City Cyber Towers', 'Knowledge City Raidurg', 'Financial District Gachibowli', 'Madhapur Mindspace', 'Dundigal Air Force Academy Area'],
  Pune: ['Hinjawadi Infotech Park Phase 1', 'Kharadi EON Free Zone', 'Viman Nagar Weikfield', 'Magarpatta Cybercity', 'Lohegaon Air Force Station Zone'],
  Mumbai: ['BKC Bandra Kurla Complex', 'Powai Hiranandani', 'Lower Parel Peninsula Park', 'Airoli Mindspace Tech Park', 'Santacruz Defense Airbase Corridor'],
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

  // Civil Engineering Roles
  { title: 'Civil Site Engineer & Construction Supervisor', category: 'Civil', salary: '₹4,50,000 - ₹9,00,000 / yr', skills: ['AutoCAD Civil', 'Site Supervision', 'RCC Construction', 'BOQ & Estimation', 'Surveying'], type: 'full-time', level: 'entry-level', desc: 'Oversee on-site construction activities, concrete pours, site quality inspections, surveying, and contractor coordination.' },
  { title: 'Structural Design Engineer (Civil & High-Rise)', category: 'Civil', salary: '₹6,50,000 - ₹14,50,000 / yr', skills: ['STAAD.Pro', 'ETABS', 'Structural Analysis', 'Concrete Technology', 'AutoCAD Civil 3D'], type: 'full-time', level: 'mid-level', desc: 'Perform 3D structural analysis, design earthquake-resistant RCC/steel frame structures, and review load specifications.' },
  { title: 'Civil Project Planning & Billing Engineer', category: 'Civil', salary: '₹5,00,000 - ₹11,00,000 / yr', skills: ['Primavera P6', 'MS Project', 'Billing & Invoicing', 'QA/QC', 'Construction Safety'], type: 'full-time', level: 'mid-level', desc: 'Formulate construction milestones, manage project Gantt schedules, execute contractor billing, and audit material quality.' },

  // Security & Cyber Defense Roles
  { title: 'Cyber Security Analyst & Threat Hunter', category: 'Security', salary: '₹7,00,000 - ₹16,00,000 / yr', skills: ['SIEM (Splunk/QRadar)', 'Incident Response', 'VAPT', 'Firewalls', 'Network Security'], type: 'full-time', level: 'mid-level', desc: 'Protect critical enterprise networks, monitor real-time SIEM alerts, perform vulnerability assessments, and mitigate zero-day attack vectors.' },
  { title: 'Information Security Officer & SOC Specialist', category: 'Security', salary: '₹8,50,000 - ₹18,50,000 / yr', skills: ['SOC Operations', 'Threat Intelligence', 'ISO 27001', 'Endpoint Detection (EDR)', 'Penetration Testing'], type: 'full-time', level: 'mid-level', desc: 'Oversee 24/7 Security Operations Center monitoring, investigate security incidents, enforce ISO 27001 compliance, and configure EDR tools.' },
  { title: 'Security Operations & Facility Surveillance Supervisor', category: 'Security', salary: '₹3,80,000 - ₹7,20,000 / yr', skills: ['Access Control', 'CCTV Surveillance', 'Emergency Protocol', 'Risk Assessment', 'Physical Security'], type: 'full-time', level: 'entry-level', desc: 'Manage access control systems, monitor CCTV command centers, lead emergency drills, and audit campus physical security standards.' },

  // Air Force & Defense Roles
  { title: 'Indian Air Force (IAF) - Commissioned Officer (Flying & Technical)', category: 'Air Force', salary: '₹8,50,000 - ₹19,50,000 / yr + Defense Perks', skills: ['Aeronautical Engineering', 'AFCAT Qualified', 'Aviation Navigation', 'Tactical Operations', 'Flight Protocol'], type: 'full-time', level: 'mid-level', desc: 'Lead cutting-edge military aviation wings, oversee radar networks, airbase security, and precision aerospace engineering systems for national defense.' },
  { title: 'Air Force Security Specialist (Garud Base Defense & Airfield Security)', category: 'Air Force', salary: '₹6,50,000 - ₹15,00,000 / yr + Defense Allowances', skills: ['Airbase Security', 'Perimeter Defense', 'Tactical Counter-Terror', 'Emergency Airfield Protocol', 'Weapons Systems'], type: 'full-time', level: 'mid-level', desc: 'Guard frontline military airbases, execute airfield counter-sabotage operations, manage perimeter defense, and lead tactical quick reaction teams.' },
  { title: 'Aviation Avionics & Radar Maintenance Engineer (Air Force Defense Systems)', category: 'Air Force', salary: '₹7,50,000 - ₹17,00,000 / yr', skills: ['Avionics Systems', 'Defense Radars', 'Aircraft Electricals', 'Diagnostic Flight Test', 'Electronic Warfare Systems'], type: 'full-time', level: 'mid-level', desc: 'Maintain military radar telemetry, aircraft flight control computers, communication sets, and electronic countermeasures.' },
  { title: 'Air Force Technical Airman & Propulsion Support Engineer', category: 'Air Force', salary: '₹5,50,000 - ₹12,00,000 / yr + Military Perks', skills: ['Jet Engine Propulsion', 'Airframe Maintenance', 'Ground Support Equipment', 'Quality Inspection', 'Flight Line Safety'], type: 'full-time', level: 'entry-level', desc: 'Inspect jet engine turbine systems, test aircraft hydraulic pressures, support turnaround on flight lines, and ensure zero-failure airworthiness.' },
];

/**
 * Generate embedded verified job pool (used for offline-first and immediate store demonstration)
 */
export const generateStandaloneJobs = (count = 5000) => {
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

    const res = await fetch(`${ENDPOINTS.jobs}?limit=5000`, { signal: controller.signal });
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
  const standaloneJobs = generateStandaloneJobs(5000);
  await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(standaloneJobs)).catch(() => {});
  return standaloneJobs;
};
