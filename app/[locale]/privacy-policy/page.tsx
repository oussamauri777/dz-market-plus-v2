import { Shield, Eye, Lock, FileText, UserCheck, Mail, ArrowRight, HelpCircle, Phone } from 'lucide-react';

interface Props {
    params: Promise<{ locale: string }>;
}

export default async function PrivacyPolicyPage({ params }: Props) {
    const { locale } = await params;
    const isAr = locale === 'ar';

    const content = {
        fr: {
            title: "Politique de Confidentialité",
            subtitle: "Dernière mise à jour : 4 juillet 2026",
            intro: "Chez DZ Market Plus, nous accordons une importance primordiale à la protection de vos données personnelles. Cette politique de confidentialité détaille les informations que nous collectons, la manière dont nous les utilisons et les mesures que nous prenons pour assurer leur sécurité.",
            sections: [
                {
                    id: "collecte",
                    icon: Eye,
                    title: "1. Collecte des données",
                    text: "Nous collectons des informations lorsque vous utilisez notre plateforme, notamment lors de la création de votre compte (nom, adresse e-mail, numéro de téléphone, wilaya de résidence), de la publication d'annonces (titres, descriptions, photos, prix) et de vos échanges via notre messagerie interne."
                },
                {
                    id: "utilisation",
                    icon: FileText,
                    title: "2. Utilisation des données",
                    text: "Vos informations sont utilisées pour fournir et améliorer nos services : gestion de votre compte, publication et mise en avant de vos annonces, facilitation de la mise en relation sécurisée entre acheteurs et vendeurs, lutte contre la fraude et personnalisation de votre expérience sur notre application."
                },
                {
                    id: "partage",
                    icon: Lock,
                    title: "3. Partage et visibilité des données",
                    text: "Les informations de vos annonces et votre profil public sont visibles par tous les visiteurs de la plateforme. Votre numéro de téléphone n'est affiché qu'avec votre accord explicite pour faciliter les contacts. Nous ne vendons, n'échangeons ni ne louons vos données personnelles à des tiers à des fins de marketing sans votre consentement."
                },
                {
                    id: "securite",
                    icon: Shield,
                    title: "4. Securité des informations",
                    text: "Nous mettons en œuvre des mesures de sécurité techniques (chiffrement, pare-feu, serveurs sécurisés) et organisationnelles pour protéger vos données contre la perte, le vol, l'utilisation abusive et l'accès non autorisé."
                },
                {
                    id: "droits",
                    icon: UserCheck,
                    title: "5. Vos droits sur vos données",
                    text: "Vous disposez d'un contrôle total sur vos données. Vous pouvez modifier vos informations personnelles et vos annonces directement depuis votre espace personnel. Vous pouvez également demander la suppression définitive de votre compte et des données associées en contactant notre service support."
                },
                {
                    id: "contact",
                    icon: Mail,
                    title: "6. Contact et assistance",
                    text: "Pour toute question, suggestion ou réclamation concernant la gestion de vos données personnelles ou pour exercer vos droits, n'hésitez pas à nous contacter directement par e-mail ou par téléphone."
                }
            ],
            contactTitle: "Besoin d'aide ?",
            contactText: "Notre équipe est à votre disposition pour vous aider et répondre à toutes vos questions concernant vos données personnelles.",
            emailLabel: "Envoyez-nous un e-mail",
            phoneLabel: "Appelez-nous"
        },
        ar: {
            title: "سياسة الخصوصية",
            subtitle: "آخر تحديث: 4 يوليو 2026",
            intro: "في DZ Market Plus، نولي أهمية قصوى لحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه نوعية المعلومات التي نجمعها، وكيفية استخدامها، والإجراءات التي نتخذها لضمان سلامتها وأمنها.",
            sections: [
                {
                    id: "collecte",
                    icon: Eye,
                    title: "1. جمع البيانات",
                    text: "نقوم بجمع المعلومات عند استخدامك لمنصتنا، لا سيما عند إنشاء حسابك (الاسم، البريد الإلكتروني، رقم الهاتف، ولاية الإقامة)، وعند نشر الإعلانات (العناوين، الأوصاف، الصور، الأسعار) ومن خلال تواصلك عبر نظام الرسائل الداخلي لدينا."
                },
                {
                    id: "utilisation",
                    icon: FileText,
                    title: "2. استخدام البيانات",
                    text: "تُستخدم معلوماتك لتقديم خدماتنا وتحسينها: إدارة حسابك، ونشر إعلاناتك وإبرازها، وتسهيل التواصل الآمن بين المشترين والبائعين، ومكافحة الاحتيال وتخصيص تجربتك على تطبيقنا."
                },
                {
                    id: "partage",
                    icon: Lock,
                    title: "3. مشاركة ورؤية البيانات",
                    text: "تكون معلومات إعلاناتك وملفك الشخصي العام مرئية لجميع زوار المنصة. لا يتم عرض رقم هاتفك إلا بموافقتك الصريحة لتسهيل التواصل. نحن لا نبيع أو نتبادل أو نؤجر بياناتك الشخصية لأطراف ثالثة لأغراض تسويقية دون موافقتك."
                },
                {
                    id: "securite",
                    icon: Shield,
                    title: "4. أمن المعلومات",
                    text: "نحن نطبق تدابير أمنية تقنية (التشفير، جدران الحماية، الخوادم الآمنة) وتنظيمية لحماية بياناتك من الفقدان، أو السرقة، أو إساءة الاستخدام، أو الوصول غير المصرح به."
                },
                {
                    id: "droits",
                    icon: UserCheck,
                    title: "5. حقوقك في بياناتك",
                    text: "لديك تحكم كامل في بياناتك. يمكنك تعديل معلوماتك الشخصية وإعلاناتك مباشرة من حسابك الشخصي. يمكنك أيضاً طلب الحذف النهائي لحسابك والبيانات المرتبطة به عن طريق الاتصال بفريق الدعم لدينا."
                },
                {
                    id: "contact",
                    icon: Mail,
                    title: "6. الاتصال والمساعدة",
                    text: "لأي سؤال أو اقتراح أو شكوى بخصوص إدارة بياناتك الشخصية أو لممارسة حقوقك، لا تتردد في الاتصال بنا مباشرة عبر البريد الإلكتروني أو الهاتف."
                }
            ],
            contactTitle: "هل تحتاج إلى مساعدة؟",
            contactText: "فريقنا متواجد دائماً لمساعدتك والإجابة على جميع استفساراتك المتعلقة ببياناتك الشخصية.",
            emailLabel: "أرسل لنا بريداً إلكترونياً",
            phoneLabel: "اتصل بنا"
        }
    };

    const currentContent = isAr ? content.ar : content.fr;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-6xl mx-auto">
                {/* Hero Header */}
                <div className="text-center mb-16 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-5">
                        <Shield className="w-64 h-64 text-primary" />
                    </div>
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-6 shadow-sm border border-primary/20">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                        {currentContent.title}
                    </h1>
                    <p className="text-sm font-medium text-primary uppercase tracking-wider">
                        {currentContent.subtitle}
                    </p>
                    <p className="mt-6 max-w-3xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        {currentContent.intro}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Quick navigation index for desktop */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                                {isAr ? "فهرس المحتويات" : "Sommaire"}
                            </h3>
                            <nav className="space-y-2">
                                {currentContent.sections.map((section) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className="group flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors py-2 font-medium"
                                    >
                                        <section.icon className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
                                        <span className="truncate">{section.title.split('. ')[1]}</span>
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main content sections */}
                    <div className="col-span-1 lg:col-span-3 space-y-8">
                        <div className="space-y-6">
                            {currentContent.sections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <div
                                        key={section.id}
                                        id={section.id}
                                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all scroll-mt-6"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                                            <div className="inline-flex items-center justify-center p-3 bg-primary/10 dark:bg-primary/20 rounded-2xl text-primary flex-shrink-0 self-start">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-2 flex-grow">
                                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                                    {section.title}
                                                </h2>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                                                    {section.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Contact Widget */}
                        <div className="bg-gradient-to-br from-primary to-primary/80 dark:from-primary/20 dark:to-primary/10 rounded-3xl p-8 text-white dark:text-white shadow-xl relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 transform translate-x-10 translate-y-10 opacity-10">
                                <HelpCircle className="w-72 h-72" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-extrabold mb-2">{currentContent.contactTitle}</h3>
                                <p className="text-white/90 dark:text-gray-300 text-sm sm:text-base mb-6 max-w-xl">
                                    {currentContent.contactText}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <a
                                        href="mailto:support@dzmarket.plus"
                                        className="flex items-center justify-between p-4 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all border border-white/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/20 rounded-xl">
                                                <Mail className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs text-white/70">{currentContent.emailLabel}</p>
                                                <p className="text-sm font-bold text-white">support@dzmarket.plus</p>
                                            </div>
                                        </div>
                                        <ArrowRight className={`w-5 h-5 text-white/75 ${isAr ? 'rotate-180' : ''}`} />
                                    </a>

                                    <a
                                        href="tel:+213555555555"
                                        className="flex items-center justify-between p-4 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all border border-white/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/20 rounded-xl">
                                                <Phone className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs text-white/70">{currentContent.phoneLabel}</p>
                                                <p className="text-sm font-bold text-white" dir="ltr">+213 555 555 555</p>
                                            </div>
                                        </div>
                                        <ArrowRight className={`w-5 h-5 text-white/75 ${isAr ? 'rotate-180' : ''}`} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
