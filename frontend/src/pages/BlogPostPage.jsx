import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Linkedin } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/chatbot/Chatbot';
import Seo, { SITE_URL } from '../components/common/Seo';
import { MarkdownBody, formatDate } from './BlogPage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ok | notfound

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setRelated([]);
    setAuthor(null);
    window.scrollTo(0, 0);
    fetch(`${BACKEND_URL}/api/blog/posts/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (!active) return;
        setPost(data);
        setStatus('ok');
        // Match author to a team member for photo + role
        if (data.author) {
          fetch(`${BACKEND_URL}/api/team/members`)
            .then((r) => (r.ok ? r.json() : []))
            .then((members) => {
              if (!active) return;
              const match = members.find((m) => m.name && m.name.toLowerCase() === data.author.toLowerCase());
              setAuthor(match || { name: data.author, role: 'Autor:in bei Zebick' });
            })
            .catch(() => { if (active) setAuthor({ name: data.author, role: 'Autor:in bei Zebick' }); });
        }
        // Load related posts: same category first, then fill with others
        fetch(`${BACKEND_URL}/api/blog/posts`)
          .then((r) => (r.ok ? r.json() : []))
          .then((all) => {
            if (!active) return;
            const others = all.filter((p) => p.slug !== slug);
            const sameCat = others.filter((p) => p.category && p.category === data.category);
            const rest = others.filter((p) => !p.category || p.category !== data.category);
            setRelated([...sameCat, ...rest].slice(0, 3));
          })
          .catch(() => {});
      })
      .catch(() => { if (active) setStatus('notfound'); });
    return () => { active = false; };
  }, [slug]);

  return (
    <div className="page-transition">
      <Seo
        title={post ? post.title : 'Blog'}
        description={post ? (post.excerpt || post.title) : 'Artikel von Zebick'}
        path={`/blog/${slug}`}
        image={post?.cover_image}
        type="article"
        noindex={status === 'notfound'}
        jsonLd={post ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt || post.title,
          image: post.cover_image ? [post.cover_image] : undefined,
          datePublished: post.published_at,
          dateModified: post.updated_at || post.published_at,
          author: { '@type': 'Person', name: post.author || 'Zebick' },
          publisher: { '@type': 'Organization', name: 'Zebick', url: SITE_URL },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${slug}` },
        } : null}
      />
      <Header />

      <section style={{ padding: '140px 0 120px', background: 'var(--bg-primary)', minHeight: '70vh' }}>
        <div className="container" style={{ maxWidth: '1040px' }}>
          <Link
            to="/blog"
            data-testid="blog-back"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)', borderRadius: '999px',
              color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none',
              marginBottom: '40px',
            }}
          >
            <ArrowLeft size={16} /> Zurück zum Blog
          </Link>

          {status === 'loading' && (
            <div data-testid="blog-post-loading" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Lädt Artikel…
            </div>
          )}

          {status === 'notfound' && (
            <div data-testid="blog-post-notfound" style={{ padding: '80px 0', textAlign: 'center' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>Artikel nicht gefunden</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Dieser Artikel existiert nicht oder wurde entfernt.</p>
              <Link to="/blog" className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }}>
                Alle Artikel ansehen
              </Link>
            </div>
          )}

          {status === 'ok' && post && (
            <article data-testid="blog-post-article">
              {post.category && (
                <Link
                  to={`/blog/kategorie/${encodeURIComponent(post.category)}`}
                  data-testid="blog-post-category"
                  style={{ display: 'inline-block', fontSize: '14px', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '18px', textDecoration: 'none' }}
                >
                  {post.category}
                </Link>
              )}
              <h1 data-testid="blog-post-title" style={{ fontSize: 'clamp(38px, 5.5vw, 64px)', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.03em', marginBottom: '28px' }}>
                {post.title}
              </h1>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '15px', marginBottom: '48px' }}>
                {post.author && <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} /> {post.author}</span>}
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} /> {formatDate(post.published_at)}</span>
                {post.read_time && <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> {post.read_time}</span>}
              </div>
              {post.cover_image && (
                <div style={{ marginBottom: '60px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              )}

              <MarkdownBody content={post.content || post.excerpt} large />

              {(post.tags || []).length > 0 && (
                <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {post.tags.map((t, i) => (
                    <span key={i} style={{
                      padding: '10px 20px', background: 'rgba(255, 107, 0, 0.08)',
                      border: '1px solid rgba(255, 107, 0, 0.2)', borderRadius: '999px',
                      fontSize: '14px', fontWeight: 500, color: 'var(--accent-primary)',
                    }}>#{t}</span>
                  ))}
                </div>
              )}

              {/* AUTHOR BOX */}
              {author && (
                <div data-testid="blog-author-box" style={{
                  marginTop: '56px', padding: '32px',
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)',
                  display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap',
                }}>
                  {author.image ? (
                    <img
                      src={author.image}
                      alt={author.name}
                      data-testid="blog-author-avatar"
                      loading="lazy"
                      style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(255,107,0,0.4)' }}
                    />
                  ) : (
                    <div data-testid="blog-author-avatar" style={{
                      width: '84px', height: '84px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--accent-primary)', color: '#000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '30px', fontWeight: 800,
                    }}>
                      {author.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                      Geschrieben von
                    </div>
                    <div data-testid="blog-author-name" style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: '4px' }}>
                      {author.name}
                    </div>
                    {author.role && (
                      <div data-testid="blog-author-role" style={{ fontSize: '14px', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '12px' }}>
                        {author.role}
                      </div>
                    )}
                    {author.bio && (
                      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 14px' }}>
                        {author.bio}
                      </p>
                    )}
                    {author.linkedin && (
                      <a
                        href={author.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="blog-author-linkedin"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
                      >
                        <Linkedin size={16} /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      </section>

      {/* RELATED POSTS */}
      {status === 'ok' && related.length > 0 && (
        <section data-testid="blog-related" style={{ padding: '80px 0 100px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="container" style={{ maxWidth: '1200px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Weiterlesen
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '44px' }}>
              Passende Artikel, die dich auch interessieren könnten.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  data-testid={`blog-related-${p.slug}`}
                  style={{
                    display: 'block', textDecoration: 'none', color: 'inherit',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                    transition: 'border-color 0.3s ease, transform 0.3s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,107,0,0.35)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ position: 'relative', aspectRatio: '16/10', background: '#111', overflow: 'hidden' }}>
                    {p.cover_image && <img src={p.cover_image} alt={p.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />
                    {p.category && (
                      <div style={{
                        position: 'absolute', top: '16px', left: '16px', padding: '6px 12px',
                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', borderRadius: '999px',
                        fontSize: '10px', fontWeight: 700, color: 'var(--accent-primary)',
                        border: '1px solid rgba(255,107,0,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}>{p.category}</div>
                    )}
                  </div>
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={12} /> {formatDate(p.published_at)}</span>
                      {p.read_time && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={12} /> {p.read_time}</span>}
                    </div>
                    <h3 style={{ fontSize: '19px', fontWeight: 800, lineHeight: 1.3, marginBottom: '10px', letterSpacing: '-0.01em' }}>{p.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.excerpt}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: 600 }}>
                      Lesen <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <Chatbot />
    </div>
  );
};

export default BlogPostPage;
