import { Award, BadgeCheck, Building2, Coins } from 'lucide-react';
import qctoLogo from '@/assets/qcto-logo.png';
import csdLogo from '@/assets/csd-logo.png';
import cpdLogo from '@/assets/cpd-logo.png';

export function AccreditationSection() {
  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30">
              <Coins className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Skills Development Levy</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
              Study with us and claim back from the{' '}
              <span className="text-accent">Skills Development Levy (SDL)</span>
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">CPD Accredited</h3>
                  <p className="text-primary-foreground/80">
                    All our courses are eligible for CPD credits, helping you maintain and enhance your professional competence.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">British Standards Authority</h3>
                  <p className="text-primary-foreground/80">
                    We are accredited by the British Standards Authority, ensuring our courses meet international quality standards.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <BadgeCheck className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">QCTO Accredited</h3>
                  <p className="text-primary-foreground/80">
                    Selected courses are also accredited by the Quality Council for Trades and Occupations (QCTO).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logos */}
          <div className="relative">
            <div className="bg-card/10 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/10">
              <div className="flex flex-col gap-8 items-center">
                <img
                  src={qctoLogo}
                  alt="QCTO - Quality Council for Trades and Occupations"
                  className="h-16 md:h-20 w-auto object-contain"
                />
                <img
                  src={csdLogo}
                  alt="Central Supplier Database for Government"
                  className="h-12 md:h-16 w-auto object-contain"
                />
                <img
                  src={cpdLogo}
                  alt="CPD Quality Standards"
                  className="h-12 md:h-16 w-auto object-contain"
                />
              </div>
              <div className="mt-6 text-center">
                <p className="text-lg font-semibold text-accent">Internationally Recognized</p>
                <p className="text-sm text-primary-foreground/70 mt-1">
                  Your certification is valued by employers worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
