import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { authAPI, invoiceAPI, companyAPI, partnerAPI } from "@/services/api";
import type { Invoice, Company, Partner } from "@/types";
import Layout from "@/components/Layout";
import InvoiceForm from "@/components/InvoiceForm";
import { get } from "http";

const getApiUrl = () => {
  // Otherwise use relative path (for local development)
  return "";
};

export default function InvoiceDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingDownload, setGeneratingDownload] = useState(false);
  const [generatingView, setGeneratingView] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchInvoice();
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      const companiesData = await companyAPI.getAll();
      const partnersData = await partnerAPI.getAll();
      setCompanies(companiesData);
      setPartners(partnersData);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const currentUser = await authAPI.getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      const data = await invoiceAPI.getById(id as string);
      setInvoice(data);
      setError("");
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!invoice) return;
    try {
      setGeneratingDownload(true);
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/invoice-pdf/pdf/${invoice.id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to generate PDF");
    } finally {
      setGeneratingDownload(false);
    }
  };

  const handleViewPDF = async () => {
    if (!invoice) return;
    try {
      setGeneratingView(true);
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/invoice-pdf/pdf/${invoice.id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Don't revoke immediately - let the new tab load first
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to generate PDF");
    } finally {
      setGeneratingView(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleEditSuccess = async () => {
    setIsEditing(false);
    await fetchInvoice();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(num);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-[var(--text-secondary)]">Loading invoice...</p>
        </div>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="text-[var(--primary)] hover:underline">
              ← Back
            </button>
          </div>
          <div className="text-center py-12">
            <p className="text-[var(--text-secondary)] mb-4">Invoice not found</p>
            <button onClick={() => router.push("/invoices")} className="btn-primary">
              Back to Invoices
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate line totals and overall total
  const calculateLineTotal = (line: any) => {
    const quantity = line.amount || 0;
    const unitPrice = line.product?.cost ? parseFloat(line.product.cost) : 0;
    const subtotal = quantity * unitPrice;
    const vatRate = line.product?.ddvPercentage ? parseFloat(line.product.ddvPercentage) : 0;
    return subtotal * (1 + vatRate / 100);
  };

  const subtotal =
    invoice.lines?.reduce((sum, line) => {
      const quantity = line.amount || 0;
      const unitPrice = line.product?.cost ? parseFloat(line.product.cost) : 0;
      return sum + quantity * unitPrice;
    }, 0) || 0;

  const vat =
    invoice.lines?.reduce((sum, line) => {
      const quantity = line.amount || 0;
      const unitPrice = line.product?.cost ? parseFloat(line.product.cost) : 0;
      const lineSubtotal = quantity * unitPrice;
      const vatRate = line.product?.ddvPercentage ? parseFloat(line.product.ddvPercentage) : 0;
      return sum + (lineSubtotal * vatRate) / 100;
    }, 0) || 0;

  const total = subtotal + vat;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto print:max-w-none print:mx-0 pt-8">
        {/* Back Button - Subtle and Natural */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors text-sm font-medium mb-8 print:hidden"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Header - Clean and Minimal */}
        <div className="mb-12 print:mb-8">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-light text-[var(--foreground)] print:text-black tracking-tight">
                Invoice {invoice.invoice_number}
              </h1>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  invoice.status === "PAID"
                    ? "bg-green-100 text-green-700"
                    : invoice.status === "CANCELLED"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {invoice.status}
              </span>
            </div>
            <div className="flex items-center gap-3 print:hidden">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-sm font-medium text-[var(--foreground)]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-300 rounded text-red-700 text-sm print:hidden mb-8">
            {error}
          </div>
        )}

        {/* Edit Form */}
        {isEditing && invoice ? (
          <div className="card animate-scaleIn mb-12">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">Edit Invoice</h3>
            <InvoiceForm
              companies={companies}
              partners={partners}
              user={user}
              editingInvoice={invoice}
              onCancel={handleEditCancel}
              onPartnerCreated={() => {}}
              onSuccess={handleEditSuccess}
            />
          </div>
        ) : (
          <>
            {/* Company & Partner Info - Elegant Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div>
                <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-4">
                  From
                </h3>
                {invoice.company ? (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-[var(--foreground)]">{invoice.company.companyName}</p>
                    <p className="text-[var(--text-secondary)]">{invoice.company.street}</p>
                    {invoice.company.streetAdditional && (
                      <p className="text-[var(--text-secondary)]">{invoice.company.streetAdditional}</p>
                    )}
                    <p className="text-[var(--text-secondary)]">
                      {invoice.company.postalCode} {invoice.company.city}
                    </p>
                    {invoice.company.iban && (
                      <p className="text-[var(--text-secondary)] text-xs">IBAN: {invoice.company.iban}</p>
                    )}
                    {invoice.company.registrationNumber && (
                      <p className="text-[var(--text-secondary)] text-xs">Reg: {invoice.company.registrationNumber}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)] text-sm">Company information not available</p>
                )}
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-4">
                  Bill To
                </h3>
                {invoice.partner ? (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-[var(--foreground)]">{invoice.partner.naziv}</p>
                    <p className="text-[var(--text-secondary)]">{invoice.partner.ulica}</p>
                    {invoice.partner.poljubenNaslov && (
                      <p className="text-[var(--text-secondary)]">{invoice.partner.poljubenNaslov}</p>
                    )}
                    <p className="text-[var(--text-secondary)]">
                      {invoice.partner.postnaSt} {invoice.partner.kraj}
                    </p>
                    {invoice.partner.telefon && (
                      <p className="text-[var(--text-secondary)] text-xs">Tel: {invoice.partner.telefon}</p>
                    )}
                    {invoice.partner.ePosta && (
                      <p className="text-[var(--text-secondary)] text-xs">Email: {invoice.partner.ePosta}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)] text-sm">Partner information not available</p>
                )}
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-4">
                  Invoice Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Issue Date</span>
                    <span className="text-[var(--foreground)]">{formatDate(invoice.issue_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Service Date</span>
                    <span className="text-[var(--foreground)]">{formatDate(invoice.service_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Due Date</span>
                    <span className="text-[var(--foreground)]">{formatDate(invoice.due_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items - Minimal Table */}
            <div className="mb-12 print:mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left px-0 py-3 text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                      Product
                    </th>
                    <th className="text-left px-0 py-3 text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                      Unit
                    </th>
                    <th className="text-right px-0 py-3 text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                      Quantity
                    </th>
                    <th className="text-right px-0 py-3 text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                      Unit Price
                    </th>
                    <th className="text-right px-0 py-3 text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                      VAT %
                    </th>
                    <th className="text-right px-0 py-3 text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {invoice.lines && invoice.lines.length > 0 ? (
                    invoice.lines.map((line, idx) => (
                      <tr key={line.id || idx} className="hover:bg-[var(--muted)]/50 transition-colors">
                        <td className="px-0 py-4 text-sm text-[var(--foreground)]">
                          {line.product?.name || "Unknown Product"}
                        </td>
                        <td className="px-0 py-4 text-sm text-[var(--text-secondary)]">
                          {line.product?.measuringUnit || "—"}
                        </td>
                        <td className="px-0 py-4 text-sm text-[var(--foreground)] text-right">{line.amount}</td>
                        <td className="px-0 py-4 text-sm text-[var(--foreground)] text-right">
                          {line.product?.cost ? formatCurrency(line.product.cost) : "—"}
                        </td>
                        <td className="px-0 py-4 text-sm text-[var(--foreground)] text-right">
                          {line.product?.ddvPercentage || "0"}%
                        </td>
                        <td className="px-0 py-4 text-sm font-medium text-[var(--foreground)] text-right">
                          {formatCurrency(calculateLineTotal(line))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-0 py-4 text-center text-[var(--text-secondary)]">
                        No line items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals - Elegant Minimal */}
            <div className="flex justify-end mb-12">
              <div className="w-80 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Subtotal</span>
                  <span className="text-[var(--foreground)]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">VAT</span>
                  <span className="text-[var(--foreground)]">{formatCurrency(vat)}</span>
                </div>
                <div className="border-t border-[var(--border)] pt-3 flex justify-between">
                  <span className="text-[var(--foreground)] font-medium">Total</span>
                  <span className="text-xl font-light text-[var(--foreground)]">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-12">
                <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-3">
                  Notes
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </div>
            )}
          </>
        )}

        {/* Generate PDF Button - Bottom Action */}
        <div className="py-8 border-t border-[var(--border)] print:hidden">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleViewPDF}
              disabled={generatingView}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-sm font-medium text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingView ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View PDF
                </>
              )}
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={generatingDownload}
              className="inline-flex items-center gap-2 btn-primary disabled:opacity-50"
            >
              {generatingDownload ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
