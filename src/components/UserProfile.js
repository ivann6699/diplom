import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    university: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: progressData } = await supabase
      .from('user_article_progress')
      .select('article_id, test_passed, learning_articles(title)')
      .eq('user_id', user.id);

    setProfile(profileData || {
      first_name: '',
      last_name: '',
      phone: '',
      university: '',
      avatar_url: ''
    });
    setProgress(progressData || []);
    setLoading(false);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        ...profile,
        updated_at: new Date()
      });

    if (!error) {
      setEditMode(false);
      await fetchUserData();
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    setProfile({ ...profile, avatar_url: publicUrl });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Загрузка...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gradient">Личный кабинет</h1>
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          {editMode ? 'Отменить' : 'Редактировать'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card-glow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Личные данные</h2>
          
          <div className="flex flex-col items-center mb-6">
            <div 
              onClick={editMode ? triggerFileInput : null}
              className={`relative w-24 h-24 rounded-full mb-4 overflow-hidden ${editMode ? 'cursor-pointer' : ''}`}
            >
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Аватар" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-white text-2xl">
                  {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                </div>
              )}
              {editMode && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm">Изменить</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
            <h3 className="text-xl font-medium">
              {profile.first_name} {profile.last_name}
            </h3>
          </div>
          
          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Имя</label>
                <input
                  value={profile.first_name}
                  onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Фамилия</label>
                <input
                  value={profile.last_name}
                  onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Телефон</label>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Учебное заведение</label>
                <input
                  value={profile.university}
                  onChange={(e) => setProfile({...profile, university: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full py-2 rounded-lg bg-gradient text-primary hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700"
              >
                Сохранить
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p><span className="text-muted-foreground">Имя:</span> {profile.first_name || 'Не указано'}</p>
              <p><span className="text-muted-foreground">Фамилия:</span> {profile.last_name || 'Не указано'}</p>
              <p><span className="text-muted-foreground">Телефон:</span> {profile.phone || 'Не указан'}</p>
              <p><span className="text-muted-foreground">Учебное заведение:</span> {profile.university || 'Не указано'}</p>
            </div>
          )}
        </div>

        <div className="card-glow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Прогресс обучения</h2>
          
          {progress.length > 0 ? (
            <div className="space-y-3">
              {progress.map((item) => (
                <div key={item.article_id} className="flex items-center justify-between">
                  <h3 className="font-medium">{item.learning_articles.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.test_passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {item.test_passed ? '✓ Пройден' : '✕ Не пройден'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Вы еще не проходили тесты</p>
          )}
        </div>      </div>
    </motion.div>
  );
};

export default UserProfile;