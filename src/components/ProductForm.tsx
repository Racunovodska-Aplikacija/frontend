import React, { useState, useEffect } from "react";
import { productAPI } from "@/services/api";
import type { Product, ProductFormData } from "@/types";

interface ProductFormProps {
  product?: Product | null;
  companyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, companyId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    cost: 0,
    measuringUnit: "",
    ddvPercentage: 22,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [showCustomUnit, setShowCustomUnit] = useState(false);
  const [customDDV, setCustomDDV] = useState<number>(0);
  const [showCustomDDV, setShowCustomDDV] = useState(false);

  useEffect(() => {
    if (product) {
      const presetUnits = ["kom", "kg", "l", "m", "m2", "h"];
      const isPreset = presetUnits.includes(product.measuringUnit);

      const presetDDVs = [0, 9.5, 22];
      const ddvValue =
        typeof product.ddvPercentage === "string" ? parseFloat(product.ddvPercentage) : product.ddvPercentage;
      const isPresetDDV = presetDDVs.includes(ddvValue);

      setFormData({
        name: product.name,
        cost: typeof product.cost === "string" ? parseFloat(product.cost) : product.cost,
        measuringUnit: isPreset ? product.measuringUnit : "other",
        ddvPercentage: isPresetDDV ? ddvValue : -1, // Use -1 to indicate custom
      });

      if (!isPreset) {
        setCustomUnit(product.measuringUnit);
        setShowCustomUnit(true);
      } else {
        setCustomUnit("");
        setShowCustomUnit(false);
      }

      if (!isPresetDDV) {
        setCustomDDV(ddvValue);
        setShowCustomDDV(true);
      } else {
        setCustomDDV(0);
        setShowCustomDDV(false);
      }
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = {
        ...formData,
        cost: typeof formData.cost === "string" ? parseFloat(formData.cost) : formData.cost,
        measuringUnit: showCustomUnit ? customUnit : formData.measuringUnit,
        ddvPercentage: showCustomDDV
          ? customDDV
          : typeof formData.ddvPercentage === "string"
          ? parseFloat(formData.ddvPercentage)
          : formData.ddvPercentage,
      };

      if (product) {
        await productAPI.update(companyId, product.id, submitData);
      } else {
        await productAPI.create(companyId, submitData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === "measuringUnit") {
      if (value === "other") {
        setShowCustomUnit(true);
        setFormData((prev) => ({
          ...prev,
          measuringUnit: customUnit,
        }));
      } else {
        setShowCustomUnit(false);
        setFormData((prev) => ({
          ...prev,
          measuringUnit: value,
        }));
      }
    } else if (name === "ddvPercentage") {
      if (value === "other") {
        setShowCustomDDV(true);
        setFormData((prev) => ({
          ...prev,
          ddvPercentage: customDDV,
        }));
      } else {
        setShowCustomDDV(false);
        setFormData((prev) => ({
          ...prev,
          ddvPercentage: parseFloat(value),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseFloat(value) : value,
      }));
    }
  };

  const handleCustomUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomUnit(value);
    setFormData((prev) => ({
      ...prev,
      measuringUnit: value,
    }));
  };

  const handleCustomDDVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCustomDDV(value);
    setFormData((prev) => ({
      ...prev,
      ddvPercentage: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="label">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter product name"
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cost" className="label">
            Price (€)
          </label>
          <input
            type="number"
            id="cost"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            className="input-field font-mono"
          />
        </div>

        <div>
          <label htmlFor="measuringUnit" className="label">
            Unit
          </label>
          <select
            id="measuringUnit"
            name="measuringUnit"
            value={showCustomUnit ? "other" : formData.measuringUnit}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Select</option>
            <option value="kom">Piece</option>
            <option value="kg">kg</option>
            <option value="l">Liter</option>
            <option value="m">Meter</option>
            <option value="m2">m²</option>
            <option value="h">Hour</option>
            <option value="other">Other (custom)</option>
          </select>
          {showCustomUnit && (
            <input
              type="text"
              value={customUnit}
              onChange={handleCustomUnitChange}
              placeholder="Enter custom unit"
              required
              className="input-field mt-2"
            />
          )}
        </div>
      </div>

      <div>
        <label htmlFor="ddvPercentage" className="label">
          VAT Rate
        </label>
        <select
          id="ddvPercentage"
          name="ddvPercentage"
          value={showCustomDDV ? "other" : formData.ddvPercentage}
          onChange={handleChange}
          required
          className="input-field"
        >
          <option value={0}>0%</option>
          <option value={9.5}>9.5%</option>
          <option value={22}>22%</option>
          <option value="other">Other (custom)</option>
        </select>
        {showCustomDDV && (
          <input
            type="number"
            value={customDDV}
            onChange={handleCustomDDVChange}
            placeholder="Enter custom VAT rate"
            step="0.01"
            min="0"
            max="100"
            required
            className="input-field mt-2 font-mono"
          />
        )}
      </div>

      <div className="flex gap-3 pt-6 border-t border-neutral-100">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : product ? "Save Changes" : "Add Product"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
