import { useState, useEffect } from "react";
import type { Company, Partner, InvoiceFormData, InvoiceItem, Product } from "@/types";
import { invoiceAPI, partnerAPI, productAPI } from "@/services/api";
import PartnerForm from "./PartnerForm";

interface InvoiceFormProps {
  companies: Company[];
  partners: Partner[];
  user: any;
  editingInvoice?: any;
  onCancel: () => void;
  onPartnerCreated?: (partner: Partner) => void;
  onSuccess?: () => void;
}

export default function InvoiceForm({
  companies,
  partners,
  user,
  editingInvoice,
  onCancel,
  onPartnerCreated,
  onSuccess,
}: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    companyId: "",
    partnerId: "",
    invoiceNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    serviceDate: new Date().toISOString().split("T")[0],
    items: [],
    notes: "",
  });

  const [currentItem, setCurrentItem] = useState<Partial<InvoiceItem>>({
    productId: "",
    description: "",
    quantity: undefined,
    unit: "",
    unitPrice: undefined,
    vatRate: 22,
  });

  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnersList, setPartnersList] = useState<Partner[]>(partners);
  const [products, setProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]); // Track products added during invoice creation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomUnit, setShowCustomUnit] = useState(false);
  const [customVAT, setCustomVAT] = useState<number>(0);
  const [showCustomVAT, setShowCustomVAT] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Load editing invoice data
  useEffect(() => {
    if (editingInvoice) {
      setFormData({
        companyId: editingInvoice.company_id || "",
        partnerId: editingInvoice.partner_id || "",
        invoiceNumber: editingInvoice.invoice_number || "",
        issueDate: editingInvoice.issue_date ? new Date(editingInvoice.issue_date).toISOString().split("T")[0] : "",
        dueDate: editingInvoice.due_date ? new Date(editingInvoice.due_date).toISOString().split("T")[0] : "",
        serviceDate: editingInvoice.service_date
          ? new Date(editingInvoice.service_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        items:
          editingInvoice.lines?.map((line: any, index: number) => ({
            id: `${index}`,
            productId: line.product_id,
            description: line.product?.name || "",
            quantity: line.amount || 0,
            unit: line.product?.measuringUnit || "",
            unitPrice: parseFloat(line.product?.cost || "0"),
            vatRate: parseFloat(line.product?.ddvPercentage || "22"),
            amount: (line.amount || 0) * parseFloat(line.product?.cost || "0"),
          })) || [],
        notes: editingInvoice.notes || "",
      });
    }
  }, [editingInvoice]);

  // Generate the next invoice number when component mounts (only for new invoices)
  useEffect(() => {
    if (editingInvoice) return;

    const generateNextInvoiceNumber = async () => {
      try {
        const allInvoices = await invoiceAPI.getAll();
        const year = new Date().getFullYear().toString().slice(2);

        if (allInvoices.length === 0) {
          // No invoices yet, start with first one
          setFormData((prev) => ({ ...prev, invoiceNumber: `${year}-0001` }));
          return;
        }

        // Extract all invoice numbers for current year
        const currentYearInvoices = allInvoices
          .map((inv) => inv.invoice_number)
          .filter((num) => num && num.startsWith(`${year}-`));

        if (currentYearInvoices.length === 0) {
          // No invoices for current year, start with first one
          setFormData((prev) => ({ ...prev, invoiceNumber: `${year}-0001` }));
          return;
        }

        // Find the highest number
        const numbers = currentYearInvoices.map((num) => parseInt(num.split("-")[1])).filter((num) => !isNaN(num));

        const maxNumber = Math.max(...numbers);
        const nextNumber = (maxNumber + 1).toString().padStart(4, "0");
        setFormData((prev) => ({ ...prev, invoiceNumber: `${year}-${nextNumber}` }));
      } catch (err) {
        console.error("Failed to generate invoice number:", err);
        // Fallback to default
        const year = new Date().getFullYear().toString().slice(2);
        setFormData((prev) => ({ ...prev, invoiceNumber: `${year}-0001` }));
      }
    };

    generateNextInvoiceNumber();
  }, [editingInvoice]);

  // Auto-select company if there's only one
  useEffect(() => {
    if (companies.length === 1 && !formData.companyId) {
      setFormData((prev) => ({ ...prev, companyId: companies[0].id }));
    }
  }, [companies, formData.companyId]);

  // Fetch products when company is selected
  useEffect(() => {
    const fetchProducts = async () => {
      if (formData.companyId) {
        try {
          const companyProducts = await productAPI.getAllByCompany(formData.companyId);
          setProducts(companyProducts);
        } catch (err) {
          console.error("Failed to fetch products:", err);
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    };

    fetchProducts();
  }, [formData.companyId]);

  // Update partners list when prop changes
  useEffect(() => {
    setPartnersList(partners);
  }, [partners]);

  const handlePartnerCreated = (newPartner?: Partner) => {
    // If a new partner is provided, add it to the local list and select it
    if (newPartner) {
      setPartnersList((prev) => [...prev, newPartner]);
      setFormData((prev) => ({ ...prev, partnerId: newPartner.id }));
      // Notify parent about the new partner
      if (onPartnerCreated) {
        onPartnerCreated(newPartner);
      }
    }
    setShowPartnerModal(false);
  };

  const handleAddItem = () => {
    if (!currentItem.description || !currentItem.quantity || !currentItem.unitPrice) {
      return;
    }

    const amount = currentItem.quantity * currentItem.unitPrice;
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productId: (currentItem.productId as string) || undefined,
      description: currentItem.description,
      quantity: currentItem.quantity,
      unit: currentItem.unit,
      unitPrice: currentItem.unitPrice,
      vatRate: currentItem.vatRate || 22,
      amount,
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });

    setCurrentItem({
      productId: "",
      description: "",
      quantity: 1,
      unit: "",
      unitPrice: 0,
      vatRate: 22,
    });
    setShowCustomUnit(false);
    setCustomVAT(0);
    setShowCustomVAT(false);
  };

  const handleRemoveItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== id),
    });
  };

  const handleCustomUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentItem({ ...currentItem, unit: value });
  };

  const handleCustomVATChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCustomVAT(value);
    setCurrentItem({ ...currentItem, vatRate: value });
  };

  const handleUnitSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "other") {
      setShowCustomUnit(true);
      // Don't change currentItem.unit when switching to custom
    } else {
      setShowCustomUnit(false);
      setCurrentItem({ ...currentItem, unit: value });
    }
  };

  const handleVATSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "other") {
      setShowCustomVAT(true);
      setCurrentItem({ ...currentItem, vatRate: customVAT });
    } else {
      setShowCustomVAT(false);
      setCurrentItem({ ...currentItem, vatRate: parseFloat(value) });
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const vatAmount = formData.items.reduce((sum, item) => {
      return sum + (item.amount * item.vatRate) / 100;
    }, 0);
    const total = subtotal + vatAmount;

    return { subtotal, vatAmount, total };
  };

  // Get filtered products based on search
  const allProducts = [...products, ...newProducts];
  const filteredProducts = productSearch.trim()
    ? allProducts.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    : allProducts;

  // Check if search term matches an existing product exactly
  const exactMatch = allProducts.find((p) => p.name.toLowerCase() === productSearch.toLowerCase());

  // Check if we can create a new product from search term
  const canCreateNewProduct = productSearch.trim() && !exactMatch;

  const handleSelectProduct = (product: Product) => {
    setCurrentItem({
      ...currentItem,
      productId: product.id,
      description: product.name,
      unit: product.measuringUnit,
      unitPrice: Number(product.cost),
      vatRate: Number(product.ddvPercentage),
    });
    setProductSearch(product.name);
    setShowProductDropdown(false);
  };

  const handleCreateProductFromSearch = () => {
    if (!productSearch.trim()) return;

    // Create a temporary product that will be saved later
    const tempProduct: Product = {
      id: `temp-${Date.now()}`,
      companyId: formData.companyId,
      name: productSearch,
      cost: currentItem.unitPrice || 0,
      measuringUnit: "unit",
      ddvPercentage: currentItem.vatRate || 22,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNewProducts([...newProducts, tempProduct]);
    handleSelectProduct(tempProduct);
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Validate form
      if (!formData.companyId || !formData.partnerId || formData.items.length === 0) {
        setError("Please fill in all required fields and add at least one item");
        setLoading(false);
        return;
      }

      // Get company and partner names
      const selectedCompany = companies.find((c) => c.id === formData.companyId);
      const selectedPartner = partnersList.find((p) => p.id === formData.partnerId);

      if (!selectedCompany || !selectedPartner) {
        setError("Invalid company or partner selected");
        setLoading(false);
        return;
      }

      // Save any new products that were created
      const savedProductMap = new Map<string, string>(); // Map temp IDs to real IDs
      for (const newProduct of newProducts) {
        if (newProduct.id.startsWith("temp-")) {
          try {
            const savedProduct = await productAPI.create(formData.companyId, {
              name: newProduct.name,
              cost: newProduct.cost,
              measuringUnit: newProduct.measuringUnit,
              ddvPercentage: newProduct.ddvPercentage,
            });
            savedProductMap.set(newProduct.id, savedProduct.id);
          } catch (err) {
            console.error("Failed to create product:", err);
            // Continue anyway - products might already exist
          }
        }
      }

      // Update invoice items with real product IDs
      const invoiceItems = formData.items
        .map((item) => {
          const productId =
            item.productId && item.productId.startsWith("temp-") ? savedProductMap.get(item.productId) : item.productId;
          return productId
            ? {
                productId,
                quantity: item.quantity,
              }
            : null;
        })
        .filter((item): item is { productId: string; quantity: number } => item !== null);

      // Create invoice via API
      await invoiceAPI.create({
        companyId: formData.companyId,
        partnerId: formData.partnerId,
        invoiceNumber: formData.invoiceNumber,
        issueDate: formData.issueDate,
        serviceDate: formData.serviceDate,
        dueDate: formData.dueDate,
        items: invoiceItems,
        notes: formData.notes,
      });

      // Success - show message and close after a short delay
      setSuccess(editingInvoice ? "Invoice updated successfully!" : "Invoice created successfully!");
      setLoading(false);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onCancel();
      }, 1500);
    } catch (err: any) {
      console.error(editingInvoice ? "Failed to update invoice:" : "Failed to create invoice:", err);
      setError(
        err.response?.data?.message || (editingInvoice ? "Failed to update invoice" : "Failed to create invoice")
      );
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            {success}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Your Company</label>
            <select
              required
              className="input-field"
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
            >
              <option value="">Select company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.companyName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Partner (Client)</label>
            <div className="flex gap-2">
              <select
                required
                className="input-field flex-1"
                value={formData.partnerId}
                onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
              >
                <option value="">Select partner</option>
                {partnersList.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.naziv}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPartnerModal(true);
                }}
                className="px-4 py-2 bg-[var(--foreground)] text-white rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
                title="Create new partner"
              >
                + New
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Invoice Number</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="26-0001"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Issue Date</label>
            <input
              type="date"
              required
              className="input-field"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Service Date</label>
            <input
              type="date"
              required
              className="input-field"
              value={formData.serviceDate}
              onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Due Date</label>
            <input
              type="date"
              required
              className="input-field"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
        </div>

        <div className="divider my-8"></div>

        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">Invoice Items</h3>

          <div className="space-y-3 mb-4">
            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-2 mb-1">
              <div className="col-span-3 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Product
              </div>
              <div className="col-span-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Qty
              </div>
              <div className="col-span-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Unit
              </div>
              <div className="col-span-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Unit Price
              </div>
              <div className="col-span-2 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                VAT
              </div>
              <div className="col-span-1"></div>
            </div>

            {/* Input Row */}
            <div className="grid grid-cols-12 gap-2 relative">
              <div className="col-span-3 relative">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search or type product..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  autoComplete="off"
                />

                {/* Product Dropdown */}
                {showProductDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--border)] rounded-xl shadow-lg max-h-64 overflow-y-auto z-20">
                    {filteredProducts.length > 0 ? (
                      <>
                        {filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleSelectProduct(product)}
                            className="w-full px-4 py-2 text-left hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)] last:border-b-0 focus:outline-none"
                          >
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-[var(--text-secondary)]">
                              €{Number(product.cost).toFixed(2)} • {product.measuringUnit} •{" "}
                              {Number(product.ddvPercentage)}% VAT
                            </div>
                          </button>
                        ))}
                      </>
                    ) : null}

                    {/* Create New Product Option */}
                    {canCreateNewProduct && (
                      <button
                        type="button"
                        onClick={handleCreateProductFromSearch}
                        className="w-full px-4 py-3 text-left hover:bg-[var(--muted)] transition-colors border-t border-[var(--border)] focus:outline-none"
                      >
                        <div className="font-medium text-sm text-[var(--foreground)]">
                          + Create new: "{productSearch}"
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">Will be saved with the invoice</div>
                      </button>
                    )}

                    {/* No results and can't create */}
                    {filteredProducts.length === 0 && !canCreateNewProduct && (
                      <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">No products found</div>
                    )}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="input-field"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) })}
                />
              </div>
              <div className="col-span-2">
                <select
                  className="input-field"
                  value={showCustomUnit ? "other" : currentItem.unit}
                  onChange={handleUnitSelectChange}
                >
                  <option value="">Select</option>
                  <option value="kom">Piece</option>
                  <option value="kg">kg</option>
                  <option value="l">Liter</option>
                  <option value="m">Meter</option>
                  <option value="m2">m²</option>
                  <option value="h">Hour</option>
                  <option value="other">Other</option>
                </select>
                {showCustomUnit && (
                  <input
                    type="text"
                    value={currentItem.unit || ""}
                    onChange={handleCustomUnitChange}
                    placeholder="Custom unit"
                    className="input-field mt-1"
                  />
                )}
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field"
                  value={currentItem.unitPrice}
                  onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) })}
                />
              </div>
              <div className="col-span-2">
                <select
                  className="input-field"
                  value={showCustomVAT ? "other" : currentItem.vatRate}
                  onChange={handleVATSelectChange}
                >
                  <option value={0}>0%</option>
                  <option value={9.5}>9.5%</option>
                  <option value={22}>22%</option>
                  <option value="other">Other</option>
                </select>
                {showCustomVAT && (
                  <input
                    type="number"
                    value={customVAT}
                    onChange={handleCustomVATChange}
                    placeholder="Custom VAT %"
                    step="0.01"
                    min="0"
                    max="100"
                    className="input-field mt-1 font-mono"
                  />
                )}
              </div>
              <div className="col-span-1">
                <button type="button" onClick={handleAddItem} className=" btn-primary">
                  Add
                </button>
              </div>
            </div>
          </div>

          {formData.items.length > 0 && (
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[var(--muted)]">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      VAT
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {formData.items.map((item) => {
                    const product = item.productId ? allProducts.find((p) => p.id === item.productId) : null;
                    const isNewProduct = product?.id.startsWith("temp-");
                    return (
                      <tr key={item.id} className="hover:bg-[var(--hover-bg)]">
                        <td className="px-4 py-3 text-sm text-[var(--foreground)] opacity-80">
                          {product ? (
                            <span className="flex items-center gap-2">
                              {product.name}
                              {isNewProduct && (
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">NEW</span>
                              )}
                            </span>
                          ) : (
                            item.description
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--foreground)] opacity-80 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--foreground)] opacity-80">{item.unit}</td>
                        <td className="px-4 py-3 text-sm text-[var(--foreground)] opacity-80 text-right">
                          €{Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--foreground)] opacity-80 text-right">
                          {item.vatRate}%
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)] text-right">
                          €{Number(item.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="bg-[var(--muted)] px-4 py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Subtotal:</span>
                  <span className="text-[var(--foreground)] font-medium">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">VAT:</span>
                  <span className="text-[var(--foreground)] font-medium">€{vatAmount.toFixed(2)}</span>
                </div>
                <div className="divider"></div>
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-[var(--foreground)]">Total:</span>
                  <span className="font-semibold text-[var(--foreground)]">€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input-field min-h-[100px]"
            placeholder="Additional notes or payment terms..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary" disabled={formData.items.length === 0 || loading}>
            {loading ? "Creating Invoice..." : "Generate Invoice"}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
        </div>
      </form>

      {/* Partner Creation Modal - Outside the form to prevent nested form issues */}
      {showPartnerModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPartnerModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Create New Partner</h2>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPartnerModal(false);
                }}
                className="text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <PartnerForm onSuccess={handlePartnerCreated} onCancel={() => setShowPartnerModal(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
