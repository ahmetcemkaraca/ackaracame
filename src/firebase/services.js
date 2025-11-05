import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './config';

// Projeler servisi
export const ProjectService = {
  // Tüm projeleri getir
  async getAll() {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy('order', 'asc'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Kategoriye göre projeleri getir
  async getByCategory(category) {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef, 
      where('category', '==', category),
      where('status', '==', 'active'),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Öne çıkan projeleri getir
  async getFeatured() {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef, 
      where('featured', '==', true),
      where('status', '==', 'active'),
      orderBy('order', 'asc'),
      limit(6)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Tek proje getir
  async getById(id) {
    const projectRef = doc(db, 'projects', id);
    const snapshot = await getDoc(projectRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  },

  // Proje oluştur
  async create(projectData) {
    const projectsRef = collection(db, 'projects');
    const docRef = await addDoc(projectsRef, {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Proje güncelle
  async update(id, projectData) {
    const projectRef = doc(db, 'projects', id);
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: serverTimestamp()
    });
  },

  // Proje sil
  async delete(id) {
    const projectRef = doc(db, 'projects', id);
    await deleteDoc(projectRef);
  }
};

// Paftalar servisi
export const PaftaService = {
  // Tüm paftaları getir
  async getAll() {
    const paftasRef = collection(db, 'paftas');
    const q = query(paftasRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // QR kod ile pafta getir
  async getByQRCode(qrCodeData) {
    const paftasRef = collection(db, 'paftas');
    const q = query(paftasRef, where('qrCodeData', '==', qrCodeData));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  },

  // Döneme göre paftaları getir
  async getBySemester(semester) {
    const paftasRef = collection(db, 'paftas');
    const q = query(
      paftasRef, 
      where('semester', '==', semester),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Pafta oluştur
  async create(paftaData) {
    const paftasRef = collection(db, 'paftas');
    const docRef = await addDoc(paftasRef, {
      ...paftaData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Pafta güncelle
  async update(id, paftaData) {
    const paftaRef = doc(db, 'paftas', id);
    await updateDoc(paftaRef, {
      ...paftaData,
      updatedAt: serverTimestamp()
    });
  },

  // Pafta sil
  async delete(id) {
    const paftaRef = doc(db, 'paftas', id);
    await deleteDoc(paftaRef);
  }
};

// Dosya yükleme servisi
export const FileService = {
  // Görsel yükle
  async uploadImage(file, path) {
    const storageRef = ref(storage, `images/${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  },

  // Dosya sil
  async deleteFile(url) {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  }
};

// Site ayarları servisi
export const SiteSettingsService = {
  // Ayarları getir
  async get() {
    const settingsRef = doc(db, 'siteSettings', 'main');
    const snapshot = await getDoc(settingsRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  },

  // Ayarları güncelle
  async update(settingsData) {
    const settingsRef = doc(db, 'siteSettings', 'main');
    await updateDoc(settingsRef, {
      ...settingsData,
      updatedAt: serverTimestamp()
    });
  }
};

// İletişim servisi
export const ContactService = {
  // Mesaj gönder
  async sendMessage(messageData) {
    const messagesRef = collection(db, 'messages');
    const docRef = await addDoc(messagesRef, {
      ...messageData,
      status: 'unread',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Tüm mesajları getir (admin için)
  async getAllMessages() {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// Deneyler servisi
export const ExperimentService = {
  // Tüm deneyleri getir
  async getAll() {
    const experimentsRef = collection(db, 'experiments');
    const q = query(experimentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Tek deney getir
  async getById(id) {
    const experimentRef = doc(db, 'experiments', id);
    const snapshot = await getDoc(experimentRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  },

  // Deney oluştur
  async create(experimentData) {
    const experimentsRef = collection(db, 'experiments');
    const docRef = await addDoc(experimentsRef, {
      ...experimentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Deney güncelle
  async update(id, experimentData) {
    const experimentRef = doc(db, 'experiments', id);
    await updateDoc(experimentRef, {
      ...experimentData,
      updatedAt: serverTimestamp()
    });
  },

  // Deney sil
  async delete(id) {
    const experimentRef = doc(db, 'experiments', id);
    await deleteDoc(experimentRef);
  }
};

// Blog postları servisi
export const BlogPostService = {
  // Tüm blog postlarını getir
  async getAll() {
    const blogPostsRef = collection(db, 'blogPosts');
    const q = query(blogPostsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Tek blog postu getir
  async getById(id) {
    const blogPostRef = doc(db, 'blogPosts', id);
    const snapshot = await getDoc(blogPostRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  },

  // Blog postu oluştur
  async create(blogPostData) {
    const blogPostsRef = collection(db, 'blogPosts');
    const docRef = await addDoc(blogPostsRef, {
      ...blogPostData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Blog postu güncelle
  async update(id, blogPostData) {
    const blogPostRef = doc(db, 'blogPosts', id);
    await updateDoc(blogPostRef, {
      ...blogPostData,
      updatedAt: serverTimestamp()
    });
  },

  // Blog postu sil
  async delete(id) {
    const blogPostRef = doc(db, 'blogPosts', id);
    await deleteDoc(blogPostRef);
  }
};

// İlhamlar servisi
export const InspirationService = {
  // Tüm ilhamları getir
  async getAll() {
    const inspirationsRef = collection(db, 'inspirations');
    const q = query(inspirationsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Kategoriye göre ilhamları getir
  async getByCategory(category) {
    const inspirationsRef = collection(db, 'inspirations');
    const q = query(
      inspirationsRef, 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Tek ilham getir
  async getById(id) {
    const inspirationRef = doc(db, 'inspirations', id);
    const snapshot = await getDoc(inspirationRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  },

  // İlham oluştur
  async create(inspirationData) {
    const inspirationsRef = collection(db, 'inspirations');
    const docRef = await addDoc(inspirationsRef, {
      ...inspirationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // İlham güncelle
  async update(id, inspirationData) {
    const inspirationRef = doc(db, 'inspirations', id);
    await updateDoc(inspirationRef, {
      ...inspirationData,
      updatedAt: serverTimestamp()
    });
  },

  // İlham sil
  async delete(id) {
    const inspirationRef = doc(db, 'inspirations', id);
    await deleteDoc(inspirationRef);
  }
};