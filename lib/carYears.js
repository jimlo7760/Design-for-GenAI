// Production years for each chassis code in carCatalog.js, shown next to the code so people who
// know their car by year ("my 2004 M3") can find the right generation. They follow the production
// dates on each generation's Wikipedia page (checked October 2026): calendar years of manufacture,
// not one market's model years, with "present" meaning it is still being built. Where a page also
// lists a long regional tail, the main run is used. Lines marked "not confirmed" are well-known
// figures that Wikipedia's text did not state.
// Cars added to the Supabase `Car` table have no entry here, so they just show the code.
export const CHASSIS_YEARS = {
    'Acura': {
        'Integra': { DC2: '1993–2001', DC5: '2001–2006' },
        'NSX': { NA1: '1990–2006', NC1: '2016–2022' },
    },
    'Alfa Romeo': {
        'Giulia': { '952': '2015–present' },
    },
    'Audi': {
        'A3': { '8V': '2012–2020', '8Y': '2020–present' },
        'A4': { B8: '2008–2016', B9: '2015–2025' },
        'R8': { 'Type 42': '2006–2015', 'Type 4S': '2014–2024' },
        'RS3': { '8V': '2015–2020', '8Y': '2021–present' }, // not confirmed on Wikipedia: 8Y
        'RS5': { B8: '2010–2015', B9: '2017–2024' },
        'RS6': { C7: '2013–2018', C8: '2019–2025' },
        'TT': { '8N': '1998–2006', '8J': '2006–2014', '8S': '2014–2023' },
    },
    'BMW': {
        '1 Series': { E87: '2004–2013', F20: '2011–2019' },
        '3 Series': { E30: '1982–1994', E36: '1990–2000', E46: '1998–2006', E90: '2004–2013', F30: '2011–2019', G20: '2018–2026' },
        '5 Series': { E39: '1995–2004', E60: '2003–2010', F10: '2009–2017', G30: '2016–2023' },
        'M2': { F87: '2016–2021', G87: '2023–present' },
        'M3': { E30: '1986–1991', E36: '1992–1999', E46: '2000–2006', E90: '2007–2013', E92: '2007–2013', F80: '2014–2018', G80: '2020–present' },
        'M4': { F82: '2014–2020', G82: '2020–present' },
        'M5': { E39: '1998–2003', E60: '2005–2010', F10: '2011–2016', F90: '2017–2023' },
        'X5': { E53: '1999–2006', E70: '2006–2013', F15: '2013–2018', G05: '2018–2026' },
        'Z4': { E85: '2002–2008', E89: '2009–2016', G29: '2018–2026' },
    },
    'Chevrolet': {
        'Camaro': { '5th gen': '2009–2015', '6th gen': '2015–2023' },
        'Corvette': { C5: '1997–2004', C6: '2004–2013', C7: '2013–2019', C8: '2020–present' },
    },
    'Dodge': {
        'Challenger': { LC: '2008–2023' },
        'Charger': { LD: '2011–2023', LX: '2005–2010' },
    },
    'Ford': {
        'Focus RS': { Mk2: '2009–2011', Mk3: '2015–2018' }, // not confirmed on Wikipedia: Mk2, Mk3
        'Focus ST': { Mk2: '2005–2010', Mk3: '2012–2018' }, // not confirmed on Wikipedia: Mk2, Mk3
        'Mustang': { 'Fox Body': '1979–1993', SN95: '1993–2004', S197: '2004–2014', S550: '2014–2023', S650: '2023–present' },
    },
    'Honda': {
        'Civic': { EG: '1991–1995', EK: '1995–2000', FD: '2005–2012', FC: '2015–2021', FK7: '2017–2021' }, // not confirmed on Wikipedia: FK7
        'Civic Type R': { EP3: '2001–2005', FD2: '2007–2011', FK2: '2015–2017', FK8: '2017–2021', FL5: '2022–present' },
        'NSX': { NA1: '1990–2006', NC1: '2016–2022' },
        'S2000': { AP1: '1999–2003', AP2: '2004–2009' },
    },
    'Hyundai': {
        'Elantra N': { CN7: '2021–present' },
        'Ioniq 5': { NE: '2021–present' },
        'Veloster N': { JS: '2018–2022' },
    },
    'Jeep': {
        'Gladiator': { JT: '2019–present' },
        'Wrangler': { JK: '2006–2018', JL: '2017–present' },
    },
    'Kia': {
        'EV6': { CV: '2021–present' },
        'Stinger': { CK: '2017–2023' },
    },
    'Lexus': {
        'GS': { S140: '1991–1997', S160: '1997–2005', S190: '2005–2011', L10: '2011–2020' },
        'IS': { XE10: '1998–2005', XE20: '2005–2013', XE30: '2013–present' },
        'LC': { Z100: '2017–present' },
        'LS': { XF30: '2000–2006', XF40: '2006–2017', XF50: '2017–present' },
        'RC': { XC10: '2014–2025' },
    },
    'Mazda': {
        'Mazda3': { BK: '2003–2008', BL: '2008–2013', BM: '2013–2018', BP: '2019–present' },
        'MX-5 Miata': { NA: '1989–1997', NB: '1998–2005', NC: '2005–2015', ND: '2015–present' },
        'RX-7': { FB: '1978–1985', FC: '1985–1992', FD: '1991–2002' },
        'RX-8': { SE3P: '2003–2012' },
    },
    'Mercedes-Benz': {
        'A45 AMG': { W176: '2013–2018', W177: '2018–present' },
        'AMG GT': { C190: '2014–2022', R190: '2017–2022' },
        'C-Class': { W203: '2000–2007', W204: '2007–2014', W205: '2014–2021', W206: '2021–present' },
        'C63 AMG': { W204: '2007–2014', W205: '2014–2021' },
        'E-Class': { W210: '1995–2002', W211: '2002–2009', W212: '2008–2016', W213: '2016–2023' },
        'G-Class': { W463: '1990–2024' },
    },
    'Mitsubishi': {
        'Lancer Evolution': { CN9A: '1996–1998', CP9A: '1998–2001', CT9A: '2001–2007', CZ4A: '2007–2016' },
    },
    'Nissan': {
        '240SX': { S13: '1989–1994', S14: '1994–1998' },
        '350Z': { Z33: '2002–2008' },
        '370Z': { Z34: '2008–2020' },
        'GT-R': { R35: '2007–2025' },
        'Silvia': { S13: '1988–1993', S14: '1994–1998', S15: '1999–2002' },
        'Skyline GT-R': { R32: '1989–1994', R33: '1995–1998', R34: '1999–2002' },
        'Z': { RZ34: '2022–present' },
    },
    'Porsche': {
        '911': { '964': '1989–1993', '991': '2011–2019', '992': '2019–present', '993': '1994–1998', '996': '1997–2004', '997': '2004–2012' },
        'Boxster': { '981': '2012–2016', '986': '1996–2004', '987': '2005–2012' },
        'Cayman': { '981': '2012–2016', '982': '2016–2025', '987': '2005–2012' },
        'Macan': { '95B': '2014–2026' },
    },
    'Subaru': {
        'BRZ': { ZC6: '2012–2020', ZD8: '2021–present' },
        'Impreza': { GC: '1992–2000', GD: '2000–2007', GR: '2007–2014' },
        'WRX': { GD: '2000–2007', GR: '2007–2014', VA: '2014–2021', VB: '2021–present' },
        'WRX STI': { GC8: '1994–2000', GDB: '2000–2007', GRB: '2007–2014', VA: '2014–2021' }, // not confirmed on Wikipedia: GC8, GDB, GRB
    },
    'Toyota': {
        '86': { ZN6: '2012–2021' },
        '4Runner': { N280: '2009–2024' },
        'Camry': { XV70: '2017–2024', XV80: '2024–present' },
        'Corolla': { AE86: '1983–1987', E120: '2000–2007', E210: '2018–present' },
        'GR Corolla': { E210: '2022–present' },
        'GR86': { ZN8: '2021–present' },
        'Land Cruiser': { J80: '1989–1998', J200: '2007–2021', J300: '2021–present' },
        'MR2': { AW11: '1984–1989', SW20: '1989–1999' },
        'Supra': { A70: '1986–1993', A80: '1993–2002', A90: '2019–2026' },
        'Tacoma': { N300: '2015–2023' },
    },
    'Volkswagen': {
        'Golf': { Mk4: '1997–2006', Mk5: '2003–2009', Mk6: '2008–2013', Mk7: '2012–2020', Mk8: '2019–present' },
        'Golf GTI': { Mk5: '2004–2009', Mk6: '2009–2013', Mk7: '2013–2020', Mk8: '2020–present' }, // not confirmed on Wikipedia: Mk5, Mk8
        'Golf R': { Mk6: '2010–2013', Mk7: '2014–2020', Mk8: '2021–present' }, // not confirmed on Wikipedia: Mk6, Mk7, Mk8
        'Jetta GLI': { Mk6: '2012–2018', Mk7: '2019–present' }, // not confirmed on Wikipedia: Mk6
    },
};

// "2000–2006" for BMW / M3 / E46, or null when we don't have it.
export function chassisYears(brand, model, chassis) {
    return CHASSIS_YEARS[brand]?.[model]?.[chassis] ?? null;
}
