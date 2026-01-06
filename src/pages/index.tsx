import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { authAPI, companyAPI, partnerAPI, invoiceAPI } from "@/services/api";
import type { User, Company, Partner } from "@/types";
import CompanyForm from "@/components/CompanyForm";
import CompanyList from "@/components/CompanyList";
import CompanyProducts from "@/components/CompanyProducts";
import PartnerForm from "@/components/PartnerForm";
import PartnerList from "@/components/PartnerList";
import InvoiceForm from "@/components/InvoiceForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import Layout from "@/components/Layout";

type TabType = "invoice" | "companies" | "partners";

interface Invoice {
  id: string;
  invoice_number: string;
  company_name: string;
  partner_name: string;
  issue_date: string;
  due_date: string;
  total: number;
  status: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("invoice");

  // Company management state
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Partner management state
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // Invoice management state
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      await Promise.all([fetchCompanies(), fetchPartners(), fetchInvoices()]);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await companyAPI.getAll();
      setCompanies(data);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  const fetchPartners = async () => {
    try {
      const data = await partnerAPI.getAll();
      setPartners(data);
    } catch (error) {
      console.error("Failed to fetch partners:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const data = await invoiceAPI.getAll();
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAddCompany = () => {
    setEditingCompany(null);
    setShowForm(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleDeleteCompany = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Company",
      message: "Are you sure you want to delete this company? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await companyAPI.delete(id);
          await fetchCompanies();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          console.error("Failed to delete company:", error);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
  };

  const handleManageProducts = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingCompany(null);
    await fetchCompanies();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCompany(null);
  };

  const handleAddPartner = () => {
    setEditingPartner(null);
    setShowPartnerForm(true);
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setShowPartnerForm(true);
  };

  const handleDeletePartner = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Partner",
      message: "Are you sure you want to delete this partner? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await partnerAPI.delete(id);
          await fetchPartners();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          console.error("Failed to delete partner:", error);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
  };

  const handlePartnerFormSuccess = async () => {
    setShowPartnerForm(false);
    setEditingPartner(null);
    await fetchPartners();
  };

  const handlePartnerFormCancel = () => {
    setShowPartnerForm(false);
    setEditingPartner(null);
  };

  const handleInvoiceFormCancel = () => {
    setShowInvoiceForm(false);
    setEditingInvoice(null);
  };

  const handleEditInvoice = async (invoice: Invoice) => {
    try {
      setLoading(true);
      // Fetch full invoice details with all lines
      const fullInvoice = await invoiceAPI.getById(invoice.id);
      setEditingInvoice(fullInvoice);
      setShowInvoiceForm(true);
    } catch (err) {
      console.error("Failed to fetch invoice details:", err);
      alert("Failed to load invoice details");
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceSuccess = () => {
    fetchInvoices();
  };

  const handlePartnerCreatedFromInvoice = (newPartner: Partner) => {
    setPartners((prev) => [...prev, newPartner]);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen bg-[var(--background)]">
          <div className="text-sm text-[var(--text-secondary)]">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--background)]">
        {/* Header */}
        <header className="border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-ghost text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("invoice")}
                className={`relative py-4 text-sm font-medium transition-all duration-300 ${
                  activeTab === "invoice"
                    ? "text-[var(--foreground)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                }`}
              >
                Invoice
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--foreground)] transition-transform duration-300 origin-left ${
                    activeTab === "invoice" ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
              <button
                onClick={() => setActiveTab("companies")}
                className={`relative py-4 text-sm font-medium transition-all duration-300 ${
                  activeTab === "companies"
                    ? "text-[var(--foreground)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                }`}
              >
                Companies
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--foreground)] transition-transform duration-300 origin-left ${
                    activeTab === "companies" ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
              <button
                onClick={() => setActiveTab("partners")}
                className={`relative py-4 text-sm font-medium transition-all duration-300 ${
                  activeTab === "partners"
                    ? "text-[var(--foreground)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                }`}
              >
                Partners
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--foreground)] transition-transform duration-300 origin-left ${
                    activeTab === "partners" ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-6xl mx-auto px-6 py-12 page-content">
          {/* Invoice Tab */}
          {activeTab === "invoice" && (
            <div className="animate-slideUp space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Invoices</h2>
                {!showInvoiceForm && (
                  <button onClick={() => setShowInvoiceForm(true)} className="btn-primary">
                    New Invoice
                  </button>
                )}
              </div>

              {showInvoiceForm ? (
                <div className="card animate-scaleIn">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
                    {editingInvoice ? "Edit Invoice" : "Create Invoice"}
                  </h3>
                  <InvoiceForm
                    companies={companies}
                    partners={partners}
                    user={user}
                    editingInvoice={editingInvoice}
                    onCancel={handleInvoiceFormCancel}
                    onPartnerCreated={handlePartnerCreatedFromInvoice}
                    onSuccess={handleInvoiceSuccess}
                  />
                </div>
              ) : (
                <>
                  {invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed">
                        <thead>
                          <tr className="border-b border-[var(--border)]">
                            <th className="text-left px-4 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap w-32">
                              Invoice #
                            </th>
                            <th className="text-left px-4 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                              Company
                            </th>
                            <th className="text-left px-4 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                              Partner
                            </th>
                            <th className="text-left px-4 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap w-32">
                              Issue Date
                            </th>
                            <th className="text-left px-4 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap w-32">
                              Due Date
                            </th>
                            <th className="text-right px-4 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap w-32">
                              Total
                            </th>
                            <th className="text-left px-4 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap w-28">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {invoices.map((invoice) => (
                            <tr
                              key={invoice.id}
                              onClick={() => router.push(`/invoices/${invoice.id}`)}
                              className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 active:bg-gray-100/80 dark:active:bg-gray-700/50 transition-all duration-200 ease-out cursor-pointer group"
                            >
                              <td className="px-4 py-5 text-sm font-medium text-[var(--foreground)] whitespace-nowrap group-hover:text-[var(--primary)] transition-colors">
                                {invoice.invoice_number}
                              </td>
                              <td
                                className="px-4 py-5 text-sm text-[var(--foreground)] truncate"
                                title={invoice.company_name}
                              >
                                {invoice.company_name}
                              </td>
                              <td
                                className="px-4 py-5 text-sm text-[var(--foreground)] truncate"
                                title={invoice.partner_name}
                              >
                                {invoice.partner_name}
                              </td>
                              <td className="px-4 py-5 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                                {new Date(invoice.issue_date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-5 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                                {new Date(invoice.due_date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-5 text-sm font-medium text-[var(--foreground)] text-right whitespace-nowrap">
                                €{Number(invoice.total).toFixed(2)}
                              </td>
                              <td className="px-4 py-5 text-sm">
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                    invoice.status === "PAID"
                                      ? "bg-green-100 text-green-700"
                                      : invoice.status === "CANCELLED"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {invoice.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-24">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--muted)] mb-6">
                        <svg
                          className="w-8 h-8 text-[var(--text-secondary)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">No invoices yet</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Create your first invoice to get started</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Companies Tab */}
          {activeTab === "companies" && (
            <div className="animate-slideUp space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Companies</h2>
                {!showForm && (
                  <button onClick={handleAddCompany} className="btn-primary">
                    Add Company
                  </button>
                )}
              </div>

              {showForm ? (
                <div className="card animate-scaleIn">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
                    {editingCompany ? "Edit Company" : "New Company"}
                  </h3>
                  <CompanyForm company={editingCompany} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
                </div>
              ) : (
                <CompanyList
                  companies={companies}
                  onEdit={handleEditCompany}
                  onDelete={handleDeleteCompany}
                  onManageProducts={handleManageProducts}
                />
              )}
            </div>
          )}

          {/* Partners Tab */}
          {activeTab === "partners" && (
            <div className="animate-slideUp space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Partners</h2>
                {!showPartnerForm && (
                  <button onClick={handleAddPartner} className="btn-primary">
                    Add Partner
                  </button>
                )}
              </div>

              {showPartnerForm ? (
                <div className="card animate-scaleIn">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
                    {editingPartner ? "Edit Partner" : "New Partner"}
                  </h3>
                  <PartnerForm
                    partner={editingPartner}
                    onSuccess={handlePartnerFormSuccess}
                    onCancel={handlePartnerFormCancel}
                  />
                </div>
              ) : (
                <PartnerList partners={partners} onEdit={handleEditPartner} onDelete={handleDeletePartner} />
              )}
            </div>
          )}
        </main>

        {/* Product Management Modal */}
        {selectedCompany && <CompanyProducts company={selectedCompany} onClose={() => setSelectedCompany(null)} />}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="Delete"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          type="danger"
        />
      </div>
    </Layout>
  );
}
