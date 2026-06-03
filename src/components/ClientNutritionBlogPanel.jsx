import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ChevronDown, ChevronUp, Utensils, Leaf, Scale, AlertCircle } from 'lucide-react';
import { getPublishedBlogArticles } from '../services/blogArticleService';
import '../pages/ClientComplaintsPage.css';

const PET_TYPES = [
  { id: 'dog', label: 'Chien', emoji: '🐶' },
  { id: 'cat', label: 'Chat', emoji: '🐱' },
  { id: 'bird', label: 'Oiseau', emoji: '🐦' },
  { id: 'rabbit', label: 'Lapin / NAC', emoji: '🐰' },
];

const NUTRITION_TIPS = {
  dog: [
    {
      title: 'Protéines & croquettes',
      text: 'Choisissez une alimentation avec au moins 25 % de protéines animales. Adaptez les rations au poids, à l’âge et au niveau d’activité.',
      tag: 'Essentiel',
    },
    {
      title: 'Fréquence des repas',
      text: '2 repas par jour pour un adulte. Chiot : 3 à 4 repas jusqu’à 6 mois. Évitez de laisser la gamelle en libre-service si votre chien tend à surpoids.',
      tag: 'Routine',
    },
    {
      title: 'Aliments interdits',
      text: 'Chocolat, oignon, ail, raisin, xylitol et os cuits — très dangereux. Privilégiez les friandises spécifiques chien.',
      tag: 'Sécurité',
    },
    {
      title: 'Transition alimentaire',
      text: 'Mélangez progressivement l’ancienne et la nouvelle nourriture sur 7 à 10 jours pour éviter troubles digestifs.',
      tag: 'Conseil pro',
    },
  ],
  cat: [
    {
      title: 'Carnivore strict',
      text: 'Minimum 26 % de protéines animales et taurine suffisante. Les croquettes « chat » ne sont pas interchangeables avec celles pour chien.',
      tag: 'Essentiel',
    },
    {
      title: 'Hydratation & pâtée',
      text: 'Associez croquettes et pâtée humide pour augmenter l’apport en eau. Une fontaine encourage la consommation.',
      tag: 'Hydratation',
    },
    {
      title: 'Contrôle du poids',
      text: 'Surpoids = risque de diabète et troubles urinaires. Mesurez les rations et limitez les friandises à moins de 10 % de l’apport calorique.',
      tag: 'Santé',
    },
    {
      title: 'Chat stérilisé',
      text: 'Formules « stérilisé » : moins caloriques, adaptées au métabolisme ralenti après castration.',
      tag: 'Spécifique',
    },
  ],
  bird: [
    {
      title: 'Mélange de graines',
      text: 'Base de graines de qualité + compléments (légumes, fruits sans pépins). Évitez avocat et aliments salés.',
      tag: 'Essentiel',
    },
    {
      title: 'Calcium & vitamines',
      text: 'Os de seiche pour les oiseaux granivores. Suppléments uniquement sur avis vétérinaire NAC.',
      tag: 'Compléments',
    },
    {
      title: 'Rythme alimentaire',
      text: 'Petit-déjeuner tôt, gamelle retirée en fin de matinée pour éviter le gaspillage et garder l’appétit.',
      tag: 'Routine',
    },
  ],
  rabbit: [
    {
      title: 'Foin à volonté',
      text: 'Le foin de qualité doit représenter 80 % de l’alimentation. Essentiel pour les dents et le transit.',
      tag: 'Essentiel',
    },
    {
      title: 'Légumes frais',
      text: 'Introduisez progressivement : feuilles de laitue romaine, persil, endive. Limitez carotte et fruits (sucre).',
      tag: 'Frais',
    },
    {
      title: 'Granulés',
      text: 'Une petite quantité de granulés spécifiques lapin par jour — pas de mélange pour rongeurs générique.',
      tag: 'Ration',
    },
  ],
};

