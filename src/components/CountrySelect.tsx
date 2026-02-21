import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/TranslationContext';

interface CountrySelectProps {
  selectedCountry: string;
  selectedCity: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
}

type Country = {
  name: string;
  cities: string[];
};

// Updated list with more Bangladesh cities prioritized at the top
const COUNTRIES: Country[] = [
  {
    name: 'Bangladesh',
    cities: [
      'Dhaka',
      'Chittagong',
      'Khulna',
      'Rajshahi',
      'Sylhet',
      'Barisal',
      'Rangpur',
      'Comilla',
      'Gazipur',
      'Narayanganj',
      'Mymensingh',
      'Jessore',
      'Bogra',
      'Dinajpur',
      'Tangail',
      'Jamalpur',
      'Pabna',
      'Nawabganj',
      'Kushtia',
      'Faridpur',
      "Cox's Bazar",
      'Feni',
      'Jhenaidah',
      'Brahmanbaria',
      'Saidpur',
      'Noakhali',
      'Sirajganj',
      'Narsingdi',
      'Rangamati',
    ],
  },
  {
    name: 'Afghanistan',
    cities: ['Kabul', 'Kandahar', 'Herat', 'Mazar-i-Sharif', 'Jalalabad'],
  },
  {
    name: 'Albania',
    cities: ['Tirana', 'Durrës', 'Vlorë', 'Shkodër', 'Elbasan'],
  },
  {
    name: 'Algeria',
    cities: ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida'],
  },
  {
    name: 'Argentina',
    cities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'],
  },
  {
    name: 'Australia',
    cities: [
      'Sydney',
      'Melbourne',
      'Brisbane',
      'Perth',
      'Adelaide',
      'Gold Coast',
      'Canberra',
      'Newcastle',
      'Wollongong',
      'Logan City',
    ],
  },
  {
    name: 'Austria',
    cities: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'],
  },
  {
    name: 'Azerbaijan',
    cities: ['Baku', 'Ganja', 'Sumqayit', 'Mingachevir', 'Shirvan'],
  },
  {
    name: 'Bahrain',
    cities: ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', "A'ali"],
  },
  {
    name: 'Bangladesh',
    cities: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet'],
  },
  {
    name: 'Belgium',
    cities: ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège'],
  },
  {
    name: 'Brazil',
    cities: [
      'São Paulo',
      'Rio de Janeiro',
      'Brasília',
      'Salvador',
      'Fortaleza',
    ],
  },
  {
    name: 'Canada',
    cities: [
      'Toronto',
      'Montreal',
      'Vancouver',
      'Calgary',
      'Edmonton',
      'Ottawa',
      'Winnipeg',
      'Quebec City',
      'Hamilton',
      'Kitchener',
    ],
  },
  {
    name: 'China',
    cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Tianjin'],
  },
  {
    name: 'Egypt',
    cities: ['Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said'],
  },
  {
    name: 'France',
    cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'],
  },
  {
    name: 'Germany',
    cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt'],
  },
  {
    name: 'India',
    cities: [
      'Mumbai',
      'Delhi',
      'Bangalore',
      'Hyderabad',
      'Chennai',
      'Kolkata',
      'Ahmedabad',
      'Pune',
      'Surat',
      'Jaipur',
    ],
  },
  {
    name: 'Indonesia',
    cities: [
      'Jakarta',
      'Surabaya',
      'Bandung',
      'Medan',
      'Semarang',
      'Makassar',
      'Palembang',
      'Tangerang',
      'Depok',
      'Padang',
    ],
  },
  {
    name: 'Iran',
    cities: ['Tehran', 'Mashhad', 'Isfahan', 'Karaj', 'Shiraz'],
  },
  {
    name: 'Iraq',
    cities: ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Najaf'],
  },
  {
    name: 'Ireland',
    cities: ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford'],
  },
  {
    name: 'Italy',
    cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo'],
  },
  {
    name: 'Japan',
    cities: ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo'],
  },
  {
    name: 'Jordan',
    cities: ['Amman', 'Zarqa', 'Irbid', 'Russeifa', 'Aqaba'],
  },
  {
    name: 'Kazakhstan',
    cities: ['Almaty', 'Nur-Sultan', 'Shymkent', 'Karaganda', 'Aktobe'],
  },
  {
    name: 'Kuwait',
    cities: [
      'Kuwait City',
      'Hawalli',
      'Salmiya',
      'Al Ahmadi',
      'Sabah as Salim',
    ],
  },
  {
    name: 'Lebanon',
    cities: ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Jounieh'],
  },
  {
    name: 'Libya',
    cities: ['Tripoli', 'Benghazi', 'Misrata', 'Tarhuna', 'Al Khums'],
  },
  {
    name: 'Malaysia',
    cities: [
      'Kuala Lumpur',
      'George Town',
      'Ipoh',
      'Shah Alam',
      'Johor Bahru',
      'Kuching',
      'Penang',
      'Kota Kinabalu',
      'Melaka',
      'Kota Bharu',
    ],
  },
  {
    name: 'Morocco',
    cities: ['Casablanca', 'Rabat', 'Fes', 'Marrakesh', 'Tangier'],
  },
  {
    name: 'Netherlands',
    cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
  },
  {
    name: 'New Zealand',
    cities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga'],
  },
  {
    name: 'Nigeria',
    cities: ['Lagos', 'Kano', 'Ibadan', 'Kaduna', 'Port Harcourt'],
  },
  {
    name: 'Oman',
    cities: ['Muscat', 'Seeb', 'Salalah', 'Bawshar', 'Sohar'],
  },
  {
    name: 'Pakistan',
    cities: [
      'Karachi',
      'Lahore',
      'Islamabad',
      'Faisalabad',
      'Rawalpindi',
      'Multan',
      'Hyderabad',
      'Peshawar',
      'Quetta',
      'Sialkot',
    ],
  },
  {
    name: 'Philippines',
    cities: ['Manila', 'Quezon City', 'Davao City', 'Caloocan', 'Cebu City'],
  },
  {
    name: 'Poland',
    cities: ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań'],
  },
  {
    name: 'Qatar',
    cities: ['Doha', 'Al Rayyan', 'Umm Salal', 'Al Wakrah', 'Al Khor'],
  },
  {
    name: 'Russia',
    cities: [
      'Moscow',
      'Saint Petersburg',
      'Novosibirsk',
      'Yekaterinburg',
      'Kazan',
    ],
  },
  {
    name: 'Saudi Arabia',
    cities: [
      'Riyadh',
      'Jeddah',
      'Mecca',
      'Medina',
      'Dammam',
      'Taif',
      'Tabuk',
      'Buraydah',
      'Khamis Mushait',
      'Abha',
    ],
  },
  {
    name: 'Singapore',
    cities: ['Singapore'],
  },
  {
    name: 'South Africa',
    cities: [
      'Johannesburg',
      'Cape Town',
      'Durban',
      'Pretoria',
      'Port Elizabeth',
    ],
  },
  {
    name: 'South Korea',
    cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon'],
  },
  {
    name: 'Spain',
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza'],
  },
  {
    name: 'Sudan',
    cities: ['Khartoum', 'Omdurman', 'Nyala', 'Port Sudan', 'Kassala'],
  },
  {
    name: 'Sweden',
    cities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås'],
  },
  {
    name: 'Switzerland',
    cities: ['Zürich', 'Geneva', 'Basel', 'Lausanne', 'Bern'],
  },
  {
    name: 'Syria',
    cities: ['Damascus', 'Aleppo', 'Homs', 'Latakia', 'Hama'],
  },
  {
    name: 'Thailand',
    cities: [
      'Bangkok',
      'Nonthaburi',
      'Nakhon Ratchasima',
      'Chiang Mai',
      'Hat Yai',
    ],
  },
  {
    name: 'Tunisia',
    cities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte'],
  },
  {
    name: 'Turkey',
    cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana'],
  },
  {
    name: 'UAE',
    cities: [
      'Dubai',
      'Abu Dhabi',
      'Sharjah',
      'Al Ain',
      'Ajman',
      'Ras Al Khaimah',
      'Fujairah',
      'Umm Al Quwain',
      'Khor Fakkan',
      'Dibba Al-Fujairah',
    ],
  },
  {
    name: 'Ukraine',
    cities: ['Kyiv', 'Kharkiv', 'Odessa', 'Dnipro', 'Donetsk'],
  },
  {
    name: 'United Kingdom',
    cities: [
      'London',
      'Birmingham',
      'Manchester',
      'Glasgow',
      'Liverpool',
      'Bristol',
      'Sheffield',
      'Leeds',
      'Edinburgh',
      'Leicester',
    ],
  },
  {
    name: 'United States',
    cities: [
      'New York',
      'Los Angeles',
      'Chicago',
      'Houston',
      'Phoenix',
      'Philadelphia',
      'San Antonio',
      'San Diego',
      'Dallas',
      'San Jose',
    ],
  },
  {
    name: 'Uzbekistan',
    cities: ['Tashkent', 'Namangan', 'Samarkand', 'Andijan', 'Nukus'],
  },
  {
    name: 'Yemen',
    cities: ['Sanaa', 'Aden', 'Taiz', 'Hodeidah', 'Mukalla'],
  },
];

