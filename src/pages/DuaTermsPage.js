import React from 'react';

const DuaTermsPage = () => {
  return (
    <div className="min-h-screen py-16 bg-slate-900 text-white">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-6">Kullanım Koşulları — DuaApp</h1>

        <div className="prose prose-invert max-w-none text-secondary-300">
          <p><strong>Son Güncelleme:</strong> Ocak 2026</p>

          <h2>1. Kabul</h2>
          <p>
            DuaApp'ı kullanarak bu Kullanım Koşullarını kabul etmiş olursunuz. Koşulları kabul
            etmiyorsanız, uygulamayı kullanmayınız.
          </p>

          <h2>2. Hizmet Tanımı</h2>
          <p>
            DuaApp, manevi gelişim ve dini pratikler için tasarlanmış bir mobil uygulamadır. Sunduğumuz
            hizmetler arasında dua ve zikir içerikleri, AI destekli manevi rehberlik, topluluk
            özellikleri ve eğitim içerikleri bulunmaktadır.
          </p>

          <h2>3. Hesap Sorumluluğu</h2>
          <p>
            Kullanıcılar doğru bilgi vermekle yükümlüdür. Hesap güvenliği kullanıcıya aittir ve
            hesap bilgilerinizi başkalarıyla paylaşmamalısınız. Hesap silme talepleri uygulama içinden yapılabilir.
          </p>

          <h2>4. Kabul Edilebilir Kullanım</h2>
          <p>
            Yanıltıcı bilgi paylaşımı, diğer kullanıcılara saygısızlık, spam, telif hakkı ihlali ve
            kötü amaçlı yazılım dağıtımı yasaktır.
          </p>

          <h2>5. Fikri Mülkiyet</h2>
          <p>
            Uygulama içeriği ve tasarımı DuaApp'a aittir. İzinsiz kopyalama, dağıtım veya değiştirme yasaktır.
          </p>

          <h2>6. AI Hizmetleri</h2>
          <p>
            AI özellikleri bilgilendirme amaçlıdır ve profesyonel dini veya hukuki görüş yerine geçmez. Sonuçlar garanti edilmez.
          </p>

          <h2>7. Ödeme ve Abonelik</h2>
          <p>
            Premium abonelikler otomatik yenilenebilir. İptal işlemleri bir sonraki dönem için geçerlidir. İadeler uygulama mağazası politikalarına tabidir.
          </p>

          <h2>8. Sorumluluk Reddi</h2>
          <p>
            DuaApp içeriklerin doğruluğunu garanti etmez; uygulama olduğu gibi sunulur.
          </p>

          <h2>9. Veri İşleme ve Gizlilik</h2>
          <ul>
            <li>Kişisel veriler <a href="/dua-privacy" className="text-primary">Gizlilik Politikası</a> kapsamında toplanır ve işlenir.</li>
            <li>Veriler analiz, güvenlik, sahtekarlığı önleme, yasal uyumluluk ve reklam (izin verildiği ölçüde) için üçüncü taraflarla paylaşılabilir.</li>
            <li>Kullanıcılar verilerine erişim, düzeltme veya silme hakkına sahiptir.</li>
            <li>Hesap ve veri silme talepleri uygulama içinden veya <a href="https://ackaraca.me/account-delete" className="text-primary">bu sayfadan</a> yapılabilir.</li>
          </ul>

          <h2>10. Değişiklikler</h2>
          <p>
            Bu koşulları değiştirme hakkımız saklıdır; önemli değişiklikler bildirilecektir.
          </p>

          <h2>11. İletişim</h2>
          <p>
            Sorularınız için: <a href="mailto:info@ackaraca.me" className="text-primary">info@ackaraca.me</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DuaTermsPage;
