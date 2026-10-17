// Vetted photos for the Generate page's "Your car" card: one real Wikimedia Commons photo for each
// model and chassis in carCatalog.js. Each was looked at by hand in October 2026 and picked as a
// standard road car of the right generation with a clear view of the outside. The photos are
// hotlinked from Wikimedia, not copied, and shown with their credit and licence.
// Format: 'Brand|Model|Chassis' -> [Commons file name, photographer, licence, thumbnail folder].
// null means we looked and Commons has no good photo of that exact car. Cars that are not listed at
// all (for example ones added to the Supabase `Car` table) get a live search that nobody has checked.
// To change a photo, put another Commons file name here (the folder is the first two characters of
// the MD5 hash of the file name with underscores for spaces).
export const CAR_PHOTOS = {
    'Acura|Integra|DC2': ['1996 Acura Integra LS Sports Coupe, 08-03-2022.jpg', 'MercurySable99', 'CC BY-SA 4.0', '13'],
    'Acura|Integra|DC5': ['2002 Honda Integra (DC5) Special Edition coupe (2015-07-24) 01.jpg', 'OSX', 'Public domain', '8a'],
    'Acura|NSX|NA1': ['Acura NSX (NA1) Washington DC Metro Area, USA (1).jpg', 'OWS Photography', 'CC BY 4.0', '63'],
    'Acura|NSX|NC1': ['Honda NSX (NC1) at TOKYO SUPERCAR DAY 2023 OSAKA COMIC CON.jpg', 'Aos.1905', 'CC BY-SA 4.0', 'a2'],
    'Acura|TLX|': ['2015 Acura TLX (front left).jpg', 'Mr.choppers', 'CC BY-SA 3.0', 'f5'],
    'Alfa Romeo|4C|': ['Alfa Romeo 4C Coupé IMG 7312.jpg', 'Alexander-93', 'CC BY-SA 4.0', '65'],
    'Alfa Romeo|Giulia|952': ['Alfa Romeo Giulia (952) registered summer 2019 02.jpg', 'Charles01', 'CC BY-SA 4.0', '4f'],
    'Audi|A3|8V': ['Audi A3 8V 2014-07-28 08-10-04.jpg', 'Berthold Werner', 'CC BY-SA 3.0', '16'],
    'Audi|A3|8Y': ['2024 Audi A3 8Y Sedan IMG 1019.jpg', 'Alexander-93', 'CC BY-SA 4.0', '67'],
    'Audi|A4|B8': ['AUDI A4L B8 China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'cd'], // A4L, the long-wheelbase China version of the B8
    'Audi|A4|B9': ['2015 Audi A4 B9 3.0 TDI quattro V6 200 kW S line Tangorot Vorderansicht.jpg', 'Kickaffe (Mario von Berg)', 'CC BY-SA 4.0', '11'],
    'Audi|R8|Type 42': ['AUDI R8 (TYPE 42) HONG KONG.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '54'],
    'Audi|R8|Type 4S': ['Audi R8 V10 Type 4S Ibis White (2).jpg', 'Damian B Oh', 'CC BY-SA 4.0', '74'],
    'Audi|RS3|8V': ['Audi RS3 Sedan (8V) Washington DC Metro Area, USA.jpg', 'OWS Photography', 'CC BY 4.0', '3d'],
    'Audi|RS3|8Y': ['2025 Audi RS3 8Y DSC 7846.jpg', 'Alexander Migl', 'CC BY-SA 4.0', '0b'],
    'Audi|RS5|B8': ['Audi RS5 at NAIAS 2012 (6677989859).jpg', 'Autoviva', 'CC BY 2.0', '66'], // red RS5 (8T) at NAIAS 2012, front 3/4
    'Audi|RS5|B9': ['Audi RS5 Coupé (54141069057).jpg', 'Alexandre Prevot from Nancy, France', 'CC BY-SA 2.0', '41'], // red RS5 Coupe (F5), street, front 3/4
    'Audi|RS6|C7': ['Audi rs6 4g c7 2015.jpg', 'Sestmedia', 'CC BY-SA 4.0', 'e4'],
    'Audi|RS6|C8': ['Audi RS6 Avant C8 at IAA 2019 IMG 0194.jpg', 'Alexander Migl', 'CC BY-SA 4.0', 'e9'],
    'Audi|TT|8N': ['2003-2006 Audi TT (8N) 1.8 T coupe (2011-11-08) 01.jpg', 'OSX', 'Public domain', '57'],
    'Audi|TT|8J': ['Audi TT Coupé 2.0 TFSI (8J) – Frontansicht, 19. Mai 2011, Velbert.jpg', 'M 93', 'CC BY-SA 3.0 de', '54'],
    'Audi|TT|8S': ['AUDI TT 8S China (3).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '03'],
    'BMW|1 Series|E87': ['BMW 1 SERIES (E87) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '50'],
    'BMW|1 Series|F20': ['BMW 1 SERIES (F20) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'f9'],
    'BMW|3 Series|E30': ['BMW 3 Series E30 (5457491458).jpg', 'nakhon100', 'CC BY 2.0', '07'],
    'BMW|3 Series|E36': ['BMW 3-Series E36 facelift Kinmen 01 2025-11-14.jpg', 'Randall Ferry', 'CC BY-SA 4.0', '19'],
    'BMW|3 Series|E46': ['2003 (53) BMW 3-Series 320Ci Sport (E46) - 2171cc 2.2 170PS Petrol - 15-04-2025, Front Right.jpg', 'DieselFordMondeo', 'CC BY-SA 4.0', 'd4'],
    'BMW|3 Series|E90': ['BMW 3 SERIES E90 China (3).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '21'],
    'BMW|3 Series|F30': ['BMW 3 SERIES SEDAN (F30) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '64'],
    'BMW|3 Series|G20': ['BMW 3 SERIES SEDAN (G20) China (2).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '85'],
    'BMW|5 Series|E39': ['BMW 5 SERIES (E39) China (3).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '74'],
    'BMW|5 Series|E60': ['BMW 5 SERIES (E60) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'df'],
    'BMW|5 Series|F10': ['BMW 5 SERIES SEDAN (F10) HONG KONG.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '9b'],
    'BMW|5 Series|G30': ['BMW 520d G30 2018.jpg', 'Ethan Llamas', 'CC BY-SA 4.0', 'bf'],
    'BMW|M2|F87': ['BMW M2 F87 2021 (1).jpg', 'Ethan Llamas', 'CC BY-SA 4.0', 'dd'],
    'BMW|M2|G87': ['BMW G87 M2 Motorworld Munich 1X7A0071.jpg', 'Alexander-93', 'CC BY-SA 4.0', 'a0'], // white G87 M2, front 3/4 (was rear 3/4)
    'BMW|M3|E30': ['BMW M3 E30, Pau 2015 2.jpg', 'Handelsgeselschaft', 'CC BY-SA 4.0', '14'],
    'BMW|M3|E36': ['BMW M3 E36 Estoril Blue.jpg', 'Ethan Llamas', 'CC BY-SA 4.0', '4f'],
    'BMW|M3|E46': ['BMW M3 E46 - Flickr - Alexandre Prévot (12).jpg', 'Alexandre Prévot from Nancy, France', 'CC BY-SA 2.0', '72'],
    'BMW|M3|E90': ['2011 BMW M3 E90.jpg', 'MrWalkr', 'CC BY-SA 4.0', '87'],
    'BMW|M3|E92': ['2011 BMW M3 E92, front left, 05-05-2024.jpg', 'Ethan Llamas', 'CC BY-SA 4.0', '16'],
    'BMW|M3|F80': ['BMW M3 F80 at Legendy 2018 in Prague.jpg', 'Jiří Sedláček', 'CC BY-SA 4.0', '94'],
    'BMW|M3|G80': ['BMW M3 Competition (G80) IMG 1176.jpg', 'Alexander-93', 'CC BY-SA 4.0', 'a0'],
    'BMW|M4|F82': ['BMW M4 F82 2015 (1).jpg', 'Ethan Llamas', 'CC BY-SA 4.0', '5c'],
    'BMW|M4|G82': ['BMW M4 (G82) 1X7A0155.jpg', 'Alexander Migl', 'CC BY-SA 4.0', '79'],
    'BMW|M5|E39': ['2002 BMW M5 E39 BS O24.jpg', 'MrWalkr', 'CC BY-SA 4.0', '2a'],
    'BMW|M5|E60': ['BMW M5 E60 Silver Grey Metallic 01.jpg', 'Ethan Llamas', 'CC BY-SA 4.0', 'b3'],
    'BMW|M5|F10': ['BMW M5 (F10) HONG KONG.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'b1'],
    'BMW|M5|F90': ['BMW M5 (F90) 1X7A6242.jpg', 'Alexander Migl', 'CC BY-SA 4.0', 'e1'],
    'BMW|X5|E53': ['2003-2006 BMW X5 (E53) 3.0d 01.jpg', 'OSX', 'Public domain', 'd6'],
    'BMW|X5|E70': ['BMW X5 E70 xDrive30d 2009.jpg', 'Ethan Llamas', 'CC BY-SA 4.0', '0e'],
    'BMW|X5|F15': ['BMW X5 (F15) China (3).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '20'],
    'BMW|X5|G05': ['BMW X5 (G05) China (4).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '24'],
    'BMW|Z4|E85': ['2006 BMW Z4 (E85) 2.5si convertible (2012-10-26) 01.jpg', 'OSX', 'Public domain', 'b9'],
    'BMW|Z4|E89': ['BMW Z4 (E89) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'd9'],
    'BMW|Z4|G29': ['BMW G29 1X7A1570.jpg', 'Alexander-93', 'CC BY-SA 4.0', '12'],
    'Chevrolet|Camaro|5th gen': ['CHEVROLET CAMARO FIFTH GENERATION China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '44'],
    'Chevrolet|Camaro|6th gen': ['CHEVROLET CAMARO SIXTH GENERATION China (6).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '0d'],
    'Chevrolet|Corvette|C5': ['2000 Chevrolet Corvette C5 Roadster.jpg', 'Calreyn88', 'CC BY-SA 4.0', 'a5'],
    'Chevrolet|Corvette|C6': ['Chevrolet Corvette C6 Convertible 2006.jpg', 'Calreyn88', 'CC BY 4.0', 'a0'],
    'Chevrolet|Corvette|C7': ['Chevrolet Corvette C7 Stingray 2019.jpg', 'Ethan Llamas', 'CC BY-SA 4.0', '16'],
    'Chevrolet|Corvette|C8': ['Chevrolet Corvette C8 IAA 2021 1X7A0156.jpg', 'Alexander Migl', 'CC BY-SA 4.0', '4b'],
    'Dodge|Challenger|LC': ['2009 Dodge Challenger SE.jpg', 'IFCAR', 'Public domain', '09'],
    'Dodge|Charger|LD': ['Dodge Charger LD 5.7 Hemi R-T Max V8 Redline 3 Coat Pearl 01.jpg', 'Ethan Llamas', 'CC BY-SA 4.0', '7d'],
    'Dodge|Charger|LX': ['Dodge CHARGER R／T (LX).jpg', 'Tokumeigakarinoaoshima', 'CC BY-SA 4.0', '9c'],
    'Ford|Focus RS|Mk2': ['2009 Ford Focus RS 5.jpg', 'Calreyn88', 'CC BY-SA 4.0', '32'], // white 2009 RS, front 3/4
    'Ford|Focus RS|Mk3': ['Ford Focus RS 2016 (26554115335).jpg', 'Kārlis Dambrāns from Latvia', 'CC BY 2.0', 'ae'], // Nitrous Blue press shot, front 3/4
    'Ford|Focus ST|Mk2': ['Ford Focus ST front 20071112.jpg', 'Rudolf Stricker', 'CC BY-SA 3.0', 'ea'], // orange ST, front 3/4
    'Ford|Focus ST|Mk3': ['2013 Ford Focus ST in Oxford White, Front Right, 03-18-2023.jpg', 'Elise240SX', 'CC BY-SA 4.0', 'b2'], // white 2013 ST, front 3/4
    'Ford|Mustang|Fox Body': ['1988 Ford Mustang GT Convertible (14217307990).jpg', 'Sicnag', 'CC BY 2.0', '0e'],
    'Ford|Mustang|SN95': ['Ford Mustang Convertible SN95 (Cruisin\' At The Boardwalk \'13).JPG', 'Bull-Doser', 'Public domain', '54'],
    'Ford|Mustang|S197': ['Ford Mustang S197 4.6 GT V8 Redfire Metallic 01.jpg', 'Ethan Llamas', 'CC BY-SA 4.0', '9b'],
    'Ford|Mustang|S550': ['Ford Mustang (2015).JPG', 'JoachimKohler-HB', 'CC BY-SA 4.0', 'f0'],
    'Ford|Mustang|S650': ['Ford Mustang S650 2.3 EcoBoost Oxford White 01.jpg', 'Ethan Llamas', 'CC BY-SA 4.0', 'f2'],
    'Honda|Civic|EG': ['Honda Civic (EG) 1.2 LX 1995.jpg', 'Ethan Llamas', 'CC BY-SA 4.0', '26'],
    'Honda|Civic|EK': ['1996 Honda Civic (EK) GLi hatchback (24836306052).jpg', 'Jeremy from Sydney, Australia', 'CC BY 2.0', 'a1'],
    'Honda|Civic|FD': ['2008 Honda Civic (FD) 1.8S 4-door sedan (19699615122).jpg', 'Manoj Prasad from Kuala Lumpur, Malaysia', 'CC BY-SA 2.0', 'c8'],
    'Honda|Civic|FC': ['HONDA CIVIC SEDAN (FC,FK) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'bf'],
    'Honda|Civic|FK7': ['2017 Honda Civic hatchback front 5.26.18.jpg', 'Kevauto', 'CC BY-SA 4.0', '71'], // white 2017 hatchback, front 3/4
    'Honda|Civic Type R|EP3': ['2004 Honda Civic Type R EP3.jpg', 'MrWalkr', 'CC BY-SA 4.0', '36'],
    'Honda|Civic Type R|FD2': ['FD2 Honda Civic Type R in Sham Shui Po.jpg', 'Corsadent56709', 'CC BY-SA 4.0', '8c'],
    'Honda|Civic Type R|FK2': ['Honda CIVIC TYPE R (DBA-FK2) at Suzuka Fan Thanksgiving Day 2016.JPG', 'Tokumeigakarinoaoshima', 'CC BY-SA 4.0', '0b'],
    'Honda|Civic Type R|FK8': ['Osaka Auto Messe 2018 (426) - Honda CIVIC TYPE R (DBA-FK8).jpg', 'Tokumeigakarinoaoshima', 'CC BY-SA 4.0', '94'],
    'Honda|Civic Type R|FL5': ['2024 Honda Civic Type R FL5 in Championship White, front left, 06-30-2024.jpg', 'Ethan Llamas', 'CC BY-SA 4.0', 'a6'],
    'Honda|NSX|NA1': ['1991 Honda NSX (NA1) Coupe.jpg', 'Coolalabright', 'CC BY 4.0', 'eb'],
    'Honda|NSX|NC1': ['Honda NSX (NC1) at TOKYO SUPERCAR DAY 2023 OSAKA COMIC CON.jpg', 'Aos.1905', 'CC BY-SA 4.0', 'a2'],
    'Honda|S2000|AP1': ['Honda S2000 AP1 przód.JPG', 'Lukasz19930915', 'CC BY-SA 3.0', '1a'],
    'Honda|S2000|AP2': ['Honda S2000 AP2 Suzuka Blue Metallic (1).jpg', 'Damian B Oh', 'CC BY-SA 4.0', '8d'],
    'Hyundai|Elantra N|CN7': ['2022 Hyundai Elantra N in Fiery Red, Front Left, 04-18-2022.jpg', 'Elise240SX', 'CC BY-SA 4.0', '82'], // Fiery Red 2022, front 3/4
    'Hyundai|Ioniq 5|NE': ['Hyundai IONIQ 5 NE Lucid Blue Pearl (2).jpg', 'Damian B Oh', 'CC BY-SA 4.0', '24'],
    'Hyundai|Veloster N|JS': ['0 Hyundai Veloster (JS) N 1.jpg', 'Benespit', 'CC BY-SA 4.0', '75'],
    'Jeep|Gladiator|JT': ['Jeep Gladiator (JT) IMG 3988.jpg', 'Alexander Migl', 'CC BY-SA 4.0', 'f7'], // white Willys front 3/4
    'Jeep|Wrangler|JK': ['2012 Jeep Wrangler Unlimited (JK) Front.jpg', 'Koenigseggvibes', 'CC BY-SA 4.0', '81'],
    'Jeep|Wrangler|JL': ['2021 Jeep Wrangler JL two-door Islander 1of3.jpg', 'CZmarlin — Christopher Ziemnowicz — photo credit is required if this image is us', 'CC BY-SA 4.0', '04'],
    'Kia|EV6|CV': ['Kia EV6 CV Glacier (1).jpg', 'Damian B Oh', 'CC BY-SA 4.0', 'ee'],
    'Kia|Stinger|CK': ['Kia Stinger (CK) Washington DC Metro Area, USA.jpg', 'OWS Photography', 'CC BY 4.0', '16'],
    'Lexus|GS|S140': ['Lexus GS S140 01 China 2015-04-13.jpg', 'Navigator84', 'CC BY-SA 4.0', 'a6'],
    'Lexus|GS|S160': ['LEXUS GS (S160) China (4).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'e6'],
    'Lexus|GS|S190': ['LEXUS GS (S190) China (4).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'c7'],
    'Lexus|GS|L10': ['LEXUS GS 300 (L10) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '43'],
    'Lexus|IS|XE10': ['2000 Lexus IS.jpg', 'Calreyn88', 'CC BY-SA 4.0', 'e4'],
    'Lexus|IS|XE20': ['LEXUS IS (XE20) China (3).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'ed'],
    'Lexus|IS|XE30': ['LEXUS IS F SPORT (XE30) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'cd'],
    'Lexus|LC|Z100': ['Lexus LC500 Cabriolet (Z100) Washington DC Metro Area, USA (1).jpg', 'OWS Photography', 'CC BY 4.0', '72'],
    'Lexus|LS|XF30': ['LEXUS LS 430 (XF30) China (5).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '61'],
    'Lexus|LS|XF40': ['LEXUS LS (XF40) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '27'],
    'Lexus|LS|XF50': ['LEXUS LS 500h F-SPORT (XF50) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '77'],
    'Lexus|RC|XC10': ['Lexus RC F (XC10) Washington DC Metro Area, USA (1).jpg', 'OWS Photography', 'CC BY 4.0', '41'],
    'Mazda|Mazda3|BK': ['2007 Mazda3 (BK Series 2) Maxx Sport hatchback (2015-07-10) 01.jpg', 'OSX', 'Public domain', '9f'], // silver hatchback front 3/4
    'Mazda|Mazda3|BL': ['2009 Mazda3 (BL) Neo hatchback (2011-07-17).jpg', 'OSX', 'Public domain', 'c3'], // white hatchback front 3/4
    'Mazda|Mazda3|BM': ['Mazda3 2014 (BM) (cropped).jpg', 'Kārlis Dambrāns', 'CC BY 2.0', 'fd'],
    'Mazda|Mazda3|BP': ['Mazda3 (BP) 1X7A7264.jpg', 'Alexander-93', 'CC BY-SA 4.0', '40'],
    'Mazda|MX-5 Miata|NA': ['1992 Mazda MX 5 Miata (8066699937).jpg', 'free photos & art', 'CC BY 2.0', '07'], // red NA front 3/4
    'Mazda|MX-5 Miata|NB': ['Mazda Roadster MX 5 NB ja -b.jpg', 'S-8500', 'CC BY-SA 3.0', '2c'],
    'Mazda|MX-5 Miata|NC': ['2006 Mazda MX-5 Miata Grand Touring in Marble White, Front Right, 06-08-2023.jpg', 'Elise240SX', 'CC BY-SA 4.0', 'e4'], // 2006 Grand Touring, white
    'Mazda|MX-5 Miata|ND': ['Mazda MX-5 Miata SkyactivG ND Soul Red Crystal Metallic (5).jpg', 'Damian B Oh', 'CC BY-SA 4.0', 'cc'],
    'Mazda|RX-7|FB': ['1984 Mazda RX-7 (FB Series 3) coupe (23525716940).jpg', 'Sicnag', 'CC BY 2.0', 'c7'],
    'Mazda|RX-7|FC': ['1985-1992 Mazda RX-7 FC.jpg', 'Yaktatel', 'Public domain', '02'],
    'Mazda|RX-7|FD': ['1994 Mazda RX-7 FD White (1).jpg', 'Damian B Oh', 'CC BY-SA 4.0', '2b'],
    'Mazda|RX-8|SE3P': ['Mazda RX-8 LA-SE3P Galaxy Gray Mica (4).jpg', 'Damian B Oh', 'CC BY-SA 4.0', '41'], // gray, front 3/4 (night, flash)
    'Mercedes-Benz|A45 AMG|W176': ['2014 Mercedes-Benz A 45 AMG (W 176) 4MATIC hatchback (16412982654).jpg', 'FotoSleuth', 'CC BY 2.0', 'ca'], // white, front 3/4
    'Mercedes-Benz|A45 AMG|W177': ['Mercedes-AMG A45 S 4MATIC+ (W177) front.jpg', 'Tokumeigakarinoaoshima', 'CC BY-SA 4.0', '76'],
    'Mercedes-Benz|AMG GT|C190': ['Mercedes-AMG GT S (C190) Washington DC Metro Area, USA.jpg', 'OWS Photography', 'CC BY 4.0', 'b5'],
    'Mercedes-Benz|AMG GT|R190': ['Mercedes-AMG GT Roadster (R190) front.jpg', 'Tokumeigakarinoaoshima', 'CC BY-SA 4.0', '3b'],
    'Mercedes-Benz|C-Class|W203': ['MERCEDES BENZ C-CLASS (W203) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'a6'],
    'Mercedes-Benz|C-Class|W204': ['Mercedes-Benz C-Class w204 amk.jpg', 'AngMoKio', 'CC BY-SA 3.0', '58'],
    'Mercedes-Benz|C-Class|W205': ['MERCEDES-BENZ C-CLASS LWB SEDAN (W205) China (28).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '43'],
    'Mercedes-Benz|C-Class|W206': ['MERCEDES-BENZ C-CLASS LWB (W206) China (17).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'ac'],
    'Mercedes-Benz|C63 AMG|W204': ['Mercedes-Benz C63 AMG W204 (13010457055).jpg', 'nakhon100', 'CC BY 2.0', 'c1'], // gray, showroom 3/4
    'Mercedes-Benz|C63 AMG|W205': ['Mercedes-AMG C63 S Sedan (W205) Washington DC Metro Area, USA (1).jpg', 'OWS Photography', 'CC BY 4.0', 'ac'],
    'Mercedes-Benz|E-Class|W210': ['Mercedes-Benz E-Class W210.jpg', 'IFCAR', 'Public domain', 'c4'],
    'Mercedes-Benz|E-Class|W211': ['MERCEDES-BENZ E-CLASS (W211) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '7e'],
    'Mercedes-Benz|E-Class|W212': ['MERCEDES-BENZ E-CLASS SEDAN (W212) China (2).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'ea'],
    'Mercedes-Benz|E-Class|W213': ['MERCEDES-BENZ E-CLASS (W213) China (2).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '3a'],
    'Mercedes-Benz|G-Class|W463': ['Mercedes-Benz G-Class W463 facelift China 2012-08-09.jpg', 'Navigator84', 'CC BY-SA 4.0', '69'], // white, front 3/4
    'Mitsubishi|Lancer Evolution|CN9A': ['1996 Mitsubishi Lancer Evolution IV CN9A 01.jpg', 'Guyon', 'CC BY 4.0', '17'],
    'Mitsubishi|Lancer Evolution|CP9A': ['Mitsubishi LANCER GSR EVOLUTION V (GF-CP9A) front.jpg', 'Tokumeigakarinoaoshima', 'CC BY-SA 4.0', '92'],
    'Mitsubishi|Lancer Evolution|CT9A': ['Mitsubishi LANCER EVOLUTION VII GSR (GH-CT9A) front.jpg', 'Tokumeigakarinoaoshima', 'CC BY-SA 4.0', 'f7'],
    'Mitsubishi|Lancer Evolution|CZ4A': ['Mitsubishi LANCER GSR EVOLUTION X (CBA-CZ4A) front.JPG', 'Tokumeigakarinoaoshima', 'CC BY-SA 3.0', '46'],
    'Nissan|240SX|S13': ['1990 240sx Quarter View.JPG', 'The pun stops here', 'CC BY-SA 4.0', '31'],
    'Nissan|240SX|S14': ['Nissan 240SX S14 1.jpg', 'Leg1t', 'CC BY 2.0', 'e8'], // white S14, front 3/4 (was rear)
    'Nissan|350Z|Z33': ['Nissan Z33.jpg', 'Takenet', 'CC BY-SA 3.0', 'f0'], // dark gray, front 3/4
    'Nissan|370Z|Z34': ['Nissan 370Z Z34 2020 (1).jpg', 'Ethan Llamas', 'CC BY-SA 4.0', 'bd'],
    'Nissan|GT-R|R35': ['NISSAN GT-R (R35, 2011 FACELIFT) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'e6'],
    'Nissan|Silvia|S13': ['Nissan S13 Silvia K\'s.jpg', 'TKOIII', 'CC BY 4.0', '0b'], // mint green K's, front 3/4
    'Nissan|Silvia|S14': ['Nissan Silvia Q\'s (E-S14) front.jpg', 'Tokumeigakarinoaoshima', 'CC BY-SA 4.0', '63'], // Q's front 3/4 (was rear 3/4)
    'Nissan|Silvia|S15': ['Nissan Silvia S15 Spec S (1).jpg', 'Ethan Llamas', 'CC BY-SA 4.0', '98'],
    'Nissan|Skyline GT-R|R32': ['1989-1994 Nissan Skyline GT-R R32 - Hong Kong (49121817771).jpg', 'Jones028 from Hong Kong', 'CC BY 2.0', 'ac'],
    'Nissan|Skyline GT-R|R33': ['1997 Nissan Skyline GT-R R33 1FAX775 @ UWA Car Park 9,Crawley.jpg', 'ZidaneHartono', 'CC BY-SA 4.0', '9a'],
    'Nissan|Skyline GT-R|R34': ['2001 Nissan Skyline GT-R V-Spec II R34 (79241).jpg', 'Calreyn88', 'CC BY-SA 4.0', 'cf'],
    'Nissan|Z|RZ34': ['Nissan FAIRLADY Z (Z34) Version ST, 2022, left-front.jpg', 'Kazyakuruma', 'CC BY-SA 4.0', '75'], // yellow, showroom, front 3/4
    'Porsche|911|964': ['Porsche 911 Carrera (964), Bauzeit 1989-94 (2018-06-30 Sp).jpg', 'Lothar Spurzem', 'CC BY-SA 2.0 de', 'df'],
    'Porsche|911|993': ['1996 Porsche 911 993 Carrera 4.jpg', 'Calreyn88', 'CC BY-SA 4.0', 'ce'],
    'Porsche|911|996': ['1999 Porsche 911 996.jpg', 'Calreyn88', 'CC BY-SA 4.0', 'e2'],
    'Porsche|911|997': ['Porsche 997 Carrera (2004) coupes IMG 7311.jpg', 'Alexander-93', 'CC BY-SA 4.0', '09'],
    'Porsche|911|991': ['2013 Porsche 911 Carrera 4S (991) (9626546987).jpg', 'David Villarreal Fernández', 'CC BY-SA 2.0', 'c6'],
    'Porsche|911|992': ['2025 Porsche 992 Turbo S coupes IAA 2025 DSC 1835.jpg', 'Alexander-93', 'CC BY-SA 4.0', '86'],
    'Porsche|Boxster|986': ['1999 Porsche Boxster (986) convertible (26250645992).jpg', 'Jeremy from Sydney, Australia', 'CC BY 2.0', '56'],
    'Porsche|Boxster|987': ['2008 Porsche 987 Boxster (15225082412).jpg', 'free photos & art', 'CC BY 2.0', '58'],
    'Porsche|Boxster|981': ['2012 Porsche Boxster (981) convertible (2012-10-26) 02.jpg', 'OSX', 'Public domain', 'ab'],
    'Porsche|Cayman|987': ['2006 Porsche Cayman (987) S coupe (2015-06-03) 01.jpg', 'OSX', 'Public domain', '78'], // silver Cayman S, front 3/4 (was rear 3/4)
    'Porsche|Cayman|981': ['2014 Porsche 981 Cayman S.jpg', 'Cpl.Winky', 'CC BY-SA 3.0', '71'],
    'Porsche|Cayman|982': ['Porsche 718 Cayman 2020.jpg', 'Ethan Llamas', 'CC BY-SA 4.0', '74'],
    'Porsche|Macan|95B': ['Porsche Macan - Type 95B - Xiamen 01 2024-03-12.jpg', 'Randall Ferry', 'CC BY-SA 4.0', 'f2'],
    'Porsche|Taycan|': ['2024 Porsche Taycan GTS IAA 2025 DSC 1988.jpg', 'Alexander-93', 'CC BY-SA 4.0', '44'], // red GTS, front 3/4
    'Subaru|BRZ|ZC6': ['SUBARU BRZ (ZN6,ZC6) China (2).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'f4'],
    'Subaru|BRZ|ZD8': ['Subaru BRZ S (3BA-ZD8) front.jpg', 'Tokumeigakarinoaoshima', 'CC BY-SA 4.0', '1b'], // blue BRZ S, front 3/4 (was rear 3/4)
    'Subaru|Impreza|GC': ['1995 Subaru Impreza (GC5) GX 2WD sedan (2009-03-13).jpg', 'OSX', 'Public domain', 'ae'], // white GC5 sedan, front 3/4
    'Subaru|Impreza|GD': ['2005 Subaru Impreza (GD9 MY05) GX sedan (2015-07-03) 01.jpg', 'OSX', 'Public domain', '75'], // white 2005 GX sedan, front 3/4 (was rear 3/4)
    'Subaru|Impreza|GR': ['Subaru Impreza WRX STI 3door GR in YMT, Kowloon.jpg', 'Corsadent56709', 'CC BY-SA 4.0', '10'],
    'Subaru|WRX|GD': ['SUBARU IMPREZA WRX (GD, 2002) China (3).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '6b'],
    'Subaru|WRX|GR': ['Subaru Impreza WRX STI 3door GR in YMT, Kowloon.jpg', 'Corsadent56709', 'CC BY-SA 4.0', '10'],
    'Subaru|WRX|VA': ['SUBARU WRX (VA) MACAU.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', 'e2'],
    'Subaru|WRX|VB': ['SUBARU WRX (VB) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '98'],
    'Subaru|WRX STI|GC8': ['Subaru IMPREZA WRX Type RA STi Version IV (E-GC8) front.jpg', 'Tokumeigakarinoaoshima', 'CC BY-SA 4.0', '7d'],
    'Subaru|WRX STI|GDB': ['Subaru IMPREZA WRX STi (GH-GDB) front.jpg', 'Tokumeigakarinoaoshima', 'CC BY-SA 4.0', 'bb'],
    'Subaru|WRX STI|GRB': ['Subaru IMPREZA R205 (CBA-GRB) front.jpg', 'Tokumeigakarinoaoshima', 'CC BY-SA 4.0', '65'], // gray R205, front
    'Subaru|WRX STI|VA': ['Subaru WRX STI (VA) IMG 4317.jpg', 'Alexander Migl', 'CC BY-SA 4.0', '56'],
    'Tesla|Model 3|': ['Tesla Model 3 (2023) Autofrühling Ulm IMG 9282.jpg', 'Alexander-93', 'CC BY-SA 4.0', 'ab'],
    'Tesla|Model S|': ['20180630 Tesla Model S 70D 2015 midnight blue left front.jpg', 'Granada', 'CC BY-SA 4.0', '9f'],
    'Tesla|Model X|': ['Tesla Model X 100D 1X7A6736.jpg', 'Alexander Migl', 'CC BY-SA 4.0', 'c6'],
    'Tesla|Model Y|': ['Tesla Model Y 1X7A6211.jpg', 'Alexander Migl', 'CC BY-SA 4.0', '5c'],
    'Toyota|86|ZN6': ['TOYOTA 86 (ZN6,ZC6) MACAU.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '91'],
    'Toyota|4Runner|N280': ['2017 Toyota 4Runner (N280) DSC 2927.jpg', 'Alexander Migl', 'CC BY-SA 4.0', '70'],
    'Toyota|Camry|XV70': ['TOYOTA CAMRY (XV70) China (3).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '89'],
    'Toyota|Camry|XV80': ['TOYOTA CAMRY (XV80) China (32).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '62'],
    'Toyota|Corolla|AE86': ['Toyota Corolla Sport AE86 Liftback (1).jpg', 'Ethan Llamas', 'CC BY-SA 4.0', 'bf'],
    'Toyota|Corolla|E120': ['Toyota Corolla E120 hatchback 1598cc registered January 2007.jpg', 'Charles01', 'CC BY-SA 4.0', 'a8'],
    'Toyota|Corolla|E210': ['2023 Toyota Corolla Hybrid (E210) hatchback IMG 9884.jpg', 'Alexander-93', 'CC BY-SA 4.0', 'a5'],
    'Toyota|GR Corolla|E210': ['Toyota GR Corolla (E210) Washington DC Metro Area, USA.jpg', 'OWS Photography', 'CC BY 4.0', '10'], // black, front
    'Toyota|GR86|ZN8': ['Toyota GR86 2.4 6MT Premium ZN8 Crystal Black Silica (7).jpg', 'Damian B Oh', 'CC BY-SA 4.0', '5c'],
    'Toyota|Land Cruiser|J80': ['Toyota Land Cruiser J80 VX 4x4 1995 (1).jpg', 'Ethan Llamas', 'CC BY-SA 4.0', 'e5'], // beige VX 1995, front 3/4 (was a rear view)
    'Toyota|Land Cruiser|J200': ['2020 Toyota Land Cruiser J200 4.5 Platinum Edition V8 (1).jpg', 'Ethan Llamas', 'CC BY-SA 4.0', '3c'],
    'Toyota|Land Cruiser|J300': ['Toyota Land Cruiser J300 3.3 ZX 2022 (1).jpg', 'Ethan Llamas', 'CC BY-SA 4.0', '9a'],
    'Toyota|MR2|AW11': ['1987 Toyota MR2 AW11.jpg', 'SealyPhoto', 'CC BY-SA 4.0', 'fb'],
    'Toyota|MR2|SW20': ['1989-1991 Toyota MR2 (SW20) G-Limited coupe (13813691874).jpg', 'FotoSleuth', 'CC BY 2.0', '31'],
    'Toyota|Supra|A70': ['Toyota Supra (A70, pre-facelift) 1X7A2552.jpg', 'Alexander-93', 'CC BY-SA 4.0', '8d'],
    'Toyota|Supra|A80': ['Toyota Supra A80, Bangladesh. (33381482523).jpg', 'Shadman Samee from Dhaka, Bangladesh', 'CC BY-SA 2.0', 'd5'], // silver, street, front 3/4
    'Toyota|Supra|A90': ['2019 Toyota Supra A90 Pro Auto.jpg', 'Calreyn88', 'CC BY-SA 4.0', '95'], // white 2019, front 3/4
    'Toyota|Tacoma|N300': ['Toyota Tacoma (N300) TRD 1X7A2437.jpg', 'Alexander-93', 'CC BY-SA 4.0', '24'],
    'Volkswagen|Golf|Mk4': ['VOLKSWAGEN GOLF 5 DOOR Mk4 China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '97'],
    'Volkswagen|Golf|Mk5': ['Volkswagen Golf MK5 3-door Taiwan 001.jpg', 'Jengtingchen', 'CC BY-SA 4.0', 'cd'],
    'Volkswagen|Golf|Mk6': ['VOLKSWAGEN GOLF (Mk6 A6 Typ 5K) China (8).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '1a'],
    'Volkswagen|Golf|Mk7': ['VOLKSWAGEN GOLF (Mk7, Typ 5G) China (38).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '0f'],
    'Volkswagen|Golf|Mk8': ['VOLKSWAGEN GOLF (Mk8 CD1) China (2).jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '44'],
    'Volkswagen|Golf GTI|Mk5': ['Volkswagen Golf GTI Mk5 Candy White (1).jpg', 'Damian B Oh', 'CC BY-SA 4.0', '8d'],
    'Volkswagen|Golf GTI|Mk6': ['Volkswagen Golf GTI Mk6 Candy White (3).jpg', 'Damian B Oh', 'CC BY-SA 4.0', 'da'],
    'Volkswagen|Golf GTI|Mk7': ['Volkswagen Golf GTI Mk7 2017.jpg', 'Ethan Llamas', 'CC BY-SA 4.0', '44'],
    'Volkswagen|Golf GTI|Mk8': ['VOLKSWAGEN GOLF GTI (Mk8 CD1) China.jpg', 'Dinkun Chen', 'CC BY-SA 4.0', '2a'],
    'Volkswagen|Golf R|Mk6': ['4 Door Volkswagen Golf R mk6.jpg', 'Ferry1405', 'CC BY 4.0', '61'],
    'Volkswagen|Golf R|Mk7': ['Osaka Motor Show 2015 (338) - Volkswagen Golf R (ABA-AUCJXF).JPG', 'Tokumeigakarinoaoshima', 'CC BY-SA 4.0', 'b4'], // blue Golf R hatchback (Osaka show), front; #5 was the Variant wagon
    'Volkswagen|Golf R|Mk8': ['2022 Volkswagen Golf R in Pure White, front left, 2025-04-24.jpg', 'Elise240SX', 'CC BY-SA 4.0', '31'], // white 2022 Golf R, front 3/4
    'Volkswagen|Jetta GLI|Mk6': ['2012 Volkswagen Jetta GLI -- 2012 DC.JPG', 'IFCAR', 'Public domain', 'd4'], // silver 2012 GLI, show, front 3/4
    'Volkswagen|Jetta GLI|Mk7': ['Volkswagen Jetta VII GLI IMG 3138.jpg', 'Alexander Migl', 'CC BY-SA 4.0', 'dc'], // gray Jetta VII GLI, front 3/4 (copied from Mk6 search)
};

// Wikimedia only serves thumbnails at a few standard widths; any other size gets refused.
const THUMB_WIDTHS = [500, 960, 1280, 1920];
const DEFAULT_WIDTH = 500; // the Generate page's preview card; builds use 960 (see app/actions.js)

function toPhoto([file, credit, license, folder], width) {
    const name = encodeURIComponent(file.replace(/ /g, '_'));
    return {
        url: `https://thumb.wikimedia.org/wikipedia/commons/thumb/${folder[0]}/${folder}/${name}/${width}px-${name}`,
        sourceUrl: `https://commons.wikimedia.org/wiki/File:${name}`,
        credit,
        license,
    };
}

// { url, sourceUrl, credit, license } for this exact car, null when we checked and have none, or
// undefined when this car was never checked. Leave chassis empty for a model with no chassis list.
// width is the thumbnail size in pixels: 500 (the default), 960, 1280 or 1920.
export function pinnedPhoto(brand, model, chassis = '', width = DEFAULT_WIDTH) {
    if (!THUMB_WIDTHS.includes(width)) throw new RangeError(`Wikimedia has no ${width}px thumbnail; use ${THUMB_WIDTHS.join(', ')}`);
    const entry = CAR_PHOTOS[`${brand}|${model}|${chassis}`];
    if (entry === undefined) return undefined;
    return entry === null ? null : toPhoto(entry, width);
}

// For a model with several generations and none picked yet: the newest one we have a photo of,
// as { photo, chassis }, or null if we have none. width works as in pinnedPhoto.
export function examplePhoto(brand, model, chassisCodes, width) {
    for (const chassis of [...chassisCodes].reverse()) {
        const photo = pinnedPhoto(brand, model, chassis, width);
        if (photo) return { photo, chassis };
    }
    return null;
}
