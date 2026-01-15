import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import ccpqLogo from '@/assets/ccpq-logo-new.png';
import accreditationBadge from '@/assets/ccpq-accreditation.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-custom py-12 md:py-16">
        {/* Accreditation Badge */}
        <div className="flex justify-end mb-8">
          <img 
            src={accreditationBadge} 
            alt="CPD Quality Standards, QCTO, and Central Supplier Database Accreditation" 
            className="h-16 md:h-20 w-auto bg-white rounded-lg p-2"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="space-y-4">
            <img src={ccpqLogo} alt="CCPQ Logo" className="h-12 w-auto bg-white rounded-lg p-1" />
            <p className="text-sm text-primary-foreground/80">
              Centre for Certified Professional Qualifications. Empowering your future through accessible online learning.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/share/1JxAKx3L8T/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/ccpqofficial" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/why-study-with-us" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Why Study With Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Course Categories */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses?category=business-management" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Business & Management
                </Link>
              </li>
              <li>
                <Link to="/courses?category=hr-administration" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  HR & Administration
                </Link>
              </li>
              <li>
                <Link to="/courses?category=it-technology" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  IT & Technology
                </Link>
              </li>
              <li>
                <Link to="/courses?category=healthcare-support" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Healthcare & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-accent mt-0.5" />
                <span className="text-sm text-primary-foreground/80">info@ccpq.co.za</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-accent mt-0.5" />
                <span className="text-sm text-primary-foreground/80">011 326 1474</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent mt-0.5" />
                <span className="text-sm text-primary-foreground/80">Johannesburg, South Africa</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {currentYear} CCPQ. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}