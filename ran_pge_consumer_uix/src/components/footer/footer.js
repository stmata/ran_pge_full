/**
 * Imports accreditation logos and SKEMA Business School logo.
 */
import aacsb from './img-footer/accreditation-aacsb.png'
import logo_left from './img-footer/skema-footer-logo-left.png'
import equis from './img-footer/accreditation-equis.png'
import amba from './img-footer/accreditation-amba.png'
import EESPIG from './img-footer/logo_EESPIG_noiretblanc.png'
import cefdg from './img-footer/logo_CEFDG_noir.png'
import cge from './img-footer/accreditation-cge.png'
import cdefm from './img-footer/Logo-CDEFM-Oct.2021-Noir-Responsive-CP.png'

/**
 * Footer component that displays essential information and links at the bottom of the application.
 * It includes details about SKEMA Business School, subscription options for newsletters,
 * various links such as sitemap, legal information, and contacts, and accreditation logos.
 *
 * @returns {JSX.Element} The Footer component.
 */

const Footer = () => {
  /**
   * Handles the subscription button click event and redirects the user to the subscription page.
   */
  const handleSubscription = () => {
    window.location.assign('https://www.skema-bs.fr/skema/s-abonner-a-nos-newsletters');
  }
  return (
    <footer className="sk-footer">
      <div className="sk-footer-content">
        <div className="sk-footer-section">
          <h1>SKEMA Business School</h1>
          <p>Global BBA, ESDHEM, Programme Grande Ecole, Mastère Spécialisé®, Masters of Science, Formation Continue, Executive MBA, Doctorat, Ph.D/DBA...</p>
        </div>
        <div className="sk-footer-section">
          <button onClick={handleSubscription} className='btn-subscription'>ABONNEZ-VOUS À NOS NEWSLETTERS</button>
        </div>
        <div className="sk-footer-section links-logos">
            <div className="sk-footer-links">
                <a href="https://www.skema.edu/sitemaps">Site map |</a>
                <a href="https://global-experience.skema.edu">SKEMA Global Experience |</a>
                <a href="https://www.skema.edu/legal-informations">Legal informations |</a>
                <a href="https://www.skema.edu/skema/purchase-contact">Purchasing SKEMA |</a>
                <a href="https://publications.skema.edu/books/hotx/#p=1">Sustainable procurement charter |</a>
                <a href="https://www.skema.edu/skema/access-and-contacts">Contacts and access |</a>
                <p>Settings of cookies |</p>
                <p>© SKEMA 2020</p>
            </div>
            <div className="sk-footer-logos">
                <a href="https://www.skema.edu" alt="SKEMA">
                    <img src={logo_left} alt='' /></a>
                <a href="https://www.aacsb.edu/" alt="aacsb" target="_blank" rel="noreferrer noopener">
                    <img src={aacsb} alt=''/></a>
                <a href="https://efmdglobal.org/accreditations/business-schools/equis/" alt="equis" target="_blank" rel="noreferrer noopener">
                    <img src={equis} className="other-logo-smaller" alt=''/></a>
                <a href="https://efmdglobal.org/accreditations/business-schools/efmd-accredited/" alt="efmd" target="_blank" rel="noreferrer noopener">
                    <img src={amba} className="other-logo-smaller" alt=''/></a>
                <a href="https://www.enseignementsup-recherche.gouv.fr/fr/la-qualification-d-etablissement-d-enseignement-superieur-prive-d-interet-general-eespig-46277" alt="EESPIG" target="_blank" rel="noreferrer noopener">
                    <img src={EESPIG} alt='' /></a>
                <a href="https://www.cefdg.fr/" alt="CEFDG" target="_blank" rel="noreferrer noopener">
                    <img src={cefdg} style={{ height: '15px', paddingBottom: '15px' }} id="logo-CEFDG" alt=''/></a>
                <a href="https://www.cge.asso.fr/" alt="cge" target="_blank" rel="noreferrer noopener">
                    <img src={cge} alt=''/></a>
                <a href="https://www.linkedin.com/company/cdefm/" alt="CDEFM" target="_blank" rel="noreferrer noopener">
                    <img src={cdefm} style={{ height: '48px'}} alt=''/></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
