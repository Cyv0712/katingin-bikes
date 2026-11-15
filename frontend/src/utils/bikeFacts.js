// What a bike page states about a unit: spec rows and financing terms.
// Pure (no browser globals) so the prerender script renders the same facts
// as the BikeDetails page.
import { withUnit } from './price.js';

export const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';

export const hasFinancingValue = (value) => {
  if (!value) return false;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  return cleaned.length > 0 && parseFloat(cleaned) > 0;
};

// Only rows with data are returned: the extra spec fields exist on a few bikes
export const bikeSpecs = (bike) => [
  ['Year', bike.year],
  ['Mileage', hasValue(bike.mileage) ? withUnit(bike.mileage, 'km') : null],
  ['Engine', hasValue(bike.engineSize) ? withUnit(bike.engineSize, 'cc') : null],
  ['Type', bike.type],
  ['Engine configuration', bike.engineConfig],
  ['Power', bike.power],
  ['Transmission', bike.transmission],
  ['Fuel capacity', bike.fuelCapacity],
  ['Edition', bike.edition],
].filter(([, value]) => hasValue(value));

export const bikeFinancing = (bike) => {
  const showDownpayment = hasFinancingValue(bike.minDownpayment);
  const monthlyTerms = [
    { label: '12 months', value: bike.monthly12 },
    { label: '24 months', value: bike.monthly24 },
    { label: '36 months', value: bike.monthly36 },
  ].filter((term) => hasFinancingValue(term.value));
  const showCard = bike.isFinanceable !== false && !bike.isReserved && (showDownpayment || monthlyTerms.length > 0);
  return { showDownpayment, monthlyTerms, showCard };
};
