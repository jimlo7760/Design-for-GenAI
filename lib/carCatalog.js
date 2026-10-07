// Brand -> model -> chassis codes (the codes enthusiasts use, e.g. "G80" for the M3).
// Chassis is optional in the form, and an empty list means the model has none to pick.
// Cars in the Supabase `Car` table are merged in by withDatabaseCars().
const CATALOG = {
    'Acura': { 'Integra': ['DC2', 'DC5'], 'NSX': ['NA1', 'NC1'], 'TLX': [] },
    'Alfa Romeo': { 'Giulia': ['952'], '4C': [] },
    'Audi': {
        'A3': ['8V', '8Y'],
        'A4': ['B8', 'B9'],
        'R8': ['Type 42', 'Type 4S'],
        'RS3': ['8V', '8Y'],
        'RS5': ['B8', 'B9'],
        'RS6': ['C7', 'C8'],
        'TT': ['8N', '8J', '8S'],
    },
    'BMW': {
        '1 Series': ['E87', 'F20'],
        '3 Series': ['E30', 'E36', 'E46', 'E90', 'F30', 'G20'],
        '5 Series': ['E39', 'E60', 'F10', 'G30'],
        'M2': ['F87', 'G87'],
        'M3': ['E30', 'E36', 'E46', 'E90', 'E92', 'F80', 'G80'],
        'M4': ['F82', 'G82'],
        'M5': ['E39', 'E60', 'F10', 'F90'],
        'X5': ['E53', 'E70', 'F15', 'G05'],
        'Z4': ['E85', 'E89', 'G29'],
    },
    'Chevrolet': {
        'Camaro': ['5th gen', '6th gen'],
        'Corvette': ['C5', 'C6', 'C7', 'C8'],
    },
    'Dodge': { 'Challenger': ['LC'], 'Charger': ['LD', 'LX'] },
    'Ford': {
        'Focus RS': ['Mk2', 'Mk3'],
        'Focus ST': ['Mk2', 'Mk3'],
        'Mustang': ['Fox Body', 'SN95', 'S197', 'S550', 'S650'],
    },
    'Honda': {
        'Civic': ['EG', 'EK', 'FD', 'FC', 'FK7'],
        'Civic Type R': ['EP3', 'FD2', 'FK2', 'FK8', 'FL5'],
        'NSX': ['NA1', 'NC1'],
        'S2000': ['AP1', 'AP2'],
    },
    'Hyundai': { 'Elantra N': ['CN7'], 'Ioniq 5': ['NE'], 'Veloster N': ['JS'] },
    'Jeep': { 'Gladiator': ['JT'], 'Wrangler': ['JK', 'JL'] },
    'Kia': { 'EV6': ['CV'], 'Stinger': ['CK'] },
    'Lexus': {
        'GS': ['S140', 'S160', 'S190', 'L10'],
        'IS': ['XE10', 'XE20', 'XE30'],
        'LC': ['Z100'],
        'LS': ['XF30', 'XF40', 'XF50'],
        'RC': ['XC10'],
    },
    'Mazda': {
        'Mazda3': ['BK', 'BL', 'BM', 'BP'],
        'MX-5 Miata': ['NA', 'NB', 'NC', 'ND'],
        'RX-7': ['FB', 'FC', 'FD'],
        'RX-8': ['SE3P'],
    },
    'Mercedes-Benz': {
        'A45 AMG': ['W176', 'W177'],
        'AMG GT': ['C190', 'R190'],
        'C-Class': ['W203', 'W204', 'W205', 'W206'],
        'C63 AMG': ['W204', 'W205'],
        'E-Class': ['W210', 'W211', 'W212', 'W213'],
        'G-Class': ['W463'],
    },
    'Mitsubishi': { 'Lancer Evolution': ['CN9A', 'CP9A', 'CT9A', 'CZ4A'] },
    'Nissan': {
        '240SX': ['S13', 'S14'],
        '350Z': ['Z33'],
        '370Z': ['Z34'],
        'GT-R': ['R35'],
        'Silvia': ['S13', 'S14', 'S15'],
        'Skyline GT-R': ['R32', 'R33', 'R34'],
        'Z': ['RZ34'],
    },
    'Porsche': {
        '911': ['964', '993', '996', '997', '991', '992'],
        'Boxster': ['986', '987', '981'],
        'Cayman': ['987', '981', '982'],
        'Macan': ['95B'],
        'Taycan': [],
    },
    'Subaru': {
        'BRZ': ['ZC6', 'ZD8'],
        'Impreza': ['GC', 'GD', 'GR'],
        'WRX': ['GD', 'GR', 'VA', 'VB'],
        'WRX STI': ['GC8', 'GDB', 'GRB', 'VA'],
    },
    'Tesla': { 'Model 3': [], 'Model S': [], 'Model X': [], 'Model Y': [] },
    'Toyota': {
        '4Runner': ['N280'],
        'Camry': ['XV70', 'XV80'],
        'Corolla': ['AE86', 'E120', 'E210'],
        'GR Corolla': ['E210'],
        'GR86': ['ZN8'],
        'Land Cruiser': ['J80', 'J200', 'J300'],
        'MR2': ['AW11', 'SW20'],
        'Supra': ['A70', 'A80', 'A90'],
        'Tacoma': ['N300'],
        '86': ['ZN6'],
    },
    'Volkswagen': {
        'Golf': ['Mk4', 'Mk5', 'Mk6', 'Mk7', 'Mk8'],
        'Golf GTI': ['Mk5', 'Mk6', 'Mk7', 'Mk8'],
        'Golf R': ['Mk6', 'Mk7', 'Mk8'],
        'Jetta GLI': ['Mk6', 'Mk7'],
    },
};

const byName = (a, b) => a.localeCompare(b, 'en', { numeric: true });

// Returns { Brand: { Model: [chassis...] } } with the database's cars added and
// everything sorted. `rows` are the Car table rows ({ Brand, Model }).
export function withDatabaseCars(rows = []) {
    const merged = {};
    for (const [brand, models] of Object.entries(CATALOG)) {
        merged[brand] = Object.fromEntries(Object.entries(models).map(([model, chassis]) => [model, [...chassis]]));
    }

    for (const row of rows) {
        const brand = String(row.Brand ?? '').trim();
        const model = String(row.Model ?? '').trim();
        if (!brand || !model) continue;

        // Match the brand and model without caring about capital letters.
        const knownBrand = Object.keys(merged).find((name) => name.toLowerCase() === brand.toLowerCase()) ?? brand;
        merged[knownBrand] ??= {};
        const knownModel = Object.keys(merged[knownBrand]).find((name) => name.toLowerCase() === model.toLowerCase());
        if (!knownModel) merged[knownBrand][model] = [];
    }

    const sorted = {};
    for (const brand of Object.keys(merged).sort(byName)) {
        sorted[brand] = {};
        for (const model of Object.keys(merged[brand]).sort(byName)) sorted[brand][model] = merged[brand][model];
    }
    return sorted;
}
