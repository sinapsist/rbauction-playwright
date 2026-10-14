export interface ForeignYardList {
  country: string;
  cities: readonly string[];
}

/**
 * Yard labels as the directory prints them, including the satellite asterisk.
 * UI-N-1.6 compares the name without that marker, because the Canada list is
 * read the same way.
 */
export const FOREIGN_YARDS_NOT_IN_CANADA: readonly ForeignYardList[] = [
  {
    country: 'United States',
    cities: [
      'Atlanta',
      'Baton Rouge*',
      'Charlotte*',
      'Chehalis',
      'Chicago',
      'Columbus',
      'Denver',
      'Fort Worth',
      'Houston',
      'Kansas City',
      'Las Vegas',
      'Lincoln*',
      'Little Rock',
      'Los Angeles',
      'Midland*',
      'Minneapolis',
      'Nashville',
      'North East',
      'North Franklin',
      'Oklahoma City, OK',
      'Orlando',
      'Phoenix',
      'Pittsburgh*',
      'Raleigh*',
      'Sacramento',
      'Salt Lake City',
      'San Antonio*',
      'Spokane*',
      'Tulare',
      'Wasilla*',
      'Williston*',
    ],
  },
  {
    country: 'Australia',
    cities: [
      'Melbourne',
      'Sydney',
      'Adelaide*',
      'Brisbane',
      'Dubbo*',
      'Geelong',
      'Mittagong*',
      'Newcastle*',
      'Perth*',
    ],
  },
  { country: 'Finland', cities: ['Tuusula'] },
  {
    country: 'France',
    cities: ['Avignon*', 'Bressols*', 'Nivolas-Vermelle*', 'St Aubin Sur Gaillon'],
  },
  { country: 'Germany', cities: ['Leipzig*', 'Meppen'] },
  { country: 'Ireland', cities: ['Mullingar'] },
  { country: 'Italy', cities: ['Caorso'] },
  { country: 'Japan', cities: ['Japan'] },
  { country: 'Mexico', cities: ['Polotitlan'] },
  { country: 'Netherlands', cities: ['Moerdijk'] },
  { country: 'New Zealand', cities: ['Auckland'] },
  { country: 'Spain', cities: ['Ocana', 'Vila Seca Tarragona*'] },
  { country: 'Sweden', cities: ['Vaggeryd*'] },
  { country: 'UAE', cities: ['Dubai'] },
  { country: 'United Kingdom', cities: ['Maltby', 'Scotland*'] },
];

export function yardName(label: string): string {
  return label.replace(/\*/g, '').trim();
}
