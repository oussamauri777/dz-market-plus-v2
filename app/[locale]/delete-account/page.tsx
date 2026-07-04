import { Trash2, Smartphone, Mail, HelpCircle, ArrowRight, Shield, FileText } from 'lucide-react';
import Link from 'next/link';

interface Props {
    params: Promise<{ locale: string }>;
}

export default async function DeleteAccountPage({ params }: Props) {
    const { locale } = await params;
    const isAr = locale === 'ar';

    const content = {
        fr: {
            title: "Supprimer mon compte",
            subtitle: "Comment supprimer définitivement votre compte DZ Market Plus",
            intro: "Vous pouvez supprimer votre compte et toutes les données associées directement depuis notre application mobile. Voici comment procéder.",
            steps: [
                {
                    icon: Smartphone,
                    title: "Étape 1 : Ouvrez l'application",
                    text: "Connectez-vous à votre compte DZ Market Plus sur votre téléphone."
                },
                {
                    icon: Smartphone,
                    title: "Étape 2 : Allez dans votre profil",
                    text: "Appuyez sur l'icône de profil en bas de l'écran pour accéder à votre espace personnel."
                },
                {
                    icon: Trash2,
                    title: "Étape 3 : Supprimer votre compte",
                    text: "Faites défiler vers le bas et appuyez sur le bouton 'Supprimer mon compte'. Confirmez votre choix dans la boîte de dialogue."
                }
            ],
            warning: "Une fois votre compte supprimé, toutes vos annonces, messages, et données personnelles seront définitivement effacés. Cette action est irréversible.",
            support: "Si vous rencontrez des difficultés, contactez notre support.",
            supportEmail: "support@dzmarket.plus",
            privacyLink: "Consulter notre politique de confidentialité",
        },
        ar: {
            title: "حذف حسابي",
            subtitle: "كيفية حذف حسابك في DZ Market Plus بشكل نهائي",
            intro: "يمكنك حذف حسابك وجميع البيانات المرتبطة به مباشرة من تطبيق الجوال الخاص بنا. إليك الخطوات.",
            steps: [
                {
                    icon: Smartphone,
                    title: "الخطوة 1: افتح التطبيق",
                    text: "سجل الدخول إلى حسابك في DZ Market Plus على هاتفك."
                },
                {
                    icon: Smartphone,
                    title: "الخطوة 2: اذهب إلى ملفك الشخصي",
                    text: "اضغط على أيقونة الملف الشخصي في أسفل الشاشة للوصول إلى مساحتك الشخصية."
                },
                {
                    icon: Trash2,
                    title: "الخطوة 3: حذف حسابك",
                    text: "مرر لأسفل واضغط على زر 'حذف حسابي'. قم بتأكيد اختيارك في مربع الحوار."
                }
            ],
            warning: "بمجرد حذف حسابك، سيتم مسح جميع إعلاناتك ورسائلك وبياناتك الشخصية بشكل نهائي. هذا الإجراء لا رجعة فيه.",
            support: "إذا واجهت أي صعوبة، يرجى الاتصال بفريق الدعم.",
            supportEmail: "support@dzmarket.plus",
            privacyLink: "اطلع على سياسة الخصوصية",
        }
    };

    const c = isAr ? content.ar : content.fr;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-600 dark:text-red-400 mb-6 shadow-sm border border-red-200 dark:border-red-800">
                        <Trash2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                        {c.title}
                    </h1>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">
                        {c.subtitle}
                    </p>
                    <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        {c.intro}
                    </p>
                </div>

                <div className="space-y-6 mb-10">
                    {c.steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 dark:bg-primary/20 rounded-2xl text-primary flex-shrink-0">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {step.title}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                                            {step.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl p-6 sm:p-8 mb-10">
                    <div className="flex items-start gap-4">
                        <div className="inline-flex items-center justify-center p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400 flex-shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <p className="text-amber-800 dark:text-amber-200 text-sm sm:text-base leading-relaxed font-medium">
                            {c.warning}
                        </p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary to-primary/80 dark:from-primary/20 dark:to-primary/10 rounded-3xl p-8 text-white dark:text-white shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 transform translate-x-10 translate-y-10 opacity-10">
                        <HelpCircle className="w-72 h-72" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-extrabold mb-2">{c.support}</h3>
                        <div className="mt-6">
                            <a
                                href={`mailto:${c.supportEmail}`}
                                className="inline-flex items-center justify-between p-4 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all border border-white/20 w-full sm:w-auto"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <Mail className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-white/70">Email</p>
                                        <p className="text-sm font-bold text-white">{c.supportEmail}</p>
                                    </div>
                                </div>
                                <ArrowRight className={`w-5 h-5 text-white/75 ml-3 ${isAr ? 'rotate-180' : ''}`} />
                            </a>
                        </div>
                        <div className="mt-6">
                            <Link
                                href="/privacy-policy"
                                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm underline underline-offset-2"
                            >
                                <FileText className="w-4 h-4" />
                                {c.privacyLink}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
