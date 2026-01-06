export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  userId: string;
  companyName: string;
  street: string;
  streetAdditional?: string;
  postalCode: string;
  city: string;
  iban: string;
  bic: string;
  registrationNumber: string;
  vatPayer: boolean;
  vatId?: string;
  additionalInfo?: string;
  documentLocation?: string;
  reverseCharge: boolean;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface CompanyFormData {
  companyName: string;
  street: string;
  streetAdditional?: string;
  postalCode: string;
  city: string;
  iban: string;
  bic: string;
  registrationNumber: string;
  vatPayer: boolean;
  vatId?: string;
  additionalInfo?: string;
  documentLocation?: string;
  reverseCharge: boolean;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  cost: number;
  measuringUnit: string;
  ddvPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  companyId?: string;
  name: string;
  cost: number;
  measuringUnit: string;
  ddvPercentage: number;
}

export interface Partner {
  id: string;
  userId: string;
  naziv: string;
  ulica: string;
  kraj: string;
  postnaSt: string;
  poljubenNaslov?: string;
  ddvZavezanec: boolean;
  davcnaSt?: string;
  rokPlacila: number;
  telefon?: string;
  ePosta?: string;
  spletnastran?: string;
  opombe?: string;
  eRacunNaslov?: string;
  eRacunId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerFormData {
  naziv: string;
  ulica: string;
  kraj: string;
  postnaSt: string;
  poljubenNaslov?: string;
  ddvZavezanec: boolean;
  davcnaSt?: string;
  rokPlacila: number;
  telefon?: string;
  ePosta?: string;
  spletnastran?: string;
  opombe?: string;
  eRacunNaslov?: string;
  eRacunId?: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  company_id: string;
  partner_id: string;
  invoice_number: string;
  issue_date: string;
  service_date: string;
  due_date: string;
  notes?: string;
  status: 'ISSUED' | 'PAID' | 'CANCELLED';
  lines: InvoiceLine[];
  company?: {
    id: string;
    userId: string;
    companyName: string;
    street: string;
    streetAdditional?: string;
    postalCode: string;
    city: string;
    iban: string;
    bic: string;
    registrationNumber: string;
    vatPayer: boolean;
    vatId?: string;
    additionalInfo?: string;
    documentLocation?: string;
    reverseCharge: boolean;
  };
  partner?: {
    id: string;
    userId: string;
    naziv: string;
    ulica: string;
    kraj: string;
    postnaSt: string;
    poljubenNaslov?: string;
    ddvZavezanec: boolean;
    davcnaSt?: string;
    rokPlacila: number;
    telefon?: string;
    ePosta?: string;
    spletnastran?: string;
    opombe?: string;
    eRacunNaslov?: string;
    eRacunId?: string;
  };
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  product_id: string;
  amount: number;
  product?: {
    id: string;
    companyId: string;
    name: string;
    cost: string;
    measuringUnit: string;
    ddvPercentage: string;
  };
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  vatRate: number;
  amount: number;
}

export interface InvoiceFormData {
  companyId: string;
  partnerId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  serviceDate: string;
  items: InvoiceItem[];
  notes?: string;
}