const BLOG_POSTS = [
  {
    id: 'c1',
    title: 'Comment lire l’étiquette d’un sac de croquettes ?',
    category: 'Guide',
    readMin: 5,
    date: '2026-04-12',
    excerpt: 'Protéines brutes, matières grasses, cendres… Décryptage des mentions obligatoires pour choisir en confiance.',
    body: `Les étiquettes listent les ingrédients par ordre décroissant de poids. Un bon produit place une source animale claire (poulet, saumon, agneau) en tête de liste.

Repérez la mention « aliment complet » : il couvre tous les besoins nutritionnels sans complément obligatoire. Comparez les protéines brutes (idéalement 25–30 % pour chien actif, 30 %+ pour chat).

Méfiez-vous des termes vagues (« sous-produits animaux » sans précision). Préférez les marques transparentes sur l’origine et les analyses garanties.`,
  },
  {
    id: 'c2',
    title: 'Chien senior : adapter l’alimentation après 7 ans',
    category: 'Chien',
    readMin: 4,
    date: '2026-03-28',
    excerpt: 'Moins de calories, plus de fibres et de soutien articulaire — les bons réflexes pour votre compagnon âgé.',
    body: `Le métabolisme ralentit : réduisez les calories de 10 à 20 % si l’animal prend du poids. Formules « senior » enrichies en glucosamine et acides gras oméga-3.

Fractionnez en 2–3 petits repas pour faciliter la digestion. Surveillez l’appétit : baisse soudaine = consultez le vétérinaire.

Hydratation : pâtée ou croquettes humidifiées si votre chien boit peu.`,
  },
  {
    id: 'c3',
    title: 'Chat d’intérieur : éviter le surpoids',
    category: 'Chat',
    readMin: 6,
    date: '2026-03-05',
    excerpt: 'Jeux, enrichissement alimentaire et rations mesurées : le trio gagnant contre les kilos en trop.',
    body: `Un chat stérilisé d’intérieur brûle peu d’énergie. Utilisez des distributeurs interactifs pour ralentir la prise alimentaire.

Pesez les croquettes avec une balance de cuisine. Les friandises comptent dans le total calorique journalier.

Proposez des sessions de jeu avant le repas du soir : l’activité stimule l’appétit sain et limite l’ennui.`,
  },
  {
    id: 'c4',
    title: 'BARF, croquettes ou mixte : que choisir ?',
    category: 'Comparatif',
    readMin: 7,
    date: '2026-02-18',
    excerpt: 'Avantages et précautions des trois approches alimentaires les plus courantes en Tunisie.',
    body: `**Croquettes** : pratiques, équilibrées si qualité premium, bonnes pour les dents. Idéales au quotidien pour la majorité des foyers.

**BARF (cru)** : nécessite recettes équilibrées et hygiène stricte. Consultation vétérinaire recommandée pour éviter carences.

**Mixte** : croquettes le matin, pâtée le soir — bon compromis hydratation / praticité. Transition toujours progressive.`,
  },
  {
    id: 'c5',
    title: 'Allergies alimentaires : signes et conduite à tenir',
    category: 'Santé',
    readMin: 5,
    date: '2026-01-22',
    excerpt: 'Démangeaisons, otites récidivantes, troubles digestifs — quand suspecter une intolérance ?',
    body: `Signes fréquents : grattage excessif, rougeurs des pattes, otites, vomissements ou selles molles chroniques.

Le vétérinaire peut proposer un régime d’éviction (protéine nouvelle ou hydrolysée) sur 6 à 8 semaines.

Ne changez qu’un paramètre à la fois et évitez friandises et restes de table pendant le test.`,
  },
];

const tagStyle = (tag) => {
  const map = {
    Essentiel: { bg: '#dcfce7', color: '#166534' },
    Sécurité: { bg: '#fee2e2', color: '#991b1b' },
    Santé: { bg: '#dbeafe', color: '#1e40af' },
    default: { bg: '#f3f4f6', color: '#374151' },
  };
  return map[tag] || map.default;
};

const mapArticle = (row) => ({
  id: row.id || row._id,
  title: row.title,
  category: row.category,
  readMin: row.readMin ?? 5,
  date: row.publishedAt || row.date || row.createdAt,
  excerpt: row.excerpt,
  body: row.body,
});

