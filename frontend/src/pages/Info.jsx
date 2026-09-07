import { Link } from 'react-router-dom'
import { Page, Panel } from '../components/ui'
import { useLang } from '../context/LangContext'

const PAGES = {
  about: {
    en: {
      title: 'About',
      body: 'Kisan Direct (PS SIH26033) is a national farm-to-consumer marketplace concept for the Ministry of Consumer Affairs, Food & Public Distribution. It enables farmers and FPOs to list produce at a transparent direct price, referenced against Agmarknet mandi rates.',
    },
    hi: {
      title: 'परिचय',
      body: 'किसान डायरेक्ट (PS SIH26033) उपभोक्ता मामले, खाद्य एवं सार्वजनिक वितरण मंत्रालय के लिए एक राष्ट्रीय किसान-से-उपभोक्ता बाज़ार है।',
    },
  },
  privacy: {
    en: {
      title: 'Privacy Policy',
      body: 'Mobile numbers collected for OTP login are processed only for authentication. Transaction records are retained for audit. No personal data is sold. This demonstration build stores session language preference in the browser.',
    },
    hi: {
      title: 'गोपनीयता नीति',
      body: 'ओटीपी लॉगिन के लिए एकत्र मोबाइल नंबर केवल प्रमाणीकरण हेतु उपयोग होते हैं।',
    },
  },
  rti: {
    en: {
      title: 'Right to Information',
      body: 'Applications under the RTI Act, 2005 may be addressed to the Central Public Information Officer, Department of Consumer Affairs, Krishi Bhawan, New Delhi. This portal is a Smart India Hackathon demonstration.',
    },
    hi: {
      title: 'सूचना का अधिकार',
      body: 'आरटीआई आवेदन केंद्रीय लोक सूचना अधिकारी, उपभोक्ता मामले विभाग, कृषि भवन, नई दिल्ली को भेजे जा सकते हैं।',
    },
  },
  grievance: {
    en: {
      title: 'Public Grievance',
      body: 'Register a grievance through CPGRAMS or the Contact page. For marketplace disputes, use the Admin MIS Disputes tab after login as an authorised officer.',
    },
    hi: {
      title: 'शिकायत',
      body: 'शिकायत CPGRAMS या संपर्क पृष्ठ के माध्यम से दर्ज करें।',
    },
  },
  contact: {
    en: {
      title: 'Contact',
      body: 'Helpdesk (demo): support@kisandirect.gov.in · Toll-free: 1800-XXX-XXXX · Department of Consumer Affairs, Krishi Bhawan, New Delhi.',
    },
    hi: {
      title: 'संपर्क',
      body: 'हेल्पडेस्क (डेमो): support@kisandirect.gov.in · कृषि भवन, नई दिल्ली।',
    },
  },
}

export function InfoPage({ id }) {
  const { lang, t } = useLang()
  const page = PAGES[id][lang] || PAGES[id].en
  return (
    <Page title={page.title}>
      <Panel title={page.title}>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-700">{page.body}</p>
      </Panel>
    </Page>
  )
}

export function SitemapPage() {
  const { t } = useLang()
  const links = [
    ['/', t.home],
    ['/about', t.about],
    ['/marketplace', t.marketplace],
    ['/dashboard', t.dashboard],
    ['/admin', t.admin],
    ['/privacy', t.privacy],
    ['/rti', t.rti],
    ['/grievance', t.grievance],
    ['/contact', t.contact],
  ]
  return (
    <Page title={t.sitemap}>
      <Panel title={t.sitemap}>
        <ul className="columns-1 gap-2 text-sm sm:columns-2">
          {links.map(([to, label]) => (
            <li key={to} className="mb-2">
              <Link className="text-navy underline" to={to}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </Page>
  )
}
