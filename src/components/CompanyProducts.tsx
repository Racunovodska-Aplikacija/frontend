import { useState, useEffect } from "react";
import { productAPI } from "@/services/api";
import type { Product, Company } from "@/types";
import ProductForm from "./ProductForm";
import ConfirmDialog from "./ConfirmDialog";
import AlertDialog from "./AlertDialog";

interface CompanyProductsProps {
  company: Company;
  onClose: () => void;
}

export default function CompanyProducts({ company, onClose }: CompanyProductsProps) {
  const [products, setProducts] = useState<Product[]>(company.products || []);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "error" | "success" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const companyProducts = await productAPI.getAllByCompany(company.id);
      setProducts(companyProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await productAPI.delete(company.id, id);
          await fetchProducts();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          console.error("Failed to delete product:", error);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          setAlertDialog({
            isOpen: true,
            title: "Error",
            message: "Failed to delete product. Please try again.",
            type: "error",
          });
        }
      },
    });
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingProduct(null);
    await fetchProducts();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--card-bg)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-elevated border border-[var(--card-border)]">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Products</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{company.companyName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -m-2 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showForm ? (
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
                {editingProduct ? "Edit Product" : "New Product"}
              </h3>
              <ProductForm
                product={editingProduct}
                companyId={company.id}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-6">
                <button onClick={handleAddProduct} className="btn-primary">
                  Add Product
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12 text-sm text-[var(--text-secondary)]">Loading...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--muted)] mb-4">
                    <svg
                      className="w-6 h-6 text-[var(--text-secondary)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">No products yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center p-4 rounded-xl border border-[var(--border)] hover:border-[var(--text-secondary)] transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-[var(--foreground)]">{product.name}</h4>
                        <div className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-4">
                          <span className="font-mono">€{Number(product.cost).toFixed(2)}</span>
                          <span className="opacity-50">·</span>
                          <span>{product.measuringUnit}</span>
                          <span className="opacity-50">·</span>
                          <span>{product.ddvPercentage}% VAT</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="btn-ghost text-[var(--text-secondary)] hover:text-[var(--foreground)] text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="btn-ghost text-[var(--text-secondary)] hover:text-[var(--foreground)] text-sm"
                        >
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
                          {/* Alert Dialog */}
                          <AlertDialog
                            isOpen={alertDialog.isOpen}
                            title={alertDialog.title}
                            message={alertDialog.message}
                            type={alertDialog.type}
                            onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
                          />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
