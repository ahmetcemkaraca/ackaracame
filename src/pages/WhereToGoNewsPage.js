import React, { useEffect } from 'react';
import NewsTimeline from '../components/NewsTimeline';
import { useProject } from '../context/ProjectContext';

const WHERETOGO_NEWS_CATEGORIES = ['WhereToGo', 'Where To-Go', 'WhereToGo News'];

const formatPostDate = (post) => {
    if (post.date) {
        return post.date;
    }

    if (post.createdAt?.seconds) {
        return new Date(post.createdAt.seconds * 1000).toLocaleDateString('tr-TR');
    }

    return 'Yeni';
};

const WhereToGoNewsPage = () => {
    const { blogPosts, loadBlogPosts } = useProject();

    useEffect(() => {
        loadBlogPosts();
    }, [loadBlogPosts]);

    const newsItems = blogPosts
        .filter((post) => WHERETOGO_NEWS_CATEGORIES.includes(post.category))
        .map((post) => ({
            id: post.id,
            date: formatPostDate(post),
            title: post.title,
            tag: post.version || post.tag,
            type: post.type || 'announcement',
            description: post.summary || post.description || post.content || '',
            linkText: 'Detayları Gör',
            linkUrl: `/blog/${post.id}`
        }));

    return (
        <NewsTimeline
            title="WhereToGo Güncellemeleri"
            subtitle="WhereToGo uygulaması ile ilgili en son haberler, sürüm notları ve yenilikler."
            items={newsItems}
        />
    );
};

export default WhereToGoNewsPage;
