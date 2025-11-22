import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Navigation'); // Using Navigation keys for now, can add Footer keys later

    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">DZ Market Plus</h3>
                        <p className="text-gray-400 text-sm">
                            Le meilleur endroit pour acheter et vendre en Algérie.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-gray-400 hover:text-white text-sm">
                                    {t('home')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories" className="text-gray-400 hover:text-white text-sm">
                                    {t('categories')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <p className="text-gray-400 text-sm">
                            Email: support@dzmarket.plus<br />
                            Tél: +213 555 555 555
                        </p>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} DZ Market Plus. Tous droits réservés.
                    </p>
                </div>
            </div>
        </footer>
    );
}
