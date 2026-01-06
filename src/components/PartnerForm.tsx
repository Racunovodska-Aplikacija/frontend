import { useState, FormEvent, useEffect, useRef } from "react";
import { partnerAPI } from "@/services/api";
import type { Partner, PartnerFormData } from "@/types";

interface PartnerFormProps {
  partner?: Partner | null;
  onSuccess: (newPartner?: Partner) => void;
  onCancel: () => void;
}

interface CebelcaCompany {
  regnum: string;
  taxnum: string;
  vatreg: string;
  _id: string;
  address: string;
  iban1: string;
  name: string;
  postal: string;
  city: string;
  iban: string;
  sname: string;
  street: string;
}

export default function PartnerForm({ partner, onSuccess, onCancel }: PartnerFormProps) {
  const [formData, setFormData] = useState<PartnerFormData>({
    naziv: partner?.naziv || "",
    ulica: partner?.ulica || "",
    kraj: partner?.kraj || "",
    postnaSt: partner?.postnaSt || "",
    poljubenNaslov: partner?.poljubenNaslov || "",
    ddvZavezanec: partner?.ddvZavezanec || false,
    davcnaSt: partner?.davcnaSt || "",
    rokPlacila: partner?.rokPlacila || 14,
    telefon: partner?.telefon || "",
    ePosta: partner?.ePosta || "",
    spletnastran: partner?.spletnastran || "",
    opombe: partner?.opombe || "",
    eRacunNaslov: partner?.eRacunNaslov || "",
    eRacunId: partner?.eRacunId || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CebelcaCompany[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search companies from Cebelca API
  const searchCompanies = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost/companies/search/cebelca?q=${encodeURIComponent(query)}`, {
        credentials: "include",
      });
      const data = await response.json();
      setSuggestions(Array.isArray(data) ? data : []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Failed to search companies:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFormData({ ...formData, naziv: value });

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchCompanies(value);
    }, 300);
  };

  // Select company from suggestions
  const selectCompany = (company: CebelcaCompany) => {
    setFormData({
      ...formData,
      naziv: company.name,
      ulica: `${company.street}${company.address ? " " + company.address : ""}`,
      kraj: company.city,
      postnaSt: company.postal,
      ddvZavezanec: company.vatreg === "1",
      davcnaSt: company.vatreg === "1" ? `SI${company.taxnum}` : "",
    });
    setSearchQuery(company.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setLoading(true);

    try {
      if (partner) {
        await partnerAPI.update(partner.id, formData);
        onSuccess();
      } else {
        const newPartner = await partnerAPI.create(formData);
        onSuccess(newPartner);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save partner");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
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
        {/* Partner Name with Autocomplete */}
        <div className="md:col-span-2 relative" ref={suggestionsRef}>
          <label htmlFor="naziv" className="label">
            Partner Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="naziv"
              name="naziv"
              required
              className="input-field"
              placeholder="Start typing to search companies..."
              value={formData.naziv}
              onChange={handleSearchChange}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              autoComplete="off"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-neutral-300 border-t-black rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((company) => (
                <button
                  key={company._id}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0 focus:outline-none focus:bg-neutral-50"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectCompany(company);
                  }}
                >
                  <div className="font-medium text-sm text-neutral-900">{company.sname}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {company.street} {company.address}, {company.postal} {company.city}
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {company.vatreg === "1" && `Tax: SI${company.taxnum}`}
                    {company.vatreg === "1" && company.regnum && " • "}
                    {company.regnum && `Reg: ${company.regnum}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Street */}
        <div>
          <label htmlFor="ulica" className="label">
            Street
          </label>
          <input
            type="text"
            id="ulica"
            name="ulica"
            required
            className="input-field"
            placeholder="Street and number"
            value={formData.ulica}
            onChange={handleChange}
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="kraj" className="label">
            City
          </label>
          <input
            type="text"
            id="kraj"
            name="kraj"
            required
            className="input-field"
            placeholder="Ljubljana"
            value={formData.kraj}
            onChange={handleChange}
          />
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postnaSt" className="label">
            Postal Code
          </label>
          <input
            type="text"
            id="postnaSt"
            name="postnaSt"
            required
            className="input-field"
            placeholder="1000"
            value={formData.postnaSt}
            onChange={handleChange}
          />
        </div>

        {/* Custom Address */}
        <div>
          <label htmlFor="poljubenNaslov" className="label">
            Custom Invoice Address
          </label>
          <input
            type="text"
            id="poljubenNaslov"
            name="poljubenNaslov"
            className="input-field"
            placeholder="Alternative address for invoices"
            value={formData.poljubenNaslov}
            onChange={handleChange}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="telefon" className="label">
            Phone
          </label>
          <input
            type="tel"
            id="telefon"
            name="telefon"
            className="input-field"
            placeholder="+386 1 234 5678"
            value={formData.telefon}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="ePosta" className="label">
            Email
          </label>
          <input
            type="email"
            id="ePosta"
            name="ePosta"
            className="input-field"
            placeholder="partner@example.com"
            value={formData.ePosta}
            onChange={handleChange}
          />
        </div>

        {/* Website */}
        <div className="md:col-span-2">
          <label htmlFor="spletnastran" className="label">
            Website
          </label>
          <input
            type="url"
            id="spletnastran"
            name="spletnastran"
            className="input-field"
            placeholder="https://example.com"
            value={formData.spletnastran}
            onChange={handleChange}
          />
        </div>

        {/* VAT Payer Checkbox */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                id="ddvZavezanec"
                name="ddvZavezanec"
                className="sr-only peer"
                checked={formData.ddvZavezanec}
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
            <span className="text-sm text-neutral-700 group-hover:text-black transition-colors">VAT Liable</span>
          </label>
        </div>

        {/* Tax Number (only if VAT payer) */}
        {formData.ddvZavezanec && (
          <div>
            <label htmlFor="davcnaSt" className="label">
              Tax Number
            </label>
            <input
              type="text"
              id="davcnaSt"
              name="davcnaSt"
              className="input-field"
              placeholder="SI12345678"
              value={formData.davcnaSt}
              onChange={handleChange}
            />
          </div>
        )}

        {/* Payment Term */}
        <div>
          <label htmlFor="rokPlacila" className="label">
            Payment Term (days)
          </label>
          <input
            type="number"
            id="rokPlacila"
            name="rokPlacila"
            required
            min="0"
            className="input-field"
            placeholder="14"
            value={formData.rokPlacila}
            onChange={handleChange}
          />
        </div>

        {/* e-Invoice Address */}
        <div>
          <label htmlFor="eRacunNaslov" className="label">
            e-Invoice Address
          </label>
          <input
            type="text"
            id="eRacunNaslov"
            name="eRacunNaslov"
            className="input-field"
            placeholder="e-Invoice delivery address"
            value={formData.eRacunNaslov}
            onChange={handleChange}
          />
        </div>

        {/* e-Invoice ID */}
        <div>
          <label htmlFor="eRacunId" className="label">
            e-Invoice ID
          </label>
          <input
            type="text"
            id="eRacunId"
            name="eRacunId"
            className="input-field"
            placeholder="e-Invoice identifier"
            value={formData.eRacunId}
            onChange={handleChange}
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label htmlFor="opombe" className="label">
            Notes
          </label>
          <textarea
            id="opombe"
            name="opombe"
            rows={3}
            className="input-field resize-none"
            placeholder="Internal notes..."
            value={formData.opombe}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t border-neutral-100">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving..." : partner ? "Save Changes" : "Create Partner"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}
