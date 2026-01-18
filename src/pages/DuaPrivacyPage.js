import React from 'react';

const DuaPrivacyPage = () => {
  return (
    <div className="min-h-screen py-16 bg-slate-900 text-white">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-6">Gizlilik Politikası — DuaApp</h1>

        <div className="prose prose-invert max-w-none text-secondary-300">
          <p><strong>Son Güncelleme:</strong> Ocak 2025</p>

          <h2>1. Giriş</h2>
          <p>
            DuaApp ("biz", "bizim" veya "Uygulama") olarak, gizliliğinize önem veriyoruz.
            Bu Gizlilik Politikası, uygulamamızı kullandığınızda kişisel bilgilerinizi nasıl
            topladığımızı, kullandığımızı ve koruduğumuzu açıklar.
          </p>

          <h2>2. Toplanan Bilgiler</h2>
          <p><strong>2.1 Hesap Bilgileri</strong></p>
          <ul>
            <li>E-posta adresi</li>
            <li>Kullanıcı adı ve görünen ad</li>
            <li>Profil fotoğrafı (isteğe bağlı)</li>
          </ul>
          <p><strong>2.2 Kullanım Verileri</strong></p>
          <ul>
            <li>Uygulama içi aktiviteler</li>
            <li>Tercih edilen dini gelenekler</li>
            <li>Dua ve zikir geçmişi</li>
          </ul>
          <p><strong>2.3 Cihaz Bilgileri</strong></p>
          <ul>
            <li>Cihaz türü ve işletim sistemi</li>
            <li>Uygulama versiyonu</li>
            <li>Bildirim tercihleri</li>
          </ul>

          <h2>3. Bilgilerin Kullanımı</h2>
          <p>
            Toplanan bilgiler kişiselleştirme, uygulama deneyimini iyileştirme, teknik destek
            sağlama ve bildirimler göndermek için kullanılır (izinlere bağlı olarak).
          </p>

          <h2>4. Veri Güvenliği</h2>
          <p>
            Verilerinizi korumak için SSL/TLS şifrelemesi, güvenli veri depolama ve düzenli
            güvenlik denetimleri gibi endüstri standardı önlemler uygularız.
          </p>

          <h2>5. Veri Paylaşımı</h2>
          <p>
            Kişisel verilerinizi yasal zorunluluklar veya hizmet sağlayıcılarımız ile sınırlı
            erişim gerektiren durumlar dışında üçüncü taraflarla paylaşmayız.
          </p>

          <h2>6. Haklarınız</h2>
          <p>
            Verilerinize erişim, düzeltme, silme ve veri taşınabilirliği gibi haklara sahipsiniz.
            Hesabınızı silme talepleri için uygulama içindeki "Hesap Silme" bölümünü kullanabilirsiniz.
          </p>

          <h2>7. İletişim</h2>
          <p>Gizlilik ile ilgili sorularınız için: destek@duaapp.com</p>
        </div>
      </div>
    </div>
  );
};

export default DuaPrivacyPage;
