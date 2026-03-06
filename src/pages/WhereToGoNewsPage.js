import React from 'react';
import NewsTimeline from '../components/NewsTimeline';

const WhereToGoNewsPage = () => {
    // Placeholder Data
    const newsItems = [
        {
            id: 'wtg-2',
            date: 'Yakında',
            title: 'GitHub: Initial Repository Commit',
            tag: 'v0.1.0-alpha',
            type: 'github_commit',
            description: 'Proje iskeleti oluşturuldu ve ilk core modüller eklendi. (Placeholder data)',
            linkText: 'Commit Detayları',
            linkUrl: '#'
        },
        {
            id: 'wtg-1',
            date: 'Ocak 2026',
            title: 'WhereToGo Geliştirme Süreci Başladı!',
            type: 'announcement',
            description: 'Yeni konum ve keşif uygulamamızın geliştirme sürecine başlandı. Çok yakında harika özelliklerle karşınızda olacağız.',
        }
    ];

    return (
        <NewsTimeline
            title="WhereToGo Güncellemeleri"
            subtitle="WhereToGo uygulaması ile ilgili en son haberler, sürüm notları ve yenilikler."
            items={newsItems}
        />
    );
};

export default WhereToGoNewsPage;
