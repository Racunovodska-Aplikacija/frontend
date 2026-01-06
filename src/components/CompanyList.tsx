import type { Company } from "@/types";

interface CompanyListProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  onManageProducts: (company: Company) => void;
}

export default function CompanyList({ companies, onEdit, onDelete, onManageProducts }: CompanyListProps) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--muted)] mb-6">
          <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">No companies</h3>
        <p className="text-sm text-[var(--text-secondary)]">Add your first company to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {companies.map((company, index) => (
        <div
          key={company.id}
          className="list-item group rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-base font-semibold text-[var(--foreground)] truncate">{company.companyName}</h3>
                {company.vatPayer && <span className="badge-dark">VAT</span>}
                {company.reverseCharge && <span className="badge">RC</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-1">Address</p>
                  <p className="text-[var(--foreground)] opacity-80">{company.street}</p>
                  {company.streetAdditional && (
                    <p className="text-[var(--foreground)] opacity-80">{company.streetAdditional}</p>
                  )}
                  <p className="text-[var(--foreground)] opacity-80">
                    {company.postalCode} {company.city}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-1">Registration</p>
                  <p className="text-[var(--foreground)] opacity-80">{company.registrationNumber}</p>
                  {company.vatId && <p className="text-[var(--text-secondary)] text-xs mt-1">VAT: {company.vatId}</p>}
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-1">Banking</p>
                  <p className="text-[var(--foreground)] opacity-80 font-mono text-xs">{company.iban}</p>
                  <p className="text-[var(--text-secondary)] text-xs mt-1">{company.bic}</p>
                </div>
              </div>

              {company.additionalInfo && (
                <p className="mt-4 text-sm text-[var(--text-secondary)] italic">{company.additionalInfo}</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center gap-3">
            <button onClick={() => onManageProducts(company)} className="btn-primary text-sm py-2 px-4">
              Products
            </button>
            <button
              onClick={() => onEdit(company)}
              className="btn-ghost text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(company.id)}
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
