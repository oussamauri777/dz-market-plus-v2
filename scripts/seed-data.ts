import dotenv from 'dotenv';
import path from 'path';

// Load .env.local explicitly BEFORE importing other modules
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedData() {
    try {
        // Dynamic imports to ensure env vars are loaded first
        const { default: dbConnect } = await import('../lib/db');
        const { default: User } = await import('../models/User');
        const { default: Ad } = await import('../models/Ad');
        const bcrypt = await import('bcryptjs');

        await dbConnect();
        console.log('Connected to DB');

        // 1. Create 4 Users
        const usersData = [
            { name: 'Amine Tech', email: 'amine@test.com', password: 'password123', role: 'user', phone: '0550112233', wilaya: 'Alger' },
            { name: 'Sarah Mode', email: 'sarah@test.com', password: 'password123', role: 'user', phone: '0660445566', wilaya: 'Oran' },
            { name: 'Karim Auto', email: 'karim@test.com', password: 'password123', role: 'user', phone: '0770778899', wilaya: 'Setif' },
            { name: 'Nadia Home', email: 'nadia@test.com', password: 'password123', role: 'user', phone: '0555001122', wilaya: 'Constantine' }
        ];

        const createdUsers = [];
        for (const userData of usersData) {
            let user = await User.findOne({ email: userData.email });
            if (!user) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                user = await User.create({ ...userData, password: hashedPassword });
                console.log(`Created user: ${user.name}`);
            } else {
                console.log(`User already exists: ${user.name}`);
            }
            createdUsers.push(user);
        }

        // 2. Create 20 Ads with REAL Images (Unsplash)
        const adsData = [
            // Electronics (Amine)
            {
                title: 'MacBook Pro M1 2020 16GB 512GB',
                description: 'MacBook Pro en excellent état, batterie 95%, avec chargeur original. Idéal pour le développement et le montage vidéo.',
                price: 180000,
                category: 'Informatique',
                subcategory: 'Ordinateurs portables',
                condition: 'good',
                wilaya: 'Alger',
                userIndex: 0,
                images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'iPhone 13 Pro Max 256GB Bleu Alpin',
                description: 'Téléphone très propre, jamais ouvert, batterie 89%. Vendu avec boîte et câble.',
                price: 145000,
                category: 'Téléphones',
                subcategory: 'Téléphones portables',
                condition: 'good',
                wilaya: 'Alger',
                userIndex: 0,
                images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'PC Gamer RTX 3060 i5 12400F',
                description: 'Unité centrale gaming puissante. Carte graphique RTX 3060 12GB, 16GB RAM, SSD 1TB. Fait tourner tous les jeux récents.',
                price: 120000,
                category: 'Informatique',
                subcategory: 'Ordinateurs de bureau',
                condition: 'good',
                wilaya: 'Alger',
                userIndex: 0,
                images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Sony PlayStation 5 Édition Standard',
                description: 'PS5 avec lecteur disque, 2 manettes DualSense, FIFA 24 inclus. Peu utilisée.',
                price: 95000,
                category: 'Jeux vidéo',
                subcategory: 'Consoles',
                condition: 'like-new',
                wilaya: 'Alger',
                userIndex: 0,
                images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Casque Sony WH-1000XM4',
                description: 'Casque à réduction de bruit active, qualité sonore incroyable. Batterie longue durée.',
                price: 35000,
                category: 'Informatique',
                subcategory: 'Accessoires',
                condition: 'good',
                wilaya: 'Alger',
                userIndex: 0,
                images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop']
            },

            // Fashion (Sarah)
            {
                title: 'Robe de soirée rouge élégante',
                description: 'Robe longue rouge, portée une seule fois pour un mariage. Taille M (38-40). Tissu de haute qualité.',
                price: 12000,
                category: 'Vêtements',
                subcategory: 'Femmes',
                condition: 'like-new',
                wilaya: 'Oran',
                userIndex: 1,
                images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Sac à main Louis Vuitton original',
                description: 'Sac authentique avec certificat. Quelques traces d\'usure légères. Modèle classique.',
                price: 85000,
                category: 'Accessoires',
                subcategory: 'Sacs',
                condition: 'good',
                wilaya: 'Oran',
                userIndex: 1,
                images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Chaussures Nike Air Jordan 1 High',
                description: 'Baskets Jordan 1 Retro High OG, taille 42. Neuves jamais portées, dans la boîte.',
                price: 28000,
                category: 'Chaussures',
                subcategory: 'Hommes',
                condition: 'new',
                wilaya: 'Oran',
                userIndex: 1,
                images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Manteau d\'hiver Zara beige',
                description: 'Manteau long en laine, très chaud et stylé. Taille L. Parfait pour l\'hiver.',
                price: 15000,
                category: 'Vêtements',
                subcategory: 'Femmes',
                condition: 'good',
                wilaya: 'Oran',
                userIndex: 1,
                images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Montre Rolex Submariner (Réplique 1er choix)',
                description: 'Montre automatique de très haute qualité, verre saphir, acier inoxydable. Mouvement suisse.',
                price: 45000,
                category: 'Accessoires',
                subcategory: 'Montres',
                condition: 'new',
                wilaya: 'Oran',
                userIndex: 1,
                images: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000&auto=format&fit=crop']
            },

            // Vehicles (Karim)
            {
                title: 'Volkswagen Golf 7 GTD 2018',
                description: 'Golf 7 GTD, toit ouvrant, boîte DSG, jantes 18 pouces. 120,000 km. Entretien à jour.',
                price: 4200000,
                category: 'Véhicules',
                subcategory: 'Voitures',
                condition: 'good',
                wilaya: 'Setif',
                userIndex: 2,
                images: ['https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Scooter Yamaha TMAX 560 2022',
                description: 'TMAX 560 Tech Max, full options, pot Akrapovic. 5000 km seulement. État neuf.',
                price: 2600000,
                category: 'Véhicules',
                subcategory: 'Motos',
                condition: 'like-new',
                wilaya: 'Setif',
                userIndex: 2,
                images: ['https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Peugeot 208 HDI 2015',
                description: 'Peugeot 208 diesel, économique, propre. Quelques égratignures sur le pare-choc. Moteur impeccable.',
                price: 1650000,
                category: 'Véhicules',
                subcategory: 'Voitures',
                condition: 'fair',
                wilaya: 'Setif',
                userIndex: 2,
                images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Pneus Michelin 205/55 R16',
                description: '4 pneus Michelin Primacy 4, roulés 5000 km. Très bon état.',
                price: 32000,
                category: 'Véhicules',
                subcategory: 'Pièces détachées',
                condition: 'good',
                wilaya: 'Setif',
                userIndex: 2,
                images: ['https://images.unsplash.com/photo-1578844251758-2f71da645217?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Camion Isuzu NPR 2019',
                description: 'Camion frigo en très bon état de marche. Prêt à travailler. 150,000 km.',
                price: 3800000,
                category: 'Véhicules',
                subcategory: 'Camions',
                condition: 'good',
                wilaya: 'Setif',
                userIndex: 2,
                images: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1000&auto=format&fit=crop']
            },

            // Home & Garden (Nadia)
            {
                title: 'Salon marocain moderne 3 pièces',
                description: 'Grand salon confortable avec table basse. Tissu anti-tache. Bois rouge.',
                price: 85000,
                category: 'Maison',
                subcategory: 'Meubles',
                condition: 'good',
                wilaya: 'Constantine',
                userIndex: 3,
                images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Appartement F3 à Nouvelle Ville',
                description: 'Bel appartement F3 ensoleillé, 3ème étage, acte et livret foncier. Quartier calme et sécurisé.',
                price: 12000000,
                category: 'Immobilier',
                subcategory: 'Vente Appartements',
                condition: 'good',
                wilaya: 'Constantine',
                userIndex: 3,
                images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Réfrigérateur LG Double Porte',
                description: 'Grand frigo américain LG, gris métallisé. Fonctionne parfaitement. Distributeur d\'eau et glaçons.',
                price: 110000,
                category: 'Electroménager',
                subcategory: 'Réfrigérateurs',
                condition: 'good',
                wilaya: 'Constantine',
                userIndex: 3,
                images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Machine à laver Samsung 10kg',
                description: 'Machine à laver EcoBubble, 10kg. Très silencieuse et économique.',
                price: 65000,
                category: 'Electroménager',
                subcategory: 'Lave-linge',
                condition: 'like-new',
                wilaya: 'Constantine',
                userIndex: 3,
                images: ['https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=1000&auto=format&fit=crop']
            },
            {
                title: 'Table à manger 6 chaises',
                description: 'Table en verre trempé avec 6 chaises en cuir noir. Design moderne.',
                price: 42000,
                category: 'Maison',
                subcategory: 'Meubles',
                condition: 'good',
                wilaya: 'Constantine',
                userIndex: 3,
                images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1000&auto=format&fit=crop']
            }
        ];

        for (const adData of adsData) {
            const user = createdUsers[adData.userIndex];
            // Check if ad exists (simple check by title)
            const existingAd = await Ad.findOne({ title: adData.title });

            if (!existingAd) {
                await Ad.create({
                    ...adData,
                    user: user._id,
                    status: 'active',
                    location: {
                        address: adData.wilaya,
                        wilaya: adData.wilaya,
                        commune: 'Centre',
                        latitude: 36.75, // Approx
                        longitude: 3.05  // Approx
                    }
                });
                console.log(`Created ad: ${adData.title}`);
            } else {
                // Update images for existing ads
                existingAd.images = adData.images;
                await existingAd.save();
                console.log(`Updated images for existing ad: ${adData.title}`);
            }
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
}

seedData();