export function CountrySelect({
  selectedCountry,
  selectedCity,
  onCountryChange,
  onCityChange,
}: CountrySelectProps) {
  const { t } = useTranslation();
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Filter countries based on search term
  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  // Filter cities based on search term
  const filteredCities = availableCities.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase()),
  );

  // Update available cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      const country = COUNTRIES.find((c) => c.name === selectedCountry);
      if (country) {
        setAvailableCities(country.cities);
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableCities([]);
    }
  }, [selectedCountry]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={countryOpen}
              className="w-full justify-between">
              {selectedCountry || t('common.selectCountry')}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder={t('common.searchCountry')}
                value={countrySearch}
                onValueChange={setCountrySearch}
              />
              <CommandList className="max-h-[300px]">
                <CommandEmpty>{t('common.noCountryFound')}</CommandEmpty>
                <CommandGroup>
                  {filteredCountries.map((country) => (
                    <CommandItem
                      key={country.name}
                      value={country.name}
                      onSelect={() => {
                        onCountryChange(country.name);
                        onCityChange('');
                        setCountryOpen(false);
                      }}>
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedCountry === country.name
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      {country.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">{t('common.city')}</Label>
        <Popover open={cityOpen} onOpenChange={setCityOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={cityOpen}
              className="w-full justify-between"
              disabled={!selectedCountry}>
              {selectedCity || t('common.selectCity')}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder={t('common.searchCity')}
                value={citySearch}
                onValueChange={setCitySearch}
              />
              <CommandList className="max-h-[300px]">
                <CommandEmpty>{t('common.noCityFound')}</CommandEmpty>
                <CommandGroup>
                  {filteredCities.map((city) => (
                    <CommandItem
                      key={city}
                      value={city}
                      onSelect={() => {
                        onCityChange(city);
                        setCityOpen(false);
                      }}>
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedCity === city ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {city}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