/** Conseils nutrition + blog — intégré à la page Mes avis */
const ClientNutritionBlogPanel = () => {
  const [subTab, setSubTab] = useState('tips');
  const [petType, setPetType] = useState('dog');
  const [expandedBlog, setExpandedBlog] = useState(null);
  const [blogFilter, setBlogFilter] = useState('all');
  const [blogPosts, setBlogPosts] = useState(BLOG_POSTS.map(mapArticle));
  const [blogLoading, setBlogLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBlogLoading(true);
      try {
        const rows = await getPublishedBlogArticles();
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setBlogPosts(rows.map(mapArticle));
        }
      } catch {
        if (!cancelled) setBlogPosts(BLOG_POSTS.map(mapArticle));
      } finally {
        if (!cancelled) setBlogLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const tips = NUTRITION_TIPS[petType] || NUTRITION_TIPS.dog;

  const filteredPosts = useMemo(() => {
    if (blogFilter === 'all') return blogPosts;
    return blogPosts.filter(
      (p) => p.category.toLowerCase() === blogFilter.toLowerCase() || p.category === blogFilter
    );
  }, [blogFilter, blogPosts]);

  const categories = useMemo(() => ['all', ...new Set(blogPosts.map((p) => p.category))], [blogPosts]);

  return (
    <div>
      <div className="cc-tabs-main" style={{ marginBottom: 20 }}>
        {[
          { id: 'tips', label: '💡 Conseils nutrition' },
          { id: 'blog', label: '📰 Blog' },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`cc-tab-main ${subTab === id ? 'active' : ''}`}
            onClick={() => setSubTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {subTab === 'tips' ? (
        <>
          <div className="cc-form-card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Utensils size={20} color="#059669" />
              Conseils nutrition par animal
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#047857' }}>
              Recommandations générales validées par notre équipe. Pour un plan personnalisé, consultez{' '}
              <Link to="/smart-food-agent" style={{ color: '#065f46', fontWeight: 700 }}>NutriPro</Link>
              {' '}ou le{' '}
              <Link to="/pet-calories" style={{ color: '#065f46', fontWeight: 700 }}>calculateur calories</Link>
              {' '}ou votre vétérinaire.
            </p>
          </div>

          <div className="cc-categories" style={{ marginBottom: 20 }}>
            {PET_TYPES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`cc-cat-btn ${petType === p.id ? 'active' : ''}`}
                onClick={() => setPetType(p.id)}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>

          <div className="cc-list">
            {tips.map((tip) => {
              const style = tagStyle(tip.tag);
              return (
                <article key={tip.title} className="cc-card review" style={{ borderLeft: '4px solid #10b981' }}>
                  <div className="cc-card-head">
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Leaf size={18} color="#059669" />
                      {tip.title}
                    </h3>
                  </div>
                  <div className="cc-meta">
                    <span className="cc-badge" style={{ background: style.bg, color: style.color, textTransform: 'none' }}>
                      {tip.tag}
                    </span>
                  </div>
                  <p className="cc-message" style={{ marginBottom: 0 }}>{tip.text}</p>
                </article>
              );
            })}
          </div>

          <div className="cc-response" style={{ marginTop: 20, background: '#fffbeb', borderColor: '#fde68a' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#92400e' }}>
              <AlertCircle size={16} />
              Rappel important
            </strong>
            <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#78350f' }}>
              Ces conseils ne remplacent pas un avis vétérinaire. En cas de doute sur l’alimentation de votre animal,
              prenez rendez-vous via la rubrique{' '}
              <Link to="/veterinary" style={{ color: '#b45309', fontWeight: 700 }}>Santé & vétérinaire</Link>.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="cc-form-card" style={{ marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={20} color="#2563eb" />
              Blog nutrition animale
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              Articles publiés par l’équipe PetfoodTN. Retrouvez aussi jouets et accessoires dans le{' '}
              <Link to="/client-products?category=jouets" style={{ color: '#2563eb', fontWeight: 700 }}>catalogue</Link>.
            </p>
          </div>

          {blogLoading && (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 12 }}>Chargement des articles…</p>
          )}

          <div className="cc-filters" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cc-filter-btn reviews ${blogFilter === cat ? 'active' : ''}`}
                onClick={() => setBlogFilter(cat)}
              >
                {cat === 'all' ? 'Tous' : cat}
              </button>
            ))}
          </div>

          <div className="cc-list">
            {!blogLoading && filteredPosts.length === 0 && (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>
                Aucun article publié pour le moment.
              </p>
            )}
            {filteredPosts.map((post) => {
              const open = expandedBlog === post.id;
              const dateStr = post.date
                ? new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                : '';
              return (
                <article key={post.id} className="cc-card review">
                  <div className="cc-card-head">
                    <h3 style={{ margin: 0 }}>{post.title}</h3>
                  </div>
                  <div className="cc-meta">
                    <span className="cc-badge" style={{ background: '#dbeafe', color: '#1e40af', textTransform: 'none' }}>
                      {post.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      {post.readMin} min
                    </span>
                    {dateStr && (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{dateStr}</span>
                    )}
                  </div>
                  <p className="cc-message">{post.excerpt}</p>
                  {open && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 16,
                        background: '#f8fafc',
                        borderRadius: 12,
                        fontSize: '0.95rem',
                        lineHeight: 1.65,
                        color: '#374151',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {post.body.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </div>
                  )}
                  <div className="cc-actions">
                    <button
                      type="button"
                      className="cc-btn-ghost"
                      onClick={() => setExpandedBlog(open ? null : post.id)}
                    >
                      {open ? (
                        <>
                          <ChevronUp size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          Réduire
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          Lire l’article
                        </>
                      )}
                    </button>
                    <Link to="/client-products?category=croquettes" className="cc-btn-ghost" style={{ textDecoration: 'none' }}>
                      <Scale size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      Nourriture
                    </Link>
                    <Link to="/client-products?category=jouets" className="cc-btn-ghost" style={{ textDecoration: 'none' }}>
                      🎾 Jouets
                    </Link>
                    <Link to="/client-products?category=accessoires" className="cc-btn-ghost" style={{ textDecoration: 'none' }}>
                      🎒 Accessoires
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientNutritionBlogPanel;
