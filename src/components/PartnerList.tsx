import type { Partner } from "@/types";

interface PartnerListProps {
  partners: Partner[];
  onEdit: (partner: Partner) => void;
  onDelete: (id: string) => void;
}

export default function PartnerList({ partners, onEdit, onDelete }: PartnerListProps) {
  if (partners.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--muted)] mb-6">
          <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">No partners</h3>
        <p className="text-sm text-[var(--text-secondary)]">Add your first partner to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {partners.map((partner, index) => (
        <div
          key={partner.id}
          className="list-item group rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-base font-semibold text-[var(--foreground)] truncate">{partner.naziv}</h3>
                {partner.ddvZavezanec && <span className="badge-dark">VAT</span>}
                <span className="badge">{partner.rokPlacila} days</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-1">Address</p>
                  <p className="text-[var(--foreground)] opacity-80">{partner.ulica}</p>
                  <p className="text-[var(--foreground)] opacity-80">
                    {partner.postnaSt} {partner.kraj}
                  </p>
                  {partner.poljubenNaslov && (
                    <p className="text-[var(--text-secondary)] text-xs mt-1 italic">
                      Invoice: {partner.poljubenNaslov}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-1">Contact</p>
                  {partner.telefon && <p className="text-[var(--foreground)] opacity-80">{partner.telefon}</p>}
                  {partner.ePosta && <p className="text-[var(--foreground)] opacity-80">{partner.ePosta}</p>}
                  {partner.spletnastran && (
                    <p className="text-[var(--text-secondary)] text-xs mt-1 truncate">{partner.spletnastran}</p>
                  )}
                </div>
                <div>
                  {partner.davcnaSt && (
                    <>
                      <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-1">Tax Number</p>
                      <p className="text-[var(--foreground)] opacity-80">{partner.davcnaSt}</p>
                    </>
                  )}
                  {partner.eRacunNaslov && (
                    <div className="mt-2">
                      <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-1">e-Invoice</p>
                      <p className="text-[var(--foreground)] opacity-80 text-xs">{partner.eRacunNaslov}</p>
                      {partner.eRacunId && (
                        <p className="text-[var(--text-secondary)] text-xs">ID: {partner.eRacunId}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {partner.opombe && <p className="mt-4 text-sm text-[var(--text-secondary)] italic">{partner.opombe}</p>}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center gap-3">
            <button
              onClick={() => onEdit(partner)}
              className="btn-ghost text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(partner.id)}
              className="btn-ghost text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
