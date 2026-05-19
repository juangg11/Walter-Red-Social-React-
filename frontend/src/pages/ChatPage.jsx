import { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { ImagePlus, MessageCircle, Reply, Search, Send, Smile } from 'lucide-react';
import { api, getChatSocketUrl } from '../api/client';
import { uploadToCloudinary } from '../utils/cloudinary';

export default function ChatPage({ user }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [text, setText] = useState('');
  const [imageData, setImageData] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const bottomRef = useRef(null);
  const composerRef = useRef(null);

  useEffect(() => { loadChats(); }, []);

  useEffect(() => {
    const ws = new WebSocket(getChatSocketUrl());
    ws.onmessage = event => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'chat:message') {
        setChats(cur => bumpChat(cur, payload.message));
        if (Number(payload.message.chat_id) === Number(activeChat?.id)) {
          setMessages(cur => cur.some(m => m.id === payload.message.id) ? cur : [...cur, payload.message]);
        }
      }
    };
    return () => ws.close();
  }, [activeChat?.id]);

  useEffect(() => {
    if (!activeChat?.id) return;
    loadMessages(activeChat.id);
  }, [activeChat?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!showEmojis) return undefined;

    function handleClickOutside(event) {
      if (composerRef.current && !composerRef.current.contains(event.target)) {
        setShowEmojis(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojis]);

  async function loadChats() {
    const data = await api.get('/chat');
    setChats(data);
    setActiveChat(prev => prev || data[0] || null);
  }

  async function loadMessages(chatId) {
    const data = await api.get(`/chat/${chatId}/mensajes`);
    setMessages(data);
  }

  async function searchUsers() {
    if (query.trim().length < 2) { setUsers([]); return; }
    const data = await api.get(`/chat/usuarios?q=${encodeURIComponent(query.trim())}`);
    setUsers(data);
  }

  async function openChat(userId) {
    const chat = await api.post('/chat', { userId });
    const updated = await api.get('/chat');
    setChats(updated);
    setActiveChat(updated.find(item => Number(item.id) === Number(chat.id)) || chat);
    setQuery('');
    setUsers([]);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImageData(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function sendMessage() {
    if (!activeChat || (!text.trim() && !imageData)) return;
    let mediaAssetId = null;
    if (imageFile) {
      const uploaded = await uploadToCloudinary(imageFile, 'walter/chat');
      mediaAssetId = uploaded.asset.id;
    }
    const created = await api.post(`/chat/${activeChat.id}/mensajes`, {
      contenido: text.trim() || null,
      media_asset_id: mediaAssetId,
      respuesta_a_id: replyTo?.id || null,
    });
    setMessages(cur => cur.some(m => m.id === created.id) ? cur : [...cur, created]);
    setText('');
    setImageData('');
    setImageFile(null);
    setReplyTo(null);
    setShowEmojis(false);
    await loadChats();
  }

  function handleEmojiClick(emojiData) {
    setText(current => current + emojiData.emoji);
  }

  return (
    <main className="chat-page">
      <aside className="chat-sidebar">
        <div className="chat-search">
          <Search size={16} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar usuarios..." />
        </div>

        {users.length > 0 && (
          <div className="user-results">
            {users.map(found => (
              <button key={found.id} onClick={() => openChat(found.id)}>
                <Avatar name={found.username} />
                <span>w/{found.username}</span>
              </button>
            ))}
          </div>
        )}

        <div className="chat-list">
          {chats.length === 0 ? (
            <div className="empty-chat"><MessageCircle size={24} /><span>Busca a alguien para empezar</span></div>
          ) : chats.map(chat => (
            <button key={chat.id} className={activeChat?.id === chat.id ? 'active' : ''} onClick={() => setActiveChat(chat)}>
              <Avatar name={chat.other_username} />
              <div>
                <strong>w/{chat.other_username}</strong>
                <span>{chat.ultimo_mensaje || (chat.ultima_imagen ? 'Imagen' : 'Sin mensajes aún')}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="chat-panel">
        {activeChat ? (
          <>
            <header className="chat-header">
              <Avatar name={activeChat.other_username} />
              <div>
                <h2>w/{activeChat.other_username}</h2>
                <p>{activeChat.estado === 'pendiente' ? 'Solicitud de primer mensaje' : 'Chat activo'}</p>
              </div>
            </header>

            <div className="messages-list">
              {messages.map(message => {
                const mine = message.usuario_id === user.id;
                return (
                  <div key={message.id} className={`message-row ${mine ? 'mine' : ''}`}>
                    <div className="message-bubble">
                      {message.respuesta_a_id && (
                        <div className="message-reply">↳ w/{message.respuesta_username}: {message.respuesta_contenido || 'Imagen'}</div>
                      )}
                      {message.contenido && <p>{message.contenido}</p>}
                      {message.media_url && (
                        message.media_resource_type === 'video'
                          ? <video src={message.media_url} controls />
                          : <img src={message.media_url} alt="Imagen del chat" />
                      )}
                      <button className="message-reply-btn" onClick={() => setReplyTo(message)}><Reply size={14} /></button>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <footer className="chat-composer" ref={composerRef}>
              {replyTo && (
                <div className="composer-reply">
                  Respondiendo a w/{replyTo.username}: {replyTo.contenido || 'Imagen'}
                  <button onClick={() => setReplyTo(null)}>×</button>
                </div>
              )}
              {imageData && (
                <div className="composer-image">
                  {imageFile?.type?.startsWith('video/')
                    ? <video src={imageData} controls />
                    : <img src={imageData} alt="Vista previa" />}
                  <button onClick={() => { setImageData(''); setImageFile(null); }}>×</button>
                </div>
              )}
              {showEmojis && (
                <div className="emoji-picker-panel">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    autoFocusSearch={false}
                    skinTonesDisabled
                    lazyLoadEmojis
                    previewConfig={{ showPreview: false }}
                    searchPlaceHolder="Buscar emoji"
                    width="100%"
                  />
                </div>
              )}
              <div className="composer-row">
                <button type="button" onClick={() => setShowEmojis(v => !v)} aria-label="Abrir selector de emojis">
                  <Smile size={18} />
                </button>
                <label>
                  <ImagePlus size={18} />
                  <input type="file" accept="image/*,video/*" onChange={handleFile} hidden />
                </label>
                <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Escribe un mensaje..." />
                <button onClick={sendMessage}><Send size={18} /></button>
              </div>
            </footer>
          </>
        ) : (
          <div className="chat-empty-state">
            <MessageCircle size={36} />
            <h2>Tus mensajes</h2>
            <p>Busca un usuario y solicita escribirle un primer mensaje.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function Avatar({ name = '?' }) {
  return <span className="chat-avatar">{name.slice(0, 2).toUpperCase()}</span>;
}

function bumpChat(chats, message) {
  return chats.map(chat => (
    Number(chat.id) === Number(message.chat_id)
      ? { ...chat, ultimo_mensaje: message.contenido, ultima_imagen: message.media_url, ultimo_mensaje_fecha: message.fecha_creacion }
      : chat
  ));
}
