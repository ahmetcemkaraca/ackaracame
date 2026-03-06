import React from 'react';
import NewsTimeline from '../components/NewsTimeline';

const DuaNewsPage = () => {
    const newsItems = [
        {
            id: 'dua-2',
            date: 'Yakında',
            title: 'GitHub Release: v1.2.0',
            tag: 'v1.2.0',
            type: 'github_release',
            description: 'Performans iyileştirmeleri ve yeni dua kategorileri eklendi. (Placeholder data)',
            linkText: 'Sürüm Notları',
            linkUrl: '#'
        },
        {
            id: 'dua-1',
            date: 'Ocak 2024',
            title: 'Dua App iOS & Android Yayınlandı!',
            type: 'feature',
            description: 'Dua App uygulamamız artık App Store ve Google Play üzerinde indirilebilir durumda!',
        }
    ];

    return (
        <NewsTimeline
            title="Dua App Güncellemeleri"
            subtitle="Dua uygulaması hakkındaki en son gelişmeler, sürüm notları ve yenilikler."
            items={newsItems}
        />
    );
};

export default DuaNewsPage;
