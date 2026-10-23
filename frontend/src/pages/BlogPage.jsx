import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Clock, ArrowRight, Search, User, Tag } from 'lucide-react';
import Header from '../components/layout/Header';
import PageIntro from '../components/common/PageIntro';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/chatbot/Chatbot';
import Seo, { SITE_URL } from '../components/common/Seo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return iso; }
};

const BlogPage = () => {
  const { category: categoryParam } = useParams();
  const navigate = useNavigate();
  const selectedCategory = categoryParam ? decodeURIComponent(categoryParam) : 'Alle';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedCategory]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/blog/posts`)
      .then((r) => r.ok ? r.json() : [])
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['Alle', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))], [posts]);

  const goToCategory = (c) => {
    if (c === 'Alle') navigate('/blog');
    else navigate(`/blog/kategorie/${encodeURIComponent(c)}`);
  };

  const filtered = posts.filter((p) => {
    const m1 = selectedCategory === 'Alle' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const m2 = !q ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q));
    return m1 && m2;
  });

  const isDefaultView = selectedCategory === 'Alle' && searchQuery === '';
  const featured = isDefaultView ? (posts.find((p) => p.featured) || posts[0]) : null;
  const list = featured ? filtered.filter((p) => p.id !== featured.id) : filtered;

  const pageTitle = selectedCategory === 'Alle' ? 'Blog & Insights' : `${selectedCategory} — Blog`;

  return (
    <div className="page-transition">
      <Seo
        title={pageTitle}
        description="Artikel und Insights von Zebick zu Webentwicklung, Cyber Security, Design und digitaler Strategie."
        path={selectedCategory === 'Alle' ? '/blog' : `/blog/kategorie/${encodeURIComponent(selectedCategory)}`}
        jsonLd={posts.length > 0 ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: posts.slice(0, 20).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/blog/${p.slug}`,
            name: p.title,
          })),
        } : null}
      />
      <Header />

      {/* ========== INTRO (kompakt, kein Hero-Banner) ========== */}
      <PageIntro
        icon={<Tag size={13} />}
        badge={selectedCategory === 'Alle' ? 'Blog & Insights' : `Kategorie · ${selectedCategory}`}
        title={pageTitle}
        description={selectedCategory === 'Alle'
          ? 'Praxisnahe Artikel über Technologie, Design, Sicherheit und alles, was dazwischen passiert.'
          : `Alle Beiträge aus der Kategorie „${selectedCategory}“ auf einen Blick.`}
      >
        {selectedCategory !== 'Alle' && (
              <Link to="/blog" data-testid="blog-all-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px', color: 'var(--accent-primary)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                ← Alle Artikel ansehen
              </Link>
            )}
      </PageIntro>

      {/* FILTER BAR — top padding clears the fixed header (64px) when no
          category is selected (PageIntro has no back-link/children then, so
          it takes up zero visible space; with a category selected, the
          back-link IS present and PageIntro itself provides the clearance).
          A <div>, not <section> — bare section tags get their padding
          force-overridden by a global mobile rule
          (section{padding:48px 0!important}), which tucked this bar 12px
          under the fixed header. */}
      <div style={{ padding: selectedCategory === 'Alle' ? '84px 0 20px' : '40px 0 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => goToCategory(c)}
                  data-testid={`blog-category-${c}`}
                  style={{
                    padding: '10px 20px',
                    background: selectedCategory === c ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                    color: selectedCategory === c ? '#000' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: selectedCategory === c ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    borderRadius: '999px',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    transition: 'background 0.2s, color 0.2s, border 0.2s',
                    fontFamily: 'inherit',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                placeholder="Suche Artikel…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="blog-search"
                style={{
                  width: '100%', padding: '10px 14px 10px 40px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)', borderRadius: '999px',
                  color: '#fff', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED POST */}
      {featured && (
        <section style={{ padding: '60px 0 0', background: 'var(--bg-secondary)' }}>
          <div className="container">
            <BlogCard post={featured} variant="featured" onCategoryClick={goToCategory} />
          </div>
        </section>
      )}

      {/* LIST */}
      <section style={{ padding: '60px 0 100px', background: 'var(--bg-secondary)' }}>
        <div className="container">
          {loading ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>L&auml;dt Artikel…</div>
          ) : list.length === 0 && !featured ? (
            <div data-testid="blog-empty" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Keine Artikel {selectedCategory !== 'Alle' ? `in der Kategorie „${selectedCategory}“ ` : ''}gefunden.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
              {list.map((p) => (
                <BlogCard key={p.id} post={p} variant="card" onCategoryClick={goToCategory} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
};

// =================== BLOG CARD ===================
const BlogCard = ({ post, variant, onCategoryClick }) => {
  const isFeatured = variant === 'featured';
  return (
    <div
      id={`post-${post.id}`}
      data-testid={`blog-card-${post.slug}`}
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        display: isFeatured ? 'grid' : 'block',
        gridTemplateColumns: isFeatured ? 'minmax(320px, 1.2fr) 1fr' : '1fr',
        transition: 'border-color 0.3s ease, transform 0.3s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,107,0,0.35)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <Link to={`/blog/${post.slug}`} style={{ display: 'block', position: 'relative', aspectRatio: '16/10', background: '#111', overflow: 'hidden' }}>
        {post.cover_image ? (
          <img src={post.cover_image} alt={post.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : null}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
        {post.category && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCategoryClick?.(post.category); }}
            data-testid={`blog-card-category-${post.slug}`}
            title={`Alle Artikel: ${post.category}`}
            style={{
              position: 'absolute', top: '18px', left: '18px',
              padding: '7px 14px', background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(12px)', borderRadius: '999px',
              fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)',
              border: '1px solid rgba(255,107,0,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >{post.category}</button>
        )}
        {isFeatured && (
          <div style={{
            position: 'absolute', top: '18px', right: '18px',
            padding: '6px 14px', background: 'var(--accent-primary)', color: '#000',
            borderRadius: '999px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em',
          }}>FEATURED</div>
        )}
      </Link>
      <div style={{ padding: isFeatured ? '44px' : '28px' }}>
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {post.author && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={12} /> {post.author}</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={12} /> {formatDate(post.published_at)}</span>
          {post.read_time && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={12} /> {post.read_time}</span>}
        </div>
        <h3 style={{
          fontSize: isFeatured ? 'clamp(26px, 3.2vw, 36px)' : '22px',
          fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          <Link to={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{post.title}</Link>
        </h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '20px', fontSize: isFeatured ? '15px' : '14px' }}>
          {post.excerpt}
        </p>
        {(post.tags || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {post.tags.slice(0, 4).map((t, i) => (
              <span key={i} style={{
                padding: '4px 10px', background: 'rgba(255, 107, 0, 0.08)',
                border: '1px solid rgba(255, 107, 0, 0.18)', borderRadius: '999px',
                fontSize: '11px', fontWeight: 500, color: 'var(--accent-primary)',
              }}>{t}</span>
            ))}
          </div>
        )}
        <Link
          to={`/blog/${post.slug}`}
          data-testid={`blog-read-${post.slug}`}
          className="btn-fill btn-fill-dark"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 22px',
            background: 'var(--accent-primary)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
            textDecoration: 'none',
          }}
        >
          Lesen <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

// =================== MARKDOWN BODY ===================
export const MarkdownBody = ({ content, large = false }) => (
  <div className={large ? 'blog-markdown blog-markdown-large' : 'blog-markdown'} style={{
    color: 'var(--text-secondary)',
    fontSize: large ? '20px' : '17px',
    lineHeight: large ? 1.8 : 1.75,
  }}>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content || '_Kein Inhalt._'}
    </ReactMarkdown>
    <style>{`
      .blog-markdown h1 { font-size: 34px; font-weight: 800; margin: 48px 0 20px; letter-spacing: -0.02em; color: var(--text-primary); line-height: 1.2; }
      .blog-markdown h2 { font-size: 28px; font-weight: 800; margin: 44px 0 18px; letter-spacing: -0.02em; color: var(--text-primary); line-height: 1.25; }
      .blog-markdown h3 { font-size: 22px; font-weight: 700; margin: 36px 0 14px; letter-spacing: -0.01em; color: var(--text-primary); }
      .blog-markdown h4 { font-size: 18px; font-weight: 700; margin: 28px 0 12px; color: var(--text-primary); }
      .blog-markdown p { margin: 0 0 20px; }
      .blog-markdown strong { color: var(--text-primary); font-weight: 700; }
      .blog-markdown em { color: var(--accent-primary); font-style: italic; }
      .blog-markdown ul, .blog-markdown ol { margin: 0 0 24px; padding-left: 24px; }
      .blog-markdown li { margin: 8px 0; }
      .blog-markdown li::marker { color: var(--accent-primary); }
      .blog-markdown a { color: var(--accent-primary); text-decoration: underline; text-underline-offset: 3px; }
      .blog-markdown a:hover { color: #FF8533; }
      .blog-markdown blockquote { border-left: 3px solid var(--accent-primary); padding: 4px 0 4px 20px; margin: 24px 0; color: var(--text-primary); font-style: italic; }
      .blog-markdown code { background: rgba(255, 107, 0, 0.12); color: var(--accent-primary); padding: 2px 6px; border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 15px; }
      .blog-markdown pre { background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 18px 20px; overflow-x: auto; margin: 24px 0; }
      .blog-markdown pre code { background: none; color: var(--text-primary); padding: 0; }
      .blog-markdown hr { border: none; border-top: 1px solid var(--border-subtle); margin: 40px 0; }
      .blog-markdown img { max-width: 100%; border-radius: 12px; margin: 24px 0; }
      .blog-markdown table { width: 100%; border-collapse: collapse; margin: 24px 0; }
      .blog-markdown th, .blog-markdown td { border: 1px solid var(--border-subtle); padding: 10px 14px; text-align: left; }
      .blog-markdown th { background: rgba(255,107,0,0.08); color: var(--accent-primary); }

      /* LARGE VARIANT (detail page) */
      .blog-markdown-large h1 { font-size: clamp(36px, 4.5vw, 52px); margin: 64px 0 28px; line-height: 1.15; }
      .blog-markdown-large h2 { font-size: clamp(28px, 3.6vw, 40px); margin: 56px 0 22px; line-height: 1.2; }
      .blog-markdown-large h3 { font-size: clamp(24px, 3vw, 32px); margin: 44px 0 18px; }
      .blog-markdown-large h4 { font-size: 22px; margin: 36px 0 14px; }
      .blog-markdown-large p { margin: 0 0 28px; }
      .blog-markdown-large ul, .blog-markdown-large ol { margin: 0 0 32px; padding-left: 30px; }
      .blog-markdown-large li { margin: 12px 0; }
      .blog-markdown-large blockquote { border-left: 4px solid var(--accent-primary); padding: 10px 0 10px 28px; margin: 36px 0; font-size: 1.1em; }
      .blog-markdown-large code { font-size: 17px; padding: 3px 8px; }
      .blog-markdown-large pre { padding: 24px 26px; margin: 32px 0; font-size: 16px; }
      .blog-markdown-large hr { margin: 56px 0; }
      .blog-markdown-large img { margin: 36px 0; }
    `}</style>
  </div>
);

export default BlogPage;
