import { Heart, MessageCircle, Send } from 'lucide-react';

export default function PostPreview({ post }) {
  if (!post) {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', minHeight: 400 }}>
        Click a post to preview
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', maxWidth: 400, margin: '0 auto', width: '100%' }}>
      <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee' }}></div>
        <div style={{ fontWeight: 'bold', fontSize: 13 }}>serenebayresort</div>
      </div>
      <div style={{ width: '100%', aspectRatio: '1/1', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        {post.imageUrl || post.image_url ? (
          <img src={post.imageUrl || post.image_url} alt="Post preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          'No Image Available'
        )}
      </div>
      <div style={{ padding: 12, fontSize: 13 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
           <Heart size={20} />
           <MessageCircle size={20} />
           <Send size={20} />
        </div>
        <b>serenebayresort</b> {post.caption || <span style={{color: '#999'}}>No caption yet...</span>}
      </div>
    </div>
  );
}
