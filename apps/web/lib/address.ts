export interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

/** Single-line rendering used on checkout + order records. */
export function formatAddress(a: Address): string {
  return [a.fullName, a.street, a.city, a.state, a.zip, a.country]
    .filter(Boolean)
    .join(', ');
}

export const SA_PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
];
