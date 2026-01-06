import { useState, FormEvent } from "react";
import { companyAPI } from "@/services/api";
import type { Company, CompanyFormData } from "@/types";

interface CompanyFormProps {
  company?: Company | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CompanyForm({ company, onSuccess, onCancel }: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: company?.companyName || "",
    street: company?.street || "",
    streetAdditional: company?.streetAdditional || "",
    postalCode: company?.postalCode || "",
    city: company?.city || "",
    iban: company?.iban || "",
    bic: company?.bic || "",
    registrationNumber: company?.registrationNumber || "",
    vatPayer: company?.vatPayer || false,
    vatId: company?.vatId || "",
    additionalInfo: company?.additionalInfo || "",
    documentLocation: company?.documentLocation || "",
    reverseCharge: company?.reverseCharge || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (company) {
        await companyAPI.update(company.id, formData);
      } else {
        await companyAPI.create(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save company");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="md:col-span-2">
          <label htmlFor="companyName" className="label">
            Company Name
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            required
            className="input-field"
            placeholder="Enter company name"
            value={formData.companyName}
            onChange={handleChange}
          />
        </div>

        {/* Street */}
        <div>
          <label htmlFor="street" className="label">
            Street
          </label>
          <input
            type="text"
            id="street"
            name="street"
            required
            className="input-field"
            placeholder="Street and number"
            value={formData.street}
            onChange={handleChange}
          />
        </div>

        {/* Street Additional */}
        <div>
          <label htmlFor="streetAdditional" className="label">
            Street Additional
          </label>
          <input
            type="text"
            id="streetAdditional"
            name="streetAdditional"
            className="input-field"
            placeholder="Apartment, suite, etc."
            value={formData.streetAdditional}
            onChange={handleChange}
          />
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postalCode" className="label">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            required
            className="input-field"
            placeholder="1000"
            value={formData.postalCode}
            onChange={handleChange}
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="label">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            className="input-field"
            placeholder="Ljubljana"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        {/* IBAN */}
        <div>
          <label htmlFor="iban" className="label">
            IBAN
          </label>
          <input
            type="text"
            id="iban"
            name="iban"
            required
            minLength={15}
            maxLength={34}
            className="input-field font-mono"
            placeholder="SI56 1234 5678 9012 345"
            value={formData.iban}
            onChange={handleChange}
          />
        </div>

        {/* BIC */}
        <div>
          <label htmlFor="bic" className="label">
            BIC / SWIFT
          </label>
          <input
            type="text"
            id="bic"
            name="bic"
            required
            minLength={8}
            maxLength={11}
            className="input-field font-mono"
            placeholder="LJBASI2X"
            value={formData.bic}
            onChange={handleChange}
          />
        </div>

        {/* Registration Number */}
        <div>
          <label htmlFor="registrationNumber" className="label">
            Registration Number
          </label>
          <input
            type="text"
            id="registrationNumber"
            name="registrationNumber"
            required
            className="input-field"
            placeholder="1234567890"
            value={formData.registrationNumber}
            onChange={handleChange}
          />
        </div>

        {/* VAT ID */}
        <div>
          <label htmlFor="vatId" className="label">
            VAT ID
          </label>
          <input
            type="text"
            id="vatId"
            name="vatId"
            className="input-field"
            placeholder="SI12345678"
            value={formData.vatId}
            onChange={handleChange}
          />
        </div>

        {/* Document Location */}
        <div className="md:col-span-2">
          <label htmlFor="documentLocation" className="label">
            Document Location
          </label>
          <input
            type="text"
            id="documentLocation"
            name="documentLocation"
            className="input-field"
            placeholder="Where documents are stored"
            value={formData.documentLocation}
            onChange={handleChange}
          />
        </div>

        {/* Additional Info */}
        <div className="md:col-span-2">
          <label htmlFor="additionalInfo" className="label">
            Additional Notes
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            rows={3}
            className="input-field resize-none"
            placeholder="Any additional information..."
            value={formData.additionalInfo}
            onChange={handleChange}
          />
        </div>

        {/* Checkboxes */}
        <div className="md:col-span-2 flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                id="vatPayer"
                name="vatPayer"
                className="sr-only peer"
                checked={formData.vatPayer}
                onChange={handleChange}
              />
              <div className="w-5 h-5 border-2 border-neutral-300 rounded-md peer-checked:bg-black peer-checked:border-black transition-all"></div>
              <svg
                className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors">
              VAT Payer
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                id="reverseCharge"
                name="reverseCharge"
                className="sr-only peer"
                checked={formData.reverseCharge}
                onChange={handleChange}
              />
              <div className="w-5 h-5 border-2 border-neutral-300 rounded-md peer-checked:bg-black peer-checked:border-black transition-all"></div>
              <svg
                className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors">
              Reverse Charge
            </span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t border-neutral-100">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : company ? "Save Changes" : "Create Company"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
